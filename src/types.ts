export interface MealSummary { idMeal: string; strMeal: string; strMealThumb: string }
export interface MealDetail extends MealSummary {
  strCategory: string; strArea: string; strInstructions: string; strYoutube: string | null
  [key: string]: string | null
}
export interface MealsResponse<T> { meals: T[] | null }
export const CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Seafood', 'Pork'] as const
export type Category = (typeof CATEGORIES)[number]
export const CATEGORY_TH: Record<string, string> = { Beef: 'เนื้อวัว', Chicken: 'ไก่', Dessert: 'ของหวาน', Seafood: 'อาหารทะเล', Pork: 'หมู' }
