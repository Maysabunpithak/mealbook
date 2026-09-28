import { queryOptions } from '@tanstack/react-query'
import { fetchByCategory, fetchMeal } from './api'
export const categoryQuery = (c: string) => queryOptions({ queryKey: ['category', c], queryFn: () => fetchByCategory(c), staleTime: 1000 * 60 * 10 })
export const mealQuery = (id: string) => queryOptions({ queryKey: ['meal', id], queryFn: () => fetchMeal(id), staleTime: 1000 * 60 * 30 })
