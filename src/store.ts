import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Appointment,
  CheckIn,
  Habit,
  HabitLog,
  MedLog,
  Medication,
  Milestone,
  PTExercise,
  PTLog,
  WeightEntry,
} from './types'

const DEFAULT_HABITS: Habit[] = [
  { id: 'habit-workout', name: 'Workout' },
  { id: 'habit-hydrate', name: 'Hydration' },
  { id: 'habit-walk', name: 'Walk outside' },
]

const DEFAULT_PT_EXERCISES: PTExercise[] = [
  { id: 'pt-walk', name: 'Walking', target: '10 min' },
  { id: 'pt-breathing', name: 'Deep Breathing Exercises', target: '5 min' },
  { id: 'pt-stretch', name: 'Gentle Stretching', target: '10 min' },
]

function uid(): string {
  return crypto.randomUUID()
}

interface Store {
  checkIns: CheckIn[]
  weights: WeightEntry[]
  medications: Medication[]
  medLogs: MedLog[]
  ptExercises: PTExercise[]
  ptLogs: PTLog[]
  habits: Habit[]
  habitLogs: HabitLog[]
  milestones: Milestone[]
  appointments: Appointment[]

  saveCheckIn: (date: string, data: Omit<CheckIn, 'id' | 'date'>) => void

  addWeight: (date: string, weight: number) => void
  deleteWeight: (id: string) => void

  addMedication: (med: Omit<Medication, 'id'>) => void
  updateMedication: (id: string, med: Omit<Medication, 'id'>) => void
  deleteMedication: (id: string) => void
  logMedDose: (medicationId: string, date: string) => void
  undoMedDose: (medicationId: string, date: string) => void

  addPTExercise: (name: string, target?: string) => PTExercise
  deletePTExercise: (id: string) => void
  logPT: (date: string, exerciseId: string, detail?: string, painNote?: string) => void
  unlogPT: (date: string, exerciseId: string) => void

  addHabit: (name: string) => Habit
  deleteHabit: (id: string) => void
  toggleHabit: (date: string, habitId: string) => void

  addMilestone: (date: string, title: string, notes?: string) => void
  deleteMilestone: (id: string) => void

  addAppointment: (appt: Omit<Appointment, 'id'>) => void
  deleteAppointment: (id: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      checkIns: [],
      weights: [],
      medications: [],
      medLogs: [],
      ptExercises: DEFAULT_PT_EXERCISES,
      ptLogs: [],
      habits: DEFAULT_HABITS,
      habitLogs: [],
      milestones: [],
      appointments: [],

      saveCheckIn: (date, data) => {
        const existing = get().checkIns.find((c) => c.date === date)
        if (existing) {
          set({
            checkIns: get().checkIns.map((c) => (c.id === existing.id ? { ...c, ...data } : c)),
          })
        } else {
          set({ checkIns: [...get().checkIns, { id: uid(), date, ...data }] })
        }
      },

      addWeight: (date, weight) => {
        const existing = get().weights.find((w) => w.date === date)
        if (existing) {
          set({ weights: get().weights.map((w) => (w.id === existing.id ? { ...w, weight } : w)) })
        } else {
          set({ weights: [...get().weights, { id: uid(), date, weight }] })
        }
      },
      deleteWeight: (id) => set({ weights: get().weights.filter((w) => w.id !== id) }),

      addMedication: (med) => set({ medications: [...get().medications, { ...med, id: uid() }] }),
      updateMedication: (id, med) =>
        set({ medications: get().medications.map((m) => (m.id === id ? { ...med, id } : m)) }),
      deleteMedication: (id) =>
        set({
          medications: get().medications.filter((m) => m.id !== id),
          medLogs: get().medLogs.filter((l) => l.medicationId !== id),
        }),
      logMedDose: (medicationId, date) =>
        set({
          medLogs: [
            ...get().medLogs,
            { id: uid(), medicationId, date, time: new Date().toTimeString().slice(0, 5) },
          ],
        }),
      undoMedDose: (medicationId, date) => {
        const logs = get().medLogs.filter((l) => l.medicationId === medicationId && l.date === date)
        const last = logs.at(-1)
        if (!last) return
        set({ medLogs: get().medLogs.filter((l) => l.id !== last.id) })
      },

      addPTExercise: (name, target) => {
        const ex: PTExercise = { id: uid(), name, target }
        set({ ptExercises: [...get().ptExercises, ex] })
        return ex
      },
      deletePTExercise: (id) =>
        set({
          ptExercises: get().ptExercises.filter((e) => e.id !== id),
          ptLogs: get().ptLogs.filter((l) => l.exerciseId !== id),
        }),
      logPT: (date, exerciseId, detail, painNote) => {
        const existing = get().ptLogs.find((l) => l.date === date && l.exerciseId === exerciseId)
        if (existing) {
          set({
            ptLogs: get().ptLogs.map((l) => (l.id === existing.id ? { ...l, detail, painNote } : l)),
          })
        } else {
          set({ ptLogs: [...get().ptLogs, { id: uid(), date, exerciseId, detail, painNote }] })
        }
      },
      unlogPT: (date, exerciseId) =>
        set({ ptLogs: get().ptLogs.filter((l) => !(l.date === date && l.exerciseId === exerciseId)) }),

      addHabit: (name) => {
        const habit: Habit = { id: uid(), name }
        set({ habits: [...get().habits, habit] })
        return habit
      },
      deleteHabit: (id) =>
        set({
          habits: get().habits.filter((h) => h.id !== id),
          habitLogs: get().habitLogs.filter((l) => l.habitId !== id),
        }),
      toggleHabit: (date, habitId) => {
        const existing = get().habitLogs.find((l) => l.date === date && l.habitId === habitId)
        if (existing) {
          set({ habitLogs: get().habitLogs.filter((l) => l.id !== existing.id) })
        } else {
          set({ habitLogs: [...get().habitLogs, { id: uid(), date, habitId }] })
        }
      },

      addMilestone: (date, title, notes) =>
        set({ milestones: [...get().milestones, { id: uid(), date, title, notes }] }),
      deleteMilestone: (id) => set({ milestones: get().milestones.filter((m) => m.id !== id) }),

      addAppointment: (appt) =>
        set({ appointments: [...get().appointments, { ...appt, id: uid() }] }),
      deleteAppointment: (id) =>
        set({ appointments: get().appointments.filter((a) => a.id !== id) }),
    }),
    { name: 'recovery-store' },
  ),
)
