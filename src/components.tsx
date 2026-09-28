import { Link } from 'react-router'
import type { MealSummary } from './types'
import { useAppStore } from './store'

export function FavButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const isFav = useAppStore((s) => s.favoriteIds.includes(id))
  const toggle = useAppStore((s) => s.toggleFavorite)
  if (compact)
    return (
      <button onClick={() => toggle(id)} aria-pressed={isFav} aria-label={isFav ? 'เอาออกจากคอลเลกชัน' : 'เก็บลงคอลเลกชัน'}
        className={`flex size-9 items-center justify-center rounded-full text-lg backdrop-blur transition-colors ${isFav ? 'bg-error text-error-content' : 'bg-base-100/85 text-secondary hover:bg-base-100'}`}>
        {isFav ? '♥' : '♡'}
      </button>
    )
  return (
    <button className={`btn rounded-full ${isFav ? 'btn-error' : 'btn-outline btn-secondary'}`} onClick={() => toggle(id)} aria-pressed={isFav}>
      {isFav ? '♥ เก็บแล้ว' : '♡ เก็บลงคอลเลกชัน'}
    </button>
  )
}
export function MealCard({ meal }: { meal: MealSummary }) {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl bg-base-300">
        <Link to={`/recipe/${meal.idMeal}`}><img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
        <div className="absolute right-2 top-2"><FavButton id={meal.idMeal} compact /></div>
      </div>
      <Link to={`/recipe/${meal.idMeal}`} className="mt-3 block font-medium leading-snug hover:text-secondary">{meal.strMeal}</Link>
    </div>
  )
}
export function SkeletonGrid({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: n }, (_, i) => (<div key={i} className="flex flex-col gap-3"><div className="skeleton aspect-[4/5] w-full rounded-2xl" /><div className="skeleton h-4 w-3/4" /></div>))}
    </div>
  )
}
export function ErrorBox({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-error/40 bg-error/10 p-5 sm:flex-row sm:items-center">
      <span>โหลดข้อมูลไม่สำเร็จ: {message ?? 'โปรดตรวจสอบอินเทอร์เน็ต'}</span>
      <button className="btn btn-sm btn-error rounded-full sm:ml-auto" onClick={onRetry}>ลองใหม่อีกครั้ง</button>
    </div>
  )
}
export function MealGrid({ meals }: { meals: MealSummary[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">{meals.map((m) => <MealCard key={m.idMeal} meal={m} />)}</div>
}
