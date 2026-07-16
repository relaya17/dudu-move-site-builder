// כלל: ערכים (const, enum) → export רגיל. טיפוסים בלבד (type, interface) → export type.
// זה קריטי כדי שVite/esbuild (שפועל ב-isolatedModules) יוכל למחוק טיפוסים נכון
// מבלי לנסות לייצא שמות שלא קיימים ב-runtime.

// ─── ערכים ───────────────────────────────────────────────────────────────────
export { ESTIMATE_STATUSES, ESTIMATE_STATUS_LABELS } from './estimateStatus';
export { TRACKING_STAGES, TRACKING_STAGE_LABELS } from './tracking';
export { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from './billing';
export { DEFAULT_TURBO_SETTINGS } from './businessSettings';

// ─── טיפוסים בלבד ────────────────────────────────────────────────────────────
export type { EstimateStatus } from './estimateStatus';
export type { TrackingStage, DateLike, StageHistoryEntry, TrackingLocation, TrackingViewDTO, TrackingDocumentSummary, TrackingBusinessContact } from './tracking';
export type { FurnitureItem } from './furniture';
export type { MoveEstimateDTO } from './moveEstimate';
export type { ApiResponse } from './apiResponse';
export type { QuoteDocumentInfo, InvoiceDocumentInfo, PaymentMethod } from './billing';
export type { InvoiceProvider, BusinessType, BusinessSettingsDTO, BusinessSettingsUpdateInput, TurboSettings } from './businessSettings';
