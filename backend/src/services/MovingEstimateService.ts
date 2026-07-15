import crypto from 'crypto';
import { EstimateStatus } from 'shared';
import { MoveEstimate } from '../database/models/MoveEstimate';
import { CreateCustomerRequest } from '../types/moveTypes';
import { customerSchema, moveDetailsSchema, furnitureItemSchema } from '../middleware/validation';
import { PricingService } from './PricingService';
import { MongoService } from './MongoService';
import { EmailService } from './EmailService';
import { tenantFilter } from '../lib/tenantFilter';
import { eventBus } from './EventBus';
import { AuditService } from './AuditService';

export class MovingEstimateService {
    /**
     * יצירת בקשת הערכת מעבר חדשה.
     * - מוודא תקינות הנתונים
     * - מחשב מחיר משוער
     * - שומר את הבקשה במסד הנתונים (MongoDB)
     * - יוצר טוקן מעקב ושולח מייל אישור עם קישור למעקב
     */
    static async submitEstimateRequest(
        customerData: CreateCustomerRequest,
        moveData: {
            apartment_type: string;
            preferred_move_date: string;
            current_address: string;
            destination_address: string;
            additional_notes: string;
            origin_floor: number;
            destination_floor: number;
            origin_has_elevator: boolean;
            destination_has_elevator: boolean;
            origin_has_crane: boolean;
            destination_has_crane: boolean;
            /** מספר חדרים — לתמחור מדויק יותר מסוג השירות בעברית. */
            origin_rooms?: number;
        },
        furnitureItems: Array<{
            name: string;
            quantity: number;
            isFragile?: boolean;
            needsDisassemble?: boolean;
            needsReassemble?: boolean;
            needsDoorRemoval?: boolean;
            comments?: string;
        }>,
        // tenantId אופציונלי - ריק עבור האתר הישן/הזרימה החד-דיירית של דוד הובלות,
        // מוגדר כשההזמנה מגיעה מטופס ההערכה של דייר/מוביל ספציפי שנרשם למערכת.
        tenantId?: string
    ) {
        try {
            // ולידציה של הנתונים
            await customerSchema.parseAsync(customerData);
            await moveDetailsSchema.parseAsync(moveData);
            for (const item of furnitureItems) {
                await furnitureItemSchema.parseAsync(item);
            }

            // חישוב הפרש קומות
            const floorDifference = Math.abs(moveData.destination_floor - moveData.origin_floor);

            // חישוב מחיר משוער
            const mappedFurnitureItems = furnitureItems.map(item => ({
                type: item.name,
                quantity: item.quantity,
                description: item.comments || '',
                needsDoorRemoval: item.needsDoorRemoval || false
            }));

            const priceEstimate = PricingService.calculateTotalPrice(
                // prefer numeric room count / apartment size keys over Hebrew move-type labels
                String(moveData.origin_rooms || moveData.apartment_type || ''),
                mappedFurnitureItems,
                floorDifference,
                moveData.origin_has_elevator && moveData.destination_has_elevator,
                moveData.origin_has_crane,
                moveData.destination_has_crane
            );

            const trackingToken = crypto.randomBytes(12).toString('hex');

            const estimate = new MoveEstimate({
                tenantId: tenantId || undefined,
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                apartmentType: moveData.apartment_type,
                preferredMoveDate: moveData.preferred_move_date,
                currentAddress: moveData.current_address,
                destinationAddress: moveData.destination_address,
                additionalNotes: moveData.additional_notes,
                originFloor: moveData.origin_floor,
                destinationFloor: moveData.destination_floor,
                originHasElevator: moveData.origin_has_elevator,
                destinationHasElevator: moveData.destination_has_elevator,
                originHasCrane: moveData.origin_has_crane,
                destinationHasCrane: moveData.destination_has_crane,
                inventory: furnitureItems.map(item => ({
                    type: item.name,
                    quantity: item.quantity,
                    description: item.comments || '',
                    isFragile: item.isFragile || false,
                    needsDisassemble: item.needsDisassemble || false,
                    needsReassemble: item.needsReassemble || false,
                    needsDoorRemoval: item.needsDoorRemoval || false,
                    comments: item.comments || ''
                })),
                totalPrice: priceEstimate,
                status: 'pending',
                trackingToken,
                stage: 'order_placed',
                stageHistory: [{ stage: 'order_placed', at: new Date() }]
            });

            const savedEstimate = await estimate.save();

            // Emit event for automations
            eventBus.emit('estimate.created', {
                estimateId: String(savedEstimate._id),
                tenantId,
                customerEmail: customerData.email || '',
                totalPrice: priceEstimate,
                moveDate: moveData.preferred_move_date
            });

            // Log to audit
            AuditService.logSystem('create', 'estimate', tenantId, String(savedEstimate._id), {
                customerEmail: customerData.email,
                totalPrice: priceEstimate,
                moveDate: moveData.preferred_move_date
            });

            // עדכון/יצירת נתוני לקוח (לא קריטי - לא נכשיל את הבקשה אם זה נכשל)
            await MongoService.updateCustomerStats(
                customerData.email || '',
                customerData.name,
                customerData.phone,
                priceEstimate,
                tenantId
            );

            // שליחת מייל אישור עם קישור למעקב (לא קריטי - לא נכשיל את הבקשה אם זה נכשל)
            if (customerData.email) {
                EmailService.sendConfirmationEmail({
                    to: customerData.email,
                    name: customerData.name,
                    trackingToken
                }).catch(err => console.error('שגיאה בשליחת מייל אישור:', err));
            }

            return {
                id: String(savedEstimate._id),
                trackingToken,
                priceEstimate
            };
        } catch (error) {
            console.error('שגיאה בשליחת הערכת מעבר:', error);
            throw error;
        }
    }

