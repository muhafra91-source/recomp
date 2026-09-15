export interface WeightEntry {
  id: string
  date: string // YYYY-MM-DD
  weight: number // kg
}

export interface Exercise {
  id: string
  name: string
}

export interface SetEntry {
  reps: number
  weight: number
}

export interface WorkoutEntry {
  id: string
  date: string // YYYY-MM-DD
  exerciseId: string
  sets: SetEntry[]
}

export interface FoodEntry {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  name: string
  quantity?: number
  unit?: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Targets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type DateRange = 'week' | 'month' | 'all'
