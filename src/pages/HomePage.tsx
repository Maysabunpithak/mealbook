import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryQuery } from '../queries'
import { useAppStore } from '../store'
import { CATEGORIES, CATEGORY_TH } from '../types'
import { ErrorBox, MealGrid, SkeletonGrid } from '../components'
export default function HomePage() {
  const { category, setCategory } = useAppStore()
  const [q, setQ] = useState('')
  const { data, isLoading, isError, error, refetch } = useQuery(categoryQuery(category))
  const meals = (data ?? []).filter((m) => m.strMeal.toLowerCase().includes(q.toLowerCase()))
  const tilt = ['-rotate-3', 'translate-y-6 rotate-2', '-translate-y-2 rotate-3']
  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center justify-between gap-6 overflow-hidden rounded-3xl bg-accent/40 px-6 py-10 sm:px-10">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-secondary sm:text-5xl">วันนี้อยากทำเมนูอะไร</h1>
          <p className="mt-3 opacity-75">เลือกหมวด ค้นหาเมนู แล้วเก็บสูตรที่ชอบไว้ในคอลเลกชันของคุณ</p>
          <input className="input mt-5 w-full rounded-full border-base-300 bg-base-100 px-5" placeholder="ค้นหาชื่อเมนู" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหาชื่อเมนู" />
        </div>
        <div className="hidden gap-3 pr-2 md:flex">
          {(data ?? []).slice(0, 3).map((m, i) => <img key={m.idMeal} src={m.strMealThumb} alt="" className={`h-44 w-32 rounded-2xl object-cover ${tilt[i]}`} />)}
        </div>
      </section>
      <div role="tablist" className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} role="tab" aria-selected={c === category} onClick={() => setCategory(c)}
            className={`rounded-full border px-5 py-1.5 text-sm transition-colors ${c === category ? 'border-secondary bg-secondary text-secondary-content' : 'border-base-300 hover:bg-base-200'}`}>{CATEGORY_TH[c]}</button>
        ))}
      </div>
      {isLoading ? <SkeletonGrid /> : isError ? <ErrorBox message={error.message} onRetry={() => void refetch()} /> : meals.length === 0 ? <p>ไม่พบเมนูที่ตรงกับคำค้นหา</p> : <><p className="-mb-4 text-sm opacity-60">{meals.length} เมนู</p><MealGrid meals={meals} /></>}
    </div>
  )
}