    /**
     * קבלת כל בקשות הערכת המחיר
     * tenantId אופציונלי - ר' lib/tenantFilter.ts. חשוב: זה נתיב מקביל
     * ל-MongoService.getAllMoveEstimates (חשוף דרך /api/move-requests ולא
     * /api/mongo/estimates) - חייב לסנן באותו אופן בדיוק, אחרת דייר אחד
     * (או מי שמחזיק ב-admin key) יכול לראות הזמנות של דיירים אחרים.
     */
    static async getAllMoveRequests(tenantId?: string) {
        try {
            return await MoveEstimate.find(tenantFilter(tenantId)).sort({ createdAt: -1 });
        } catch (error) {
            console.error('שגיאה בשליפת בקשות הערכת מחיר:', error);
            throw error;
        }
    }

    /**
     * קבלת בקשת הערכת מחיר לפי ID
     */
    static async getMoveRequestById(id: string, tenantId?: string) {
        try {
            const estimate = await MoveEstimate.findOne({ _id: id, ...tenantFilter(tenantId) });
            if (!estimate) {
                throw new Error('בקשת הערכת המחיר לא נמצאה');
            }
            return estimate;
        } catch (error) {
            console.error('שגיאה בשליפת בקשת הערכת מחיר:', error);
            throw error;
        }
    }

    /**
     * עדכון סטטוס בקשת הערכת מחיר
     */
    static async updateMoveRequestStatus(id: string, status: EstimateStatus, tenantId?: string) {
        try {
            // First get the current status
            const current = await MoveEstimate.findOne({ _id: id, ...tenantFilter(tenantId) });
            if (!current) {
                throw new Error('בקשת הערכת המחיר לא נמצאה');
            }
            const oldStatus = current.status;

            const estimate = await MoveEstimate.findOneAndUpdate(
                { _id: id, ...tenantFilter(tenantId) },
                { status },
                { new: true, runValidators: true }
            );
            if (!estimate) {
                throw new Error('בקשת הערכת המחיר לא נמצאה');
            }

            // Emit status change event
            if (oldStatus !== status) {
                eventBus.emit('estimate.status_changed', {
                    estimateId: id,
                    tenantId,
                    oldStatus,
                    newStatus: status
                });

                AuditService.logSystem('status_change', 'estimate', tenantId, id, {
                    oldStatus,
                    newStatus: status
                });
            }

            return { success: true };
        } catch (error) {
            console.error('שגיאה בעדכון סטטוס בקשת הערכת מחיר:', error);
            throw error;
        }
    }
}
