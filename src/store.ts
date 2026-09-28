import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from './types'
interface AppState {
  favoriteIds: string[]
  category: Category
  toggleFavorite: (id: string) => void
  setCategory: (c: Category) => void
}
// Client state only: เก็บแค่ ID ของรายการโปรดและหมวดที่เลือก (ข้อมูลเมนูอยู่ใน TanStack Query)
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favoriteIds: [],
      category: 'Chicken',
      toggleFavorite: (id) => set((s) => ({ favoriteIds: s.favoriteIds.includes(id) ? s.favoriteIds.filter((x) => x !== id) : [...s.favoriteIds, id] })),
      setCategory: (category) => set({ category }),
    }),
    { name: 'mealbook-store' },
  ),
)
