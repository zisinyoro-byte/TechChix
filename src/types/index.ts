// TechChix - Types for Broiler Management System

// Enum Types
export type FlockStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type FeedType = 'STARTER' | 'GROWER' | 'FINISHER' | 'PRE_STARTER' | 'CONCENTRATE';
export type MedicineType = 'VACCINE' | 'ANTIBIOTIC' | 'VITAMIN' | 'ANTIPARASITIC' | 'DISINFECTANT' | 'OTHER';
export type MortalityCause = 'DISEASE' | 'HEAT_STRESS' | 'COLD_STRESS' | 'INJURY' | 'PREDATION' | 'UNKNOWN' | 'OTHER';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AlertType = 'MORTALITY' | 'FEED_LOW' | 'ENVIRONMENT' | 'VACCINATION' | 'FINANCIAL' | 'SYSTEM';
export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Farm Types
export interface Farm {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  houses?: House[];
}

export interface House {
  id: string;
  name: string;
  capacity: number;
  farmId: string;
  createdAt: Date;
  updatedAt: Date;
  farm?: Farm;
  flocks?: Flock[];
  environment?: EnvironmentReading[];
}

// Flock Types
export interface Flock {
  id: string;
  batchNumber: string;
  breed: string;
  startDate: Date;
  endDate?: Date;
  initialCount: number;
  currentCount: number;
  status: FlockStatus;
  houseId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  house?: House;
  dailyRecords?: DailyRecord[];
  vaccinations?: Vaccination[];
  mortalities?: Mortality[];
  feedRecords?: FeedDistribution[];
  finances?: Financial[];
}

export interface DailyRecord {
  id: string;
  date: Date;
  flockId: string;
  mortality: number;
  culled: number;
  feedConsumed: number;
  waterConsumed: number;
  avgWeight?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  flock?: Flock;
}

// Feed Types
export interface Feed {
  id: string;
  name: string;
  type: FeedType;
  quantity: number;
  unitCost: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
  purchases?: FeedPurchase[];
  distributions?: FeedDistribution[];
}

export interface FeedPurchase {
  id: string;
  feedId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: Date;
  supplier?: string;
  invoiceNo?: string;
  notes?: string;
  createdAt: Date;
  feed?: Feed;
}

export interface FeedDistribution {
  id: string;
  feedId: string;
  flockId: string;
  quantity: number;
  distributedAt: Date;
  distributedBy?: string;
  notes?: string;
  createdAt: Date;
  feed?: Feed;
  flock?: Flock;
}

// Health Types
export interface Medicine {
  id: string;
  name: string;
  type: MedicineType;
  quantity: number;
  unit: string;
  unitCost: number;
  expiryDate?: Date;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
  vaccinations?: Vaccination[];
  treatments?: Treatment[];
}

export interface Vaccination {
  id: string;
  flockId: string;
  medicineId: string;
  vaccinationDate: Date;
  dosage: number;
  administeredBy?: string;
  method?: string;
  notes?: string;
  nextDueDate?: Date;
  createdAt: Date;
  flock?: Flock;
  medicine?: Medicine;
}

export interface Treatment {
  id: string;
  flockId: string;
  medicineId: string;
  treatmentDate: Date;
  dosage: number;
  duration?: number;
  administeredBy?: string;
  notes?: string;
  createdAt: Date;
  medicine?: Medicine;
}

export interface Mortality {
  id: string;
  flockId: string;
  date: Date;
  count: number;
  cause: MortalityCause;
  description?: string;
  notes?: string;
  createdAt: Date;
  flock?: Flock;
}

// Financial Types
export interface Financial {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  flockId?: string;
  referenceNo?: string;
  createdAt: Date;
  flock?: Flock;
}

// Environment Types
export interface EnvironmentReading {
  id: string;
  houseId: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  ammonia?: number;
  light?: number;
  timestamp: Date;
  source: string;
  house?: House;
}

export interface AlertThreshold {
  id: string;
  houseId?: string;
  parameter: string;
  minValue?: number;
  maxValue?: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  priority: AlertPriority;
  isRead: boolean;
  houseId?: string;
  flockId?: string;
  createdAt: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalBirds: number;
  activeFlocks: number;
  feedInventory: number;
  todayMortality: number;
  weeklyMortality: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Form Types
export interface FlockFormData {
  batchNumber: string;
  breed: string;
  startDate: string;
  initialCount: number;
  currentCount: number;
  houseId: string;
  notes?: string;
}

export interface DailyRecordFormData {
  date: string;
  mortality: number;
  culled: number;
  feedConsumed: number;
  waterConsumed: number;
  avgWeight?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
}

export interface FeedFormData {
  name: string;
  type: FeedType;
  quantity: number;
  unitCost: number;
  reorderLevel: number;
}

export interface VaccinationFormData {
  flockId: string;
  medicineId: string;
  vaccinationDate: string;
  dosage: number;
  administeredBy?: string;
  method?: string;
  notes?: string;
  nextDueDate?: string;
}

export interface FinancialFormData {
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  flockId?: string;
  referenceNo?: string;
}

export interface EnvironmentFormData {
  houseId: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  ammonia?: number;
  light?: number;
}
