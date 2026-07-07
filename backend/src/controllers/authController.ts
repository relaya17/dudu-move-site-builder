import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Business } from '../database/models/Business';
import { User } from '../database/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'movalo-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';

function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export class AuthController {
    /**
     * POST /api/auth/register
     * יוצר חשבון עסק חדש (Business/tenant) + משתמש owner ראשון.
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { businessName, ownerName, email, password } = req.body as {
                businessName?: string;
                ownerName?: string;
                email?: string;
                password?: string;
            };

            if (!businessName?.trim()) {
                res.status(400).json({ success: false, message: 'שם העסק הוא שדה חובה' });
                return;
            }
            if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.status(400).json({ success: false, message: 'כתובת אימייל לא תקינה' });
                return;
            }
            if (!password || password.length < 8) {
                res.status(400).json({ success: false, message: 'הסיסמה חייבת להכיל לפחות 8 תווים' });
                return;
            }
            if (!ownerName?.trim()) {
                res.status(400).json({ success: false, message: 'שם מלא הוא שדה חובה' });
                return;
            }

            const emailLower = email.toLowerCase().trim();

            const existing = await Business.findOne({ ownerEmail: emailLower });
            if (existing) {
                res.status(409).json({ success: false, message: 'כתובת אימייל זו כבר רשומה במערכת' });
                return;
            }

            // יצירת slug ייחודי
            let baseSlug = slugify(businessName);
            if (!baseSlug) baseSlug = 'business';
            let slug = baseSlug;
            let suffix = 1;
            while (await Business.findOne({ slug })) {
                slug = `${baseSlug}-${suffix++}`;
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const business = await Business.create({
                ownerEmail: emailLower,
                passwordHash,
                businessName: businessName.trim(),
                slug,
                subscriptionStatus: 'trial'
            });

            // יוצר גם משתמש Owner בטבלת Users
            await User.create({
                businessId: business._id,
                name: ownerName.trim(),
                email: emailLower,
                passwordHash,
                role: 'owner'
            });

            const token = signToken({ tenantId: business.id, role: 'owner' });

            res.status(201).json({
                success: true,
                token,
                business: {
                    id: business._id,
                    businessName: business.businessName,
                    slug: business.slug,
                    subscriptionStatus: business.subscriptionStatus
                }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית בהרשמה' });
        }
    }

    /**
     * POST /api/auth/login
     * מחובר ל-Business (בעל עסק) או ל-User (עובד/מנהל) לפי האימייל.
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body as { email?: string; password?: string };

            if (!email?.trim() || !password) {
                res.status(400).json({ success: false, message: 'יש למלא אימייל וסיסמה' });
                return;
            }

            const emailLower = email.toLowerCase().trim();

            // ניסיון 1: התחברות כבעל עסק (owner)
            const business = await Business.findOne({ ownerEmail: emailLower }).select('+passwordHash');
            if (business) {
                const valid = await bcrypt.compare(password, business.passwordHash);
                if (!valid) {
                    res.status(401).json({ success: false, message: 'אימייל או סיסמה שגויים' });
                    return;
                }
                const token = signToken({ tenantId: business.id, role: 'owner' });
                res.json({
                    success: true,
                    token,
                    role: 'owner',
                    business: {
                        id: business._id,
                        businessName: business.businessName,
                        slug: business.slug,
                        subscriptionStatus: business.subscriptionStatus
                    }
                });
                return;
            }

            // ניסיון 2: התחברות כעובד (User)
            const user = await User.findOne({ email: emailLower }).select('+passwordHash');
            if (!user || !user.isActive) {
                res.status(401).json({ success: false, message: 'אימייל או סיסמה שגויים' });
                return;
            }
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) {
                res.status(401).json({ success: false, message: 'אימייל או סיסמה שגויים' });
                return;
            }
            const ownerBusiness = await Business.findById(user.businessId);
            if (!ownerBusiness) {
                res.status(403).json({ success: false, message: 'חשבון העסק לא נמצא' });
                return;
            }

            user.lastLoginAt = new Date();
            await user.save();

            const token = signToken({
                tenantId: user.businessId.toString(),
                userId: user.id,
                role: user.role
            });

            res.json({
                success: true,
                token,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                business: {
                    id: ownerBusiness._id,
                    businessName: ownerBusiness.businessName,
                    slug: ownerBusiness.slug,
                    subscriptionStatus: ownerBusiness.subscriptionStatus
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית בהתחברות' });
        }
    }

    /**
     * GET /api/auth/me — מחזיר פרטי חשבון העסק המחובר
     */
    static async me(req: Request, res: Response): Promise<void> {
        try {
            const business = await Business.findById(req.tenantId).lean();
            if (!business) {
                res.status(404).json({ success: false, message: 'חשבון לא נמצא' });
                return;
            }
            res.json({
                success: true,
                business: {
                    id: business._id,
                    businessName: business.businessName,
                    slug: business.slug,
                    subscriptionStatus: business.subscriptionStatus,
                    ownerEmail: business.ownerEmail
                }
            });
        } catch (error) {
            console.error('Me error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית' });
        }
    }

    /**
     * POST /api/auth/employees — הוספת עובד לחשבון העסק
     */
    static async addEmployee(req: Request, res: Response): Promise<void> {
        try {
            const businessId = req.tenantId!;
            const { name, email, password, role } = req.body as {
                name?: string;
                email?: string;
                password?: string;
                role?: string;
            };

            if (!name?.trim() || !email?.trim() || !password || !role) {
                res.status(400).json({ success: false, message: 'יש למלא את כל השדות' });
                return;
            }
            if (!['manager', 'driver'].includes(role)) {
                res.status(400).json({ success: false, message: 'תפקיד לא חוקי. יש לבחור: manager / driver' });
                return;
            }
            if (password.length < 8) {
                res.status(400).json({ success: false, message: 'הסיסמה חייבת להכיל לפחות 8 תווים' });
                return;
            }

            const emailLower = email.toLowerCase().trim();
            const existing = await User.findOne({ businessId, email: emailLower });
            if (existing) {
                res.status(409).json({ success: false, message: 'עובד עם אימייל זה כבר קיים בעסק' });
                return;
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const employee = await User.create({ businessId, name: name.trim(), email: emailLower, passwordHash, role });

            res.status(201).json({
                success: true,
                employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
            });
        } catch (error) {
            console.error('Add employee error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית' });
        }
    }

    /**
     * GET /api/auth/employees — רשימת עובדי העסק
     */
    static async listEmployees(req: Request, res: Response): Promise<void> {
        try {
            const employees = await User.find({ businessId: req.tenantId }).select('-passwordHash').lean();
            res.json({ success: true, data: employees });
        } catch (error) {
            console.error('List employees error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית' });
        }
    }

    /**
     * DELETE /api/auth/employees/:id — מחיקת עובד
     */
    static async deleteEmployee(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await User.findOneAndDelete({ _id: id, businessId: req.tenantId });
            if (!deleted) {
                res.status(404).json({ success: false, message: 'עובד לא נמצא' });
                return;
            }
            res.json({ success: true, message: 'העובד נמחק בהצלחה' });
        } catch (error) {
            console.error('Delete employee error:', error);
            res.status(500).json({ success: false, message: 'שגיאה פנימית' });
        }
    }
}
