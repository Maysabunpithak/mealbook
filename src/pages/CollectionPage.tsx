import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router'
import { mealQuery } from '../queries'
import { useAppStore } from '../store'
import { ErrorBox, MealGrid, SkeletonGrid } from '../components'
import type { MealDetail } from '../types'
export default function CollectionPage() {
  const ids = useAppStore((s) => s.favoriteIds)
  const results = useQueries({ queries: ids.map(mealQuery) })
  if (ids.length === 0) return <div className="text-center"><p className="mb-3">ยังไม่มีเมนูในคอลเลกชัน</p><Link to="/" className="btn btn-primary">เลือกเมนูที่ชอบ</Link></div>
  const meals = results.map((r) => r.data).filter((m): m is MealDetail => m !== undefined)
  const failed = results.find((r) => r.isError)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">คอลเลกชันของฉัน ({ids.length})</h1>
      {failed && <ErrorBox message={failed.error?.message} onRetry={() => results.forEach((r) => void r.refetch())} />}
      {results.some((r) => r.isLoading) && <SkeletonGrid n={Math.min(ids.length, 4)} />}
      <MealGrid meals={meals} />
    </div>
  )
}
