import type { CheckIn, HabitLog, Habit, MedLog, Medication, WeightEntry } from '../types'
import { addDaysISO, daysAgoISO } from './date'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/** 0-100 quality score for a single day, used to color the calendar heatmap. */
export function dayScore(checkIn: CheckIn | undefined): number | null {
  if (!checkIn) return null
  const parts: number[] = []

  if (checkIn.pain !== undefined) {
    parts.push(((10 - checkIn.pain) / 9) * 100)
  }
  if (checkIn.sleepHours !== undefined || checkIn.sleepQuality !== undefined) {
    const sleepParts: number[] = []
    if (checkIn.sleepHours !== undefined) sleepParts.push(Math.min(checkIn.sleepHours / 8, 1) * 100)
    if (checkIn.sleepQuality !== undefined) sleepParts.push((checkIn.sleepQuality / 5) * 100)
    parts.push(average(sleepParts)!)
  }
  if (checkIn.energy !== undefined) {
    parts.push((checkIn.energy / 10) * 100)
  }

  return parts.length > 0 ? Math.round(average(parts)!) : null
}

export function scoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-800'
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 55) return 'bg-lime-500'
  if (score >= 35) return 'bg-amber-500'
  if (score >= 15) return 'bg-orange-500'
  return 'bg-red-500'
}

export function scoreHex(score: number | null): string {
  if (score === null) return '#334155'
  if (score >= 75) return '#10b981'
  if (score >= 55) return '#84cc16'
  if (score >= 35) return '#f59e0b'
  if (score >= 15) return '#f97316'
  return '#ef4444'
}

export interface WeeklyScoreBreakdown {
  score: number | null
  sleep: number | null
  pain: number | null
  medAdherence: number | null
  habits: number | null
}

/** 0-100 recovery score for the 7 days ending at `endDate`, combining sleep, pain trend, med adherence, habit completion. */
export function weeklyRecoveryScore(
  endDate: string,
  data: {
    checkIns: CheckIn[]
    medications: Medication[]
    medLogs: MedLog[]
    habits: Habit[]
    habitLogs: HabitLog[]
  },
): WeeklyScoreBreakdown {
  const weekStart = addDaysISO(endDate, -6)
  const prevWeekStart = addDaysISO(endDate, -13)
  const prevWeekEnd = addDaysISO(endDate, -7)

  const thisWeekCheckIns = data.checkIns.filter((c) => c.date >= weekStart && c.date <= endDate)
  const prevWeekCheckIns = data.checkIns.filter((c) => c.date >= prevWeekStart && c.date <= prevWeekEnd)

  const sleepHours = thisWeekCheckIns.filter((c) => c.sleepHours !== undefined).map((c) => c.sleepHours!)
  const sleep = sleepHours.length > 0 ? Math.round(Math.min(average(sleepHours)! / 8, 1) * 100) : null

  const thisWeekPain = average(thisWeekCheckIns.filter((c) => c.pain !== undefined).map((c) => c.pain!))
  const prevWeekPain = average(prevWeekCheckIns.filter((c) => c.pain !== undefined).map((c) => c.pain!))
  let pain: number | null = null
  if (thisWeekPain !== null) {
    pain =
      prevWeekPain !== null
        ? Math.round(clamp(50 + (prevWeekPain - thisWeekPain) * 10, 0, 100))
        : Math.round(((10 - thisWeekPain) / 9) * 100)
  }

  let medAdherence: number | null = null
  if (data.medications.length > 0) {
    let possible = 0
    let taken = 0
    for (let i = 0; i < 7; i++) {
      const date = addDaysISO(endDate, -i)
      for (const med of data.medications) {
        possible += med.timesPerDay
        taken += data.medLogs.filter((l) => l.medicationId === med.id && l.date === date).length
      }
    }
    medAdherence = possible > 0 ? Math.round((taken / possible) * 100) : null
  }

  let habits: number | null = null
  if (data.habits.length > 0) {
    const possible = data.habits.length * 7
    let done = 0
    for (let i = 0; i < 7; i++) {
      const date = addDaysISO(endDate, -i)
      done += data.habitLogs.filter((l) => l.date === date).length
    }
    habits = Math.round((done / possible) * 100)
  }

  const components = [sleep, pain, medAdherence, habits].filter((n): n is number => n !== null)
  const score = components.length > 0 ? Math.round(average(components)!) : null

  return { score, sleep, pain, medAdherence, habits }
}

/** Short auto-generated recap sentence for the 7 days ending at `endDate`. */
export function weeklyRecap(
  endDate: string,
  data: {
    checkIns: CheckIn[]
    weights: WeightEntry[]
    medications: Medication[]
    medLogs: MedLog[]
    habits: Habit[]
    habitLogs: HabitLog[]
  },
): string {
  const weekStart = addDaysISO(endDate, -6)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDaysISO(endDate, -i))

  const fragments: string[] = []

  const weightDays = data.weights.filter((w) => w.date >= weekStart && w.date <= endDate).length
  if (weightDays > 0) fragments.push(`logged weight ${weightDays}/7 days`)

  if (data.medications.length > 0) {
    let possible = 0
    let taken = 0
    for (const date of weekDates) {
      for (const med of data.medications) {
        possible += med.timesPerDay
        taken += data.medLogs.filter((l) => l.medicationId === med.id && l.date === date).length
      }
    }
    if (possible > 0) fragments.push(`took ${Math.round((taken / possible) * 100)}% of meds on schedule`)
  }

  if (data.habits.length > 0) {
    const possible = data.habits.length * 7
    const done = weekDates.reduce(
      (sum, date) => sum + data.habitLogs.filter((l) => l.date === date).length,
      0,
    )
    if (possible > 0) fragments.push(`completed ${Math.round((done / possible) * 100)}% of habits`)
  }

  const weekCheckIns = data.checkIns
    .filter((c) => c.date >= weekStart && c.date <= endDate && c.pain !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (weekCheckIns.length >= 2) {
    const first = weekCheckIns[0].pain!
    const last = weekCheckIns.at(-1)!.pain!
    if (first !== last) {
      fragments.push(`pain ${last < first ? 'dropped' : 'rose'} from ${first} to ${last}`)
    } else {
      fragments.push(`pain held steady at ${last}`)
    }
  }

  if (fragments.length === 0) return 'Log a few check-ins this week to unlock your recap.'

  const sentence = fragments.join(', ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

export function habitStreak(habitLogs: HabitLog[], habitId: string, today: string): number {
  const doneDates = new Set(habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date))
  let cursor = doneDates.has(today) ? today : daysAgoISO(1)
  if (!doneDates.has(cursor)) return 0
  let streak = 0
  while (doneDates.has(cursor)) {
    streak++
    cursor = addDaysISO(cursor, -1)
  }
  return streak
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]
