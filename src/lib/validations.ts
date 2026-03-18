import { z } from 'zod'

// Flock Validation
export const flockSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  startDate: z.date(),
  initialCount: z.number().min(1, 'Initial count must be at least 1'),
  breed: z.string().min(1, 'Breed is required'),
  houseId: z.string().min(1, 'House is required'),
  notes: z.string().optional(),
})

export const dailyRecordSchema = z.object({
  date: z.date(),
  mortality: z.number().min(0, 'Mortality cannot be negative'),
  feedConsumed: z.number().min(0, 'Feed consumed cannot be negative'),
  waterConsumed: z.number().min(0, 'Water consumed cannot be negative'),
  avgWeight: z.number().min(0, 'Weight cannot be negative').optional(),
  notes: z.string().optional(),
})

// Feed Validation
export const feedSchema = z.object({
  name: z.string().min(1, 'Feed name is required'),
  type: z.enum(['starter', 'grower', 'finisher']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  supplier: z.string().optional(),
})

export const feedTransactionSchema = z.object({
  feedId: z.string().min(1, 'Feed is required'),
  flockId: z.string().optional(),
  type: z.enum(['purchase', 'distribution']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').optional(),
  date: z.date(),
  notes: z.string().optional(),
})

// Medicine Validation
export const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  type: z.enum(['vaccine', 'antibiotic', 'vitamin', 'other']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  expiryDate: z.date().optional(),
  supplier: z.string().optional(),
})

export const vaccinationSchema = z.object({
  flockId: z.string().min(1, 'Flock is required'),
  medicineId: z.string().min(1, 'Medicine/Vaccine is required'),
  date: z.date(),
  dosage: z.string().min(1, 'Dosage is required'),
  administeredBy: z.string().optional(),
  notes: z.string().optional(),
})

export const mortalitySchema = z.object({
  flockId: z.string().min(1, 'Flock is required'),
  date: z.date(),
  count: z.number().min(1, 'Count must be at least 1'),
  cause: z.string().optional(),
  notes: z.string().optional(),
})

// Financial Validation
export const financialSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.enum(['feed', 'medicine', 'labor', 'utilities', 'sales', 'other']),
  amount: z.number().min(0, 'Amount cannot be negative'),
  date: z.date(),
  description: z.string().optional(),
  flockId: z.string().optional(),
})

// Environment Validation
export const environmentReadingSchema = z.object({
  houseId: z.string().min(1, 'House is required'),
  temperature: z.number().min(-20).max(60).optional(),
  humidity: z.number().min(0).max(100).optional(),
  co2: z.number().min(0).optional(),
  ammonia: z.number().min(0).optional(),
})

// House Validation
export const houseSchema = z.object({
  name: z.string().min(1, 'House name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  farmId: z.string().min(1, 'Farm is required'),
})

// Farm Validation
export const farmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  location: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})
