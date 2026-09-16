import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Exercise, FoodEntry, Targets, WeightEntry, WorkoutEntry } from './types'
import type { FoodDatabaseItem } from './data/foods'

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-squat', name: 'Squat' },
  { id: 'ex-bench', name: 'Bench Press' },
  { id: 'ex-deadlift', name: 'Deadlift' },
  { id: 'ex-ohp', name: 'Overhead Press' },
  { id: 'ex-row', name: 'Row' },
  { id: 'ex-pullup', name: 'Pull-up' },
]

const DEFAULT_TARGETS: Targets = {
  calories: 2800,
  protein: 160,
  carbs: 300,
  fat: 80,
}

interface Store {
  weights: WeightEntry[]
  exercises: Exercise[]
  workouts: WorkoutEntry[]
  foods: FoodEntry[]
  customFoods: FoodDatabaseItem[]
  targets: Targets

  addWeight: (date: string, weight: number) => void
  deleteWeight: (id: string) => void

  addExercise: (name: string) => Exercise
  addWorkout: (date: string, exerciseId: string, sets: { reps: number; weight: number }[]) => void
  deleteWorkout: (id: string) => void

  addFood: (entry: Omit<FoodEntry, 'id'>) => void
  deleteFood: (id: string) => void
  addCustomFood: (food: Omit<FoodDatabaseItem, 'id'>) => FoodDatabaseItem
  deleteCustomFood: (id: string) => void

  setTargets: (targets: Targets) => void
}

function uid(): string {
  return crypto.randomUUID()
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      weights: [],
      exercises: DEFAULT_EXERCISES,
      workouts: [],
      foods: [],
      customFoods: [],
      targets: DEFAULT_TARGETS,

      addWeight: (date, weight) => {
        const existing = get().weights.find((w) => w.date === date)
        if (existing) {
          set({
            weights: get().weights.map((w) => (w.id === existing.id ? { ...w, weight } : w)),
          })
        } else {
          set({ weights: [...get().weights, { id: uid(), date, weight }] })
        }
      },
      deleteWeight: (id) => set({ weights: get().weights.filter((w) => w.id !== id) }),

      addExercise: (name) => {
        const ex: Exercise = { id: uid(), name }
        set({ exercises: [...get().exercises, ex] })
        return ex
      },
      addWorkout: (date, exerciseId, sets) =>
        set({ workouts: [...get().workouts, { id: uid(), date, exerciseId, sets }] }),
      deleteWorkout: (id) => set({ workouts: get().workouts.filter((w) => w.id !== id) }),

      addFood: (entry) => set({ foods: [...get().foods, { ...entry, id: uid() }] }),
      deleteFood: (id) => set({ foods: get().foods.filter((f) => f.id !== id) }),
      addCustomFood: (food) => {
        const item: FoodDatabaseItem = { ...food, id: uid() }
        set({ customFoods: [...get().customFoods, item] })
        return item
      },
      deleteCustomFood: (id) => set({ customFoods: get().customFoods.filter((f) => f.id !== id) }),

      setTargets: (targets) => set({ targets }),
    }),
    { name: 'recomp-store' },
  ),
)
