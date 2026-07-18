import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { TRACKING_STAGES, TrackingStage, TrackingViewDTO } from 'shared';
import { tenantFilter } from '../lib/tenantFilter';

const FALLBACK_CONTACT = {
    businessName: 'דוד הובלות',
    phone: '0547777623',
    email: 'davidgueta3232@gmail.com',
    address: 'אילת, ישראל',
};

function toIso(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString();
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
}

export class TrackingService {
    static isValidStage(stage: string): stage is TrackingStage {
        return (TRACKING_STAGES as readonly string[]).includes(stage);
    }

    static async getByToken(token: string): Promise<TrackingViewDTO | null> {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    static async updateStage(token: string, stage: string, note?: string) {
        if (!TrackingService.isValidStage(stage)) {
            throw new Error('שלב מעקב לא תקין');
        }

        const estimate = await MoveEstimate.findOneAndUpdate(
            { trackingToken: token },
            {
                $set: { stage },
                $push: { stageHistory: { stage, at: new Date(), note } }
            },
            { new: true }
        );

        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    static async updateLocation(token: string, lat: number, lng: number, address?: string) {
        const estimate = await MoveEstimate.findOneAndUpdate(
            { trackingToken: token },
            { $set: { location: { lat, lng, address, updatedAt: new Date() } } },
            { new: true }
        );

        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    /**
     * נתונים להדפסה/הורדה של מסמך ללקוח (לפי טוקן מעקב בלבד).
     */
    static async getPrintableDocuments(token: string) {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) return null;

        const settings = await BusinessSettings.findOne(
            tenantFilter(estimate.tenantId ? String(estimate.tenantId) : undefined)
        );

        return {
            business: {
                businessName: settings?.businessName || FALLBACK_CONTACT.businessName,
                businessId: settings?.businessId || '',
                businessType: settings?.businessType || 'licensed',
                address: settings?.address || FALLBACK_CONTACT.address,
                phone: settings?.phone || FALLBACK_CONTACT.phone,
                email: settings?.email || FALLBACK_CONTACT.email,
                vatRate: settings?.vatRate ?? 18,
                invoiceProvider: settings?.invoiceProvider || 'built_in',
                greenInvoiceConfigured: false,
                nextDocumentNumber: settings?.nextDocumentNumber ?? 1000,
            },
            estimate: {
                name: estimate.name,
                phone: estimate.phone,
                email: estimate.email,
                currentAddress: estimate.currentAddress,
                destinationAddress: estimate.destinationAddress,
                preferredMoveDate: estimate.preferredMoveDate,
                totalPrice: estimate.totalPrice,
                apartmentType: estimate.apartmentType,
                quote: estimate.quote || null,
                invoice: estimate.invoice || null,
                inventory: estimate.inventory || [],
            },
        };
    }

    /**
     * מחזיר תצוגה ציבורית ומצומצמת של ההזמנה - ללא חשיפת מזהי מסד הנתונים הפנימיים.
     */
    static async toPublicView(estimate: IMoveEstimate): Promise<TrackingViewDTO> {
        const settings = await BusinessSettings.findOne(
            tenantFilter(estimate.tenantId ? String(estimate.tenantId) : undefined)
        );

        const invoice = estimate.invoice;
        const quote = estimate.quote;

        return {
            trackingToken: estimate.trackingToken,
            name: estimate.name,
            apartmentType: estimate.apartmentType,
            preferredMoveDate: estimate.preferredMoveDate
                ? String(estimate.preferredMoveDate)
                : '',
            currentAddress: estimate.currentAddress,
            destinationAddress: estimate.destinationAddress,
            status: estimate.status,
            stage: estimate.stage,
            stages: TRACKING_STAGES,
            stageHistory: (estimate.stageHistory || []).map(h => ({
                stage: h.stage,
                at: toIso(h.at),
                note: h.note,
            })),
            location:
                estimate.location &&
                typeof estimate.location.lat === 'number' &&
                typeof estimate.location.lng === 'number'
                    ? {
                        lat: estimate.location.lat,
                        lng: estimate.location.lng,
                        address: estimate.location.address,
                        updatedAt: estimate.location.updatedAt
                            ? toIso(estimate.location.updatedAt)
                            : '',
                    }
                    : null,
            reminderEmailSentAt: estimate.reminderEmailSentAt
                ? toIso(estimate.reminderEmailSentAt)
                : null,
            reminderSmsSentAt: estimate.reminderSmsSentAt
                ? toIso(estimate.reminderSmsSentAt)
                : null,
            createdAt: toIso(estimate.createdAt),
            documents: {
                quote: quote?.quoteNumber
                    ? {
                        quoteNumber: quote.quoteNumber,
                        generatedAt: toIso(quote.generatedAt),
                    }
                    : null,
                invoice: invoice?.documentNumber
                    ? {
                        documentNumber: invoice.documentNumber,
                        documentUrl: invoice.documentUrl || '',
                        issuedAt: toIso(invoice.issuedAt),
                        docType: invoice.docType,
                        printable: invoice.providerId === 'built_in' || !invoice.documentUrl,
                    }
                    : null,
                totalPrice: typeof estimate.totalPrice === 'number' ? estimate.totalPrice : null,
            },
            businessContact: {
                businessName: settings?.businessName || FALLBACK_CONTACT.businessName,
                phone: settings?.phone || FALLBACK_CONTACT.phone,
                email: settings?.email || FALLBACK_CONTACT.email,
                address: settings?.address || FALLBACK_CONTACT.address,
            },
            payment: estimate.payment?.reference
                ? {
                    status: estimate.payment.status || 'unpaid',
                    channel: estimate.payment.channel,
                    amount: estimate.payment.amount ?? estimate.totalPrice ?? 0,
                    currency: 'ILS' as const,
                    reference: estimate.payment.reference,
                    paidAt: estimate.payment.paidAt ? toIso(estimate.payment.paidAt) : undefined,
                    openBankingStatus: estimate.payment.openBankingStatus || 'none',
                    bankTransfer: estimate.payment.bankTransfer
                        ? {
                            bankName: estimate.payment.bankTransfer.bankName || '',
                            accountName: estimate.payment.bankTransfer.accountName || '',
                            accountNumber: estimate.payment.bankTransfer.accountNumber || '',
                            branch: estimate.payment.bankTransfer.branch,
                            iban: estimate.payment.bankTransfer.iban,
                            instructionsHe: estimate.payment.bankTransfer.instructionsHe || '',
                        }
                        : undefined,
                }
                : null,
        };
    }
}
