export interface Building {
  id: string;
  name: string;
  district: string;
  street: string;
  floors: number;
  unitsPerFloor: number;
  totalUnits: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  lat: number;
  lng: number;
  builtYear: number;
  propertyManager: string;
  phone: string;
}

export type HouseStatus = 'normal' | 'vacant_warning' | 'sublet_warning' | 'available' | 'overdue_rent';

export interface House {
  id: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  unit: string;
  roomNumber: string;
  area: number;
  layout: string;
  monthlyRent: number;
  status: HouseStatus;
  tenantId?: string;
  checkInDate?: string;
  lastPaymentDate?: string;
  overdueDays?: number;
  warningCount?: number;
}

export interface Tenant {
  id: string;
  houseId: string;
  buildingId: string;
  name: string;
  idCard: string;
  phone: string;
  familyMembers: number;
  monthlyIncome: number;
  subsidyRatio: number;
  actualRent: number;
  leaseStart: string;
  leaseEnd: string;
  emergencyContact: string;
  emergencyPhone: string;
  applyDate: string;
}

export interface AccessRecord {
  id: string;
  buildingId: string;
  houseId?: string;
  tenantId?: string;
  personName: string;
  faceImage?: string;
  accessType: 'in' | 'out';
  timestamp: string;
  isMatched: boolean;
  matchConfidence?: number;
  isTenant: boolean;
  remark?: string;
}

export type RepairType = 'water' | 'electricity' | 'gas' | 'doors_windows' | 'appliance';
export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'escalated';

export interface RepairOrder {
  id: string;
  houseId: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  tenantId?: string;
  tenantName: string;
  tenantPhone: string;
  type: RepairType;
  typeName: string;
  title: string;
  description: string;
  status: RepairStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportTime: string;
  assignedTime?: string;
  startTime?: string;
  completedTime?: string;
  assignee?: string;
  assigneePhone?: string;
  cost?: number;
  rating?: number;
  feedback?: string;
}

export type ApprovalStage = 'street' | 'district' | 'city';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type IncomeTrend = 'up' | 'down' | 'stable' | 'unknown';

export interface MissingHistoryInfo {
  missingItems: string[];
  missingPeriod: string;
  impactItems: string[];
}

export interface Approval {
  id: string;
  tenantId: string;
  tenantName: string;
  houseId: string;
  buildingName: string;
  roomNumber: string;
  applyType: string;
  applyAmount: number;
  approvedAmount?: number;
  subsidyRatio?: number;
  previousSubsidyRatio?: number;
  originalIncome?: number;
  currentIncome?: number;
  incomeChangePercent?: number;
  incomeTrend?: IncomeTrend;
  previousRent?: number;
  suggestedRent?: number;
  rentChangeAmount?: number;
  hasHistoryBasis?: boolean;
  missingHistoryInfo?: MissingHistoryInfo;
  isHighRisk?: boolean;
  highRiskReasons?: string[];
  currentStage: ApprovalStage;
  status: ApprovalStatus;
  applyDate: string;
  streetApprover?: string;
  streetApproveTime?: string;
  streetOpinion?: string;
  districtApprover?: string;
  districtApproveTime?: string;
  districtOpinion?: string;
  cityApprover?: string;
  cityApproveTime?: string;
  cityOpinion?: string;
  remark?: string;
  submitter?: string;
  submitTime?: string;
}

export interface EnergyMonth {
  month: string;
  electricity: number;
  water: number;
  gas: number;
  electricityBudget: number;
  waterBudget: number;
  gasBudget: number;
}

export interface EnergyStat {
  id: string;
  buildingId: string;
  buildingName: string;
  months: EnergyMonth[];
  totalElectricity: number;
  totalWater: number;
  totalGas: number;
  totalElectricityBudget: number;
  totalWaterBudget: number;
  totalGasBudget: number;
  isOverBudget: boolean;
  overBudgetItems: string[];
}

export type UserRole = 'tenant' | 'property' | 'staff' | 'district_director' | 'city_director';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  buildingId?: string;
  houseId?: string;
  district?: string;
  city?: string;
}

export type ViewMode = 'community' | 'building' | 'house';

export type WarningType = 'vacant' | 'sublet';

export interface Warning {
  id: string;
  type: WarningType;
  houseId: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  tenantName?: string;
  description: string;
  detectedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  level: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}
