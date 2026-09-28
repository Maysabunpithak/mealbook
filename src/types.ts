export interface MealSummary { idMeal: string; strMeal: string; strMealThumb: string }
export interface MealDetail extends MealSummary {
  strCategory: string; strArea: string; strInstructions: string; strYoutube: string | null
  [key: string]: string | null
}
export interface MealsResponse<T> { meals: T[] | null }
export const CATEGORIES = ['Beef', 'Chicken', 'Pork', 'Seafood', 'Dessert'] as const
export type Category = (typeof CATEGORIES)[number]
export const CATEGORY_TH: Record<string, string> = { Beef: 'เมนูเนื้อวัว', Chicken: 'เมนูไก่', Pork: 'เมนูหมู', Seafood: 'ซีฟู้ด', Dessert: 'ขนมหวาน' }
