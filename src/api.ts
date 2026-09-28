import type { MealDetail, MealSummary, MealsResponse } from './types'
const BASE = 'https://www.themealdb.com/api/json/v1/1'
async function get<T>(path: string): Promise<T[]> {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`เชื่อมต่อไม่สำเร็จ (HTTP ${res.status})`)
  const json = (await res.json()) as MealsResponse<T>
  return json.meals ?? []
}
export const fetchByCategory = (c: string) => get<MealSummary>(`/filter.php?c=${encodeURIComponent(c)}`)
export async function fetchMeal(id: string): Promise<MealDetail> {
  const [m] = await get<MealDetail>(`/lookup.php?i=${encodeURIComponent(id)}`)
  if (!m) throw new Error('ไม่พบเมนูนี้')
  return m
}
export async function fetchRandom(): Promise<MealDetail> {
  const [m] = await get<MealDetail>('/random.php')
  if (!m) throw new Error('สุ่มเมนูไม่สำเร็จ')
  return m
}
export const getIngredients = (m: MealDetail): string[] =>
  Array.from({ length: 20 }, (_, i) => {
    const n = m[`strIngredient${i + 1}`]
    const a = m[`strMeasure${i + 1}`]
    return n && n.trim() ? `${a ?? ''} ${n}`.trim() : null
  }).filter((x): x is string => x !== null)
