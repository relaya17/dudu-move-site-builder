// הערה: יש להעדיף ייצוא מפורש (במקום `export * from`) - חבילות CJS מקומפלות
// עם ייצוא-כוכבית (`__exportStar`) אינן ניתנות לניתוח סטטי על ידי Rollup/Vite,
// מה שגורם לכשל build ("X is not exported by shared/dist/index.js") בצד ה-frontend.
export { EstimateStatus, ESTIMATE_STATUSES, ESTIMATE_STATUS_LABELS } from './estimateStatus';

export {
    TRACKING_STAGES,
    TrackingStage,
    TRACKING_STAGE_LABELS,
    DateLike,
    StageHistoryEntry,
    TrackingLocation,
    TrackingViewDTO
} from './tracking';

export { FurnitureItem } from './furniture';

export { MoveEstimateDTO } from './moveEstimate';

export { ApiResponse } from './apiResponse';
