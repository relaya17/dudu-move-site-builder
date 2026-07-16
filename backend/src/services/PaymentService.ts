/**
 * תשלומים ללקוח קצה (הובלה) — כרטיס / העברה / Open Banking.
 * במצב ללא מפתחות סליקה: card_demo מאפשר אישור תשלום להדגמה.
 * חיבור לספק אמיתי (Cardcom/Tranzila/Stripe) דרך PAYMENT_PROVIDER + מפתחות env.
 */

import { MoveEstimate } from '../database/models/MoveEstimate';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { OnlinePaymentInfo } from 'shared';
import { tenantFilter } from '../lib/tenantFilter';

function makeReference(token: string): string {
    return `MV-${token.slice(0, 8).toUpperCase()}`;
}

function defaultBankTransfer(businessName: string, reference: string): NonNullable<OnlinePaymentInfo['bankTransfer']> {
    return {
        bankName: process.env.BUSINESS_BANK_NAME || 'בנק לאומי',
        accountName: process.env.BUSINESS_BANK_ACCOUNT_NAME || businessName,
        accountNumber: process.env.BUSINESS_BANK_ACCOUNT || '12-345-678901',
        branch: process.env.BUSINESS_BANK_BRANCH || '800',
        iban: process.env.BUSINESS_BANK_IBAN || undefined,
        instructionsHe:
            `העבירו את הסכום לחשבון המופיע, וציינו באסמכתא: ${reference}. ` +
            'לאחר ההעברה לחצו "סיימתי להעביר" בעמוד המעקב. אימות Open Banking מלא דורש ספק מורשה.',
    };
}

export class PaymentService {
    static getProviderMode(): 'demo' | 'provider' {
        const p = (process.env.PAYMENT_PROVIDER || 'demo').toLowerCase();
        return p === 'stripe' || p === 'cardcom' || p === 'tranzila' ? 'provider' : 'demo';
    }

    static async getOrInitPayment(token: string): Promise<OnlinePaymentInfo | null> {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) return null;

        if (estimate.payment?.reference) {
            return this.toPublic(estimate.payment);
        }

        const settings = await BusinessSettings.findOne(
            tenantFilter(estimate.tenantId ? String(estimate.tenantId) : undefined)
        );
        const amount = estimate.totalPrice || 0;
        const reference = makeReference(token);
        const businessName = settings?.businessName || 'דוד הובלות';

        estimate.payment = {
            status: 'unpaid',
            amount,
            currency: 'ILS',
            reference,
            openBankingStatus: 'none',
            lastUpdatedAt: new Date(),
            bankTransfer: defaultBankTransfer(businessName, reference),
        };
        await estimate.save();
        return this.toPublic(estimate.payment);
    }

    static async initiateCardPayment(token: string): Promise<{ payment: OnlinePaymentInfo; checkoutUrl?: string; demo: boolean } | null> {
        const payment = await this.getOrInitPayment(token);
        if (!payment) return null;

        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate?.payment) return null;

        const mode = this.getProviderMode();
        if (mode === 'provider' && process.env.STRIPE_SECRET_KEY) {
            // נקודת הרחבה לסליקה אמיתית — ללא יצירת session בלי SDK מותקן
            estimate.payment.status = 'pending';
            estimate.payment.channel = 'card_provider';
            estimate.payment.lastUpdatedAt = new Date();
            await estimate.save();
            return {
                payment: this.toPublic(estimate.payment),
                checkoutUrl: process.env.PAYMENT_CHECKOUT_URL || undefined,
                demo: false,
            };
        }

        estimate.payment.status = 'pending';
        estimate.payment.channel = 'card_demo';
        estimate.payment.lastUpdatedAt = new Date();
        await estimate.save();
        return {
            payment: this.toPublic(estimate.payment),
            demo: true,
        };
    }

    /** אישור תשלום בכרטיס (מצב הדגמה) או סימון לאחר webhook בעתיד. */
    static async confirmCardDemoPayment(token: string): Promise<OnlinePaymentInfo | null> {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate?.payment) return null;

        estimate.payment.status = 'paid';
        estimate.payment.channel = 'card_demo';
        estimate.payment.paidAt = new Date();
        estimate.payment.lastUpdatedAt = new Date();
        estimate.payment.providerPaymentId = `demo_${Date.now()}`;
        await estimate.save();
        return this.toPublic(estimate.payment);
    }

    static async markBankTransferPending(token: string): Promise<OnlinePaymentInfo | null> {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) return null;
        await this.getOrInitPayment(token);
        const fresh = await MoveEstimate.findOne({ trackingToken: token });
        if (!fresh?.payment) return null;

        fresh.payment.status = 'pending';
        fresh.payment.channel = 'bank_transfer';
        fresh.payment.lastUpdatedAt = new Date();
        await fresh.save();
        return this.toPublic(fresh.payment);
    }

    /** בקשת חיבור Open Banking (Open Finance ישראל) — סטטוס pending עד ספק מורשה. */
    static async requestOpenBankingLink(token: string): Promise<OnlinePaymentInfo | null> {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) return null;
        await this.getOrInitPayment(token);
        const fresh = await MoveEstimate.findOne({ trackingToken: token });
        if (!fresh?.payment) return null;

        fresh.payment.openBankingStatus = 'pending';
        fresh.payment.channel = 'open_banking';
        fresh.payment.status = fresh.payment.status === 'paid' ? 'paid' : 'pending';
        fresh.payment.lastUpdatedAt = new Date();
        await fresh.save();
        return this.toPublic(fresh.payment);
    }

    private static toIso(value: Date | string | undefined): string | undefined {
        if (!value) return undefined;
        if (value instanceof Date) return value.toISOString();
        return String(value);
    }

    private static toPublic(payment: OnlinePaymentInfo<Date> | OnlinePaymentInfo<string>): OnlinePaymentInfo {
        return {
            status: payment.status,
            channel: payment.channel,
            amount: payment.amount,
            currency: 'ILS',
            reference: payment.reference,
            providerPaymentId: payment.providerPaymentId,
            paidAt: this.toIso(payment.paidAt as Date | string | undefined),
            lastUpdatedAt: this.toIso(payment.lastUpdatedAt as Date | string | undefined),
            openBankingStatus: payment.openBankingStatus || 'none',
            bankTransfer: payment.bankTransfer,
        };
    }
}
