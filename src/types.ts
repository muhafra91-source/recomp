export interface CheckIn {
  id: string
  date: string // YYYY-MM-DD
  sleepHours?: number
  sleepQuality?: number // 1-5
  pain?: number // 1-10
  energy?: number // 1-10
  notes?: string
}

export interface WeightEntry {
  id: string
  date: string // YYYY-MM-DD
  weight: number // kg
}

export interface Medication {
  id: string
  name: string
  dosage: string
  timesPerDay: number
  notes?: string
  archived?: boolean
}

export interface MedLog {
  id: string
  medicationId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

export interface PTExercise {
  id: string
  name: string
  target?: string // e.g. "3x10" or "10 min"
  archived?: boolean
}

export interface PTLog {
  id: string
  date: string // YYYY-MM-DD
  exerciseId: string
  detail?: string
  painNote?: string
}

export interface Habit {
  id: string
  name: string
  archived?: boolean
}

export interface HabitLog {
  id: string
  date: string // YYYY-MM-DD
  habitId: string
}

export interface Milestone {
  id: string
  date: string // YYYY-MM-DD
  title: string
  notes?: string
}

export interface Appointment {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:MM
  title: string
  provider?: string
  location?: string
  notes?: string
}

export type DateRange = 'week' | 'month' | 'all'
