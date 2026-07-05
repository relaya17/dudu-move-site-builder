// טיפוסים אלו תואמים במדויק למבנה השטוח שמוחזר מהשרת (Mongoose IMoveEstimate),
// כולל שדות המעקב אחרי ההובלה (trackingToken, stage, location וכו').
// מקור האמת המשותף עם ה-backend נמצא בחבילת shared.

export { TRACKING_STAGES, TRACKING_STAGE_LABELS } from 'shared';

export type {
  EstimateStatus,
  TrackingStage,
  FurnitureItem,
  StageHistoryEntry,
  TrackingLocation,
  MoveEstimateDTO as MovingEstimateRequest
} from 'shared';
