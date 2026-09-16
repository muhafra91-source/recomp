export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodUnit {
  unit: string
  grams: number
}

export interface FoodDatabaseItem {
  id: string
  name: string
  per100g: Macros
  units: FoodUnit[]
}

export const GENERIC_UNITS: FoodUnit[] = [
  { unit: 'g', grams: 1 },
  { unit: 'kg', grams: 1000 },
  { unit: 'oz', grams: 28.3495 },
]

export function unitsForFood(food: Pick<FoodDatabaseItem, 'units'>): FoodUnit[] {
  return [...GENERIC_UNITS, ...food.units]
}

export function gramsFor(food: Pick<FoodDatabaseItem, 'units'>, unit: string, quantity: number): number {
  const match = unitsForFood(food).find((u) => u.unit === unit)
  return quantity * (match?.grams ?? 1)
}

export function computeMacros(food: Pick<FoodDatabaseItem, 'per100g' | 'units'>, unit: string, quantity: number): Macros {
  const grams = gramsFor(food, unit, quantity)
  const factor = grams / 100
  return {
    calories: Math.round(food.per100g.calories * factor),
    protein: Math.round(food.per100g.protein * factor),
    carbs: Math.round(food.per100g.carbs * factor),
    fat: Math.round(food.per100g.fat * factor),
  }
}

