// טיפוסים אלו תואמים במדויק למבנה השטוח שמוחזר מהשרת (Mongoose IMoveEstimate),
// כולל שדות המעקב אחרי ההובלה (trackingToken, stage, location וכו').

export interface FurnitureItem {
  type: string;
  quantity: number;
  description?: string;
  isFragile?: boolean;
  needsDisassemble?: boolean;
  needsReassemble?: boolean;
  comments?: string;
}

export type EstimateStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type TrackingStage =
  | 'order_placed'
  | 'confirmed'
  | 'packing_disassembly'
  | 'in_transit'
  | 'unloading_assembly'
  | 'completed';

export const TRACKING_STAGES: TrackingStage[] = [
  'order_placed',
  'confirmed',
  'packing_disassembly',
  'in_transit',
  'unloading_assembly',
  'completed'
];

export const TRACKING_STAGE_LABELS: Record<TrackingStage, string> = {
  order_placed: 'ההזמנה התקבלה',
  confirmed: 'ההזמנה אושרה',
  packing_disassembly: 'פירוק ואריזה',
  in_transit: 'בדרך ליעד',
  unloading_assembly: 'פריקה והרכבה',
  completed: 'ההובלה הושלמה'
};

export interface StageHistoryEntry {
  stage: TrackingStage;
  at: string;
  note?: string;
}

export interface TrackingLocation {
  lat: number;
  lng: number;
  address?: string;
  updatedAt: string;
}

export interface MovingEstimateRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  apartmentType: string;
  preferredMoveDate: string;
  currentAddress: string;
  destinationAddress: string;
  additionalNotes?: string;
  originFloor: number;
  destinationFloor: number;
  originHasElevator: boolean;
  destinationHasElevator: boolean;
  originHasCrane: boolean;
  destinationHasCrane: boolean;
  inventory: FurnitureItem[];
  totalPrice: number;
  status: EstimateStatus;
  trackingToken: string;
  stage: TrackingStage;
  stageHistory: StageHistoryEntry[];
  location?: TrackingLocation;
  reminderEmailSentAt?: string;
  reminderSmsSentAt?: string;
  createdAt: string;
  updatedAt: string;
}