export const BUILTIN_FOODS: FoodDatabaseItem[] = [
  // Protein
  { id: 'chicken-breast-cooked', name: 'Chicken Breast, cooked', per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, units: [{ unit: 'breast (medium)', grams: 174 }] },
  { id: 'chicken-breast-raw', name: 'Chicken Breast, raw', per100g: { calories: 120, protein: 22.5, carbs: 0, fat: 2.6 }, units: [{ unit: 'breast (medium)', grams: 220 }] },
  { id: 'chicken-thigh-cooked', name: 'Chicken Thigh, cooked', per100g: { calories: 209, protein: 26, carbs: 0, fat: 10.9 }, units: [] },
  { id: 'chicken-thigh-raw', name: 'Chicken Thigh, raw', per100g: { calories: 116, protein: 18.2, carbs: 0, fat: 4.3 }, units: [] },
  { id: 'ground-beef-85-cooked', name: 'Ground Beef 85/15, cooked', per100g: { calories: 250, protein: 26, carbs: 0, fat: 17 }, units: [] },
  { id: 'ground-beef-85-raw', name: 'Ground Beef 85/15, raw', per100g: { calories: 215, protein: 18, carbs: 0, fat: 15 }, units: [] },
  { id: 'beef-steak-cooked', name: 'Beef Steak (sirloin), cooked', per100g: { calories: 183, protein: 29, carbs: 0, fat: 7 }, units: [] },
  { id: 'beef-steak-raw', name: 'Beef Steak (sirloin), raw', per100g: { calories: 150, protein: 21, carbs: 0, fat: 6.5 }, units: [] },
  { id: 'salmon', name: 'Salmon, cooked', per100g: { calories: 208, protein: 20, carbs: 0, fat: 13 }, units: [{ unit: 'fillet (medium)', grams: 150 }] },
  { id: 'tuna-canned', name: 'Tuna, canned in water', per100g: { calories: 116, protein: 26, carbs: 0, fat: 1 }, units: [{ unit: 'can (drained)', grams: 120 }] },
  { id: 'shrimp', name: 'Shrimp, cooked', per100g: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 }, units: [] },
  { id: 'tilapia', name: 'Tilapia, cooked', per100g: { calories: 128, protein: 26, carbs: 0, fat: 2.7 }, units: [] },
  { id: 'pork-chop-cooked', name: 'Pork Chop, cooked', per100g: { calories: 231, protein: 25, carbs: 0, fat: 14 }, units: [] },
  { id: 'pork-chop-raw', name: 'Pork Chop, raw', per100g: { calories: 143, protein: 21, carbs: 0, fat: 6 }, units: [] },
  { id: 'turkey-breast-cooked', name: 'Turkey Breast, cooked', per100g: { calories: 135, protein: 30, carbs: 0, fat: 1 }, units: [] },
  { id: 'turkey-breast-raw', name: 'Turkey Breast, raw', per100g: { calories: 104, protein: 24, carbs: 0, fat: 0.7 }, units: [] },
  { id: 'egg', name: 'Egg, whole', per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }, units: [{ unit: 'egg (large)', grams: 50 }] },
  { id: 'egg-whites', name: 'Egg Whites', per100g: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 }, units: [{ unit: 'egg white', grams: 33 }] },
  { id: 'greek-yogurt', name: 'Greek Yogurt, plain nonfat', per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 }, units: [{ unit: 'cup', grams: 245 }] },
  { id: 'cottage-cheese', name: 'Cottage Cheese, low fat', per100g: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 }, units: [{ unit: 'cup', grams: 226 }] },
  { id: 'whey-protein', name: 'Whey Protein Powder', per100g: { calories: 400, protein: 80, carbs: 8, fat: 5 }, units: [{ unit: 'scoop', grams: 30 }] },
  { id: 'tofu', name: 'Tofu, firm', per100g: { calories: 144, protein: 15, carbs: 3, fat: 8 }, units: [] },
  { id: 'ground-turkey-cooked', name: 'Ground Turkey, cooked', per100g: { calories: 189, protein: 27, carbs: 0, fat: 8 }, units: [] },
  { id: 'ground-turkey-raw', name: 'Ground Turkey, raw', per100g: { calories: 120, protein: 19, carbs: 0, fat: 4.3 }, units: [] },
  { id: 'bacon', name: 'Bacon, cooked', per100g: { calories: 541, protein: 37, carbs: 1.4, fat: 42 }, units: [{ unit: 'slice', grams: 8 }] },
  { id: 'ham', name: 'Ham, sliced', per100g: { calories: 145, protein: 21, carbs: 1.5, fat: 6 }, units: [{ unit: 'slice', grams: 28 }] },
  { id: 'yogurt', name: 'Yogurt, plain whole milk', per100g: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 }, units: [{ unit: 'cup', grams: 245 }] },
  { id: 'protein-shake', name: 'Protein Shake, premade', per100g: { calories: 67, protein: 10, carbs: 4, fat: 1.5 }, units: [{ unit: 'bottle', grams: 330 }] },

  // Carbs
  { id: 'white-rice', name: 'White Rice, cooked', per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }, units: [{ unit: 'cup cooked', grams: 158 }] },
  { id: 'brown-rice', name: 'Brown Rice, cooked', per100g: { calories: 123, protein: 2.6, carbs: 26, fat: 1 }, units: [{ unit: 'cup cooked', grams: 195 }] },
  { id: 'oats', name: 'Oats, dry', per100g: { calories: 389, protein: 17, carbs: 66, fat: 7 }, units: [{ unit: 'cup dry', grams: 80 }] },
  { id: 'quinoa', name: 'Quinoa, cooked', per100g: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 }, units: [{ unit: 'cup cooked', grams: 185 }] },
  { id: 'sweet-potato', name: 'Sweet Potato, baked', per100g: { calories: 90, protein: 2, carbs: 21, fat: 0.1 }, units: [{ unit: 'medium', grams: 130 }] },
  { id: 'potato', name: 'Potato, baked', per100g: { calories: 93, protein: 2.5, carbs: 21, fat: 0.1 }, units: [{ unit: 'medium', grams: 173 }] },
  { id: 'whole-wheat-bread', name: 'Whole Wheat Bread', per100g: { calories: 247, protein: 13, carbs: 41, fat: 3.4 }, units: [{ unit: 'slice', grams: 28 }] },
  { id: 'white-bread', name: 'White Bread', per100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2 }, units: [{ unit: 'slice', grams: 25 }] },
  { id: 'pasta', name: 'Pasta, cooked', per100g: { calories: 131, protein: 5, carbs: 25, fat: 1.1 }, units: [{ unit: 'cup cooked', grams: 140 }] },
  { id: 'banana', name: 'Banana', per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }, units: [{ unit: 'medium', grams: 118 }] },
  { id: 'apple', name: 'Apple', per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }, units: [{ unit: 'medium', grams: 182 }] },
  { id: 'orange', name: 'Orange', per100g: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 }, units: [{ unit: 'medium', grams: 131 }] },
  { id: 'blueberries', name: 'Blueberries', per100g: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 }, units: [{ unit: 'cup', grams: 148 }] },
  { id: 'strawberries', name: 'Strawberries', per100g: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 }, units: [{ unit: 'cup', grams: 152 }] },
  { id: 'cereal', name: 'Cereal, corn flakes', per100g: { calories: 357, protein: 7, carbs: 84, fat: 0.9 }, units: [{ unit: 'cup', grams: 28 }] },
  { id: 'bagel', name: 'Bagel, plain', per100g: { calories: 257, protein: 10, carbs: 50, fat: 1.5 }, units: [{ unit: 'bagel', grams: 105 }] },
  { id: 'tortilla', name: 'Tortilla, flour', per100g: { calories: 312, protein: 8, carbs: 51, fat: 8 }, units: [{ unit: 'tortilla', grams: 49 }] },
  { id: 'chickpeas', name: 'Chickpeas, cooked', per100g: { calories: 164, protein: 9, carbs: 27, fat: 2.6 }, units: [{ unit: 'cup', grams: 164 }] },
  { id: 'black-beans', name: 'Black Beans, cooked', per100g: { calories: 132, protein: 8.9, carbs: 24, fat: 0.5 }, units: [{ unit: 'cup', grams: 172 }] },
  { id: 'lentils', name: 'Lentils, cooked', per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.4 }, units: [{ unit: 'cup', grams: 198 }] },
  { id: 'honey', name: 'Honey', per100g: { calories: 304, protein: 0.3, carbs: 82, fat: 0 }, units: [{ unit: 'tbsp', grams: 21 }] },

  // Fats & misc
  { id: 'peanut-butter', name: 'Peanut Butter', per100g: { calories: 588, protein: 25, carbs: 20, fat: 50 }, units: [{ unit: 'tbsp', grams: 16 }, { unit: 'tsp', grams: 5.3 }] },
  { id: 'almonds', name: 'Almonds', per100g: { calories: 579, protein: 21, carbs: 22, fat: 50 }, units: [{ unit: 'handful', grams: 28 }] },
  { id: 'olive-oil', name: 'Olive Oil', per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 }, units: [{ unit: 'tbsp', grams: 14 }, { unit: 'tsp', grams: 4.5 }] },
  { id: 'butter', name: 'Butter', per100g: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 }, units: [{ unit: 'tbsp', grams: 14 }] },
  { id: 'avocado', name: 'Avocado', per100g: { calories: 160, protein: 2, carbs: 9, fat: 15 }, units: [{ unit: 'medium', grams: 150 }] },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', per100g: { calories: 403, protein: 25, carbs: 1.3, fat: 33 }, units: [{ unit: 'slice', grams: 28 }] },
  { id: 'mozzarella', name: 'Mozzarella Cheese', per100g: { calories: 280, protein: 28, carbs: 3, fat: 17 }, units: [] },
  { id: 'whole-milk', name: 'Whole Milk', per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 }, units: [{ unit: 'cup', grams: 244 }] },
  { id: 'skim-milk', name: 'Skim Milk', per100g: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1 }, units: [{ unit: 'cup', grams: 245 }] },
  { id: 'almond-milk', name: 'Almond Milk, unsweetened', per100g: { calories: 15, protein: 0.6, carbs: 0.6, fat: 1.2 }, units: [{ unit: 'cup', grams: 240 }] },

  // Vegetables
  { id: 'broccoli', name: 'Broccoli, cooked', per100g: { calories: 35, protein: 2.4, carbs: 7, fat: 0.4 }, units: [{ unit: 'cup', grams: 156 }] },
  { id: 'spinach', name: 'Spinach, raw', per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }, units: [{ unit: 'cup', grams: 30 }] },
  { id: 'mixed-vegetables', name: 'Mixed Vegetables', per100g: { calories: 65, protein: 2.6, carbs: 13, fat: 0.3 }, units: [{ unit: 'cup', grams: 182 }] },

  // Convenience
  { id: 'protein-bar', name: 'Protein Bar', per100g: { calories: 350, protein: 20, carbs: 40, fat: 12 }, units: [{ unit: 'bar', grams: 60 }] },
  { id: 'granola-bar', name: 'Granola Bar', per100g: { calories: 471, protein: 10, carbs: 64, fat: 20 }, units: [{ unit: 'bar', grams: 40 }] },
  { id: 'pizza', name: 'Pizza, cheese', per100g: { calories: 266, protein: 11, carbs: 33, fat: 10 }, units: [{ unit: 'slice', grams: 107 }] },
  { id: 'hamburger', name: 'Hamburger, plain', per100g: { calories: 250, protein: 12, carbs: 30, fat: 9 }, units: [{ unit: 'burger', grams: 200 }] },
  { id: 'french-fries', name: 'French Fries', per100g: { calories: 312, protein: 3.4, carbs: 41, fat: 15 }, units: [] },
  { id: 'chicken-nuggets', name: 'Chicken Nuggets', per100g: { calories: 296, protein: 15, carbs: 17, fat: 19 }, units: [{ unit: 'piece', grams: 18 }] },
  { id: 'ice-cream', name: 'Ice Cream, vanilla', per100g: { calories: 207, protein: 3.5, carbs: 24, fat: 11 }, units: [{ unit: 'scoop', grams: 66 }] },
  { id: 'popcorn', name: 'Popcorn, air-popped', per100g: { calories: 387, protein: 13, carbs: 78, fat: 4.5 }, units: [{ unit: 'cup', grams: 8 }] },
]
