import { ArrowIcon } from '../icons'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { mealQuery } from '../queries'
import { getIngredients } from '../api'
import { mealImage } from '../mealImages'
import { ErrorBox, FavButton } from '../components'
import { CATEGORY_TH, type MealDetail } from '../types'
import { translateRecipe } from '../translation'
import { scaleIngredients, scaleInstructions } from '../scale'
import { CookingMode } from '../CookingMode'
import { RecipeCommunity } from '../RecipeCommunity'
export function RecipeView({ meal }: { meal: MealDetail }) {
  const [language, setLanguage] = useState<'th' | 'en'>('th')
  const [servings, setServings] = useState(1)
  const originalSteps = meal.strInstructions.split(/\r?\n+/).map((s) => s.trim()).filter((s) => s && !/^step\s*\d+$/i.test(s))
  const originalIngredients = getIngredients(meal)
  const translation = useQuery({
    queryKey: ['recipe-th-v1', meal.idMeal, originalIngredients, originalSteps],
    queryFn: ({ signal }) => translateRecipe(originalIngredients, originalSteps, signal),
    enabled: language === 'th',
    staleTime: Infinity,
    retry: false,
    refetchOnReconnect: false,
  })
  const thai = language === 'th' ? translation.data : undefined
  const steps = thai?.steps ?? originalSteps
  const ingredients = thai?.ingredients ?? originalIngredients
  const scaledIngredients = scaleIngredients(ingredients, servings)
  const scaledSteps = scaleInstructions(steps, servings)
  return (
    <article className="recipe-detail grid gap-8 md:grid-cols-5 md:gap-12">
      <div className="min-w-0 md:col-span-2"><img src={mealImage(meal)} alt={meal.strMeal} className="recipe-photo aspect-[4/5] w-full rounded-3xl object-cover" /></div>
      <div className="flex min-w-0 flex-col gap-4 md:col-span-3">
        <div className="flex flex-wrap gap-2"><span className="badge badge-secondary">{CATEGORY_TH[meal.strCategory] ?? meal.strCategory}</span>{meal.strArea && meal.strArea !== 'Unknown' && <span className="badge badge-outline">{meal.strArea}</span>}</div>
        <h1 className="recipe-title text-3xl font-bold text-secondary sm:text-4xl">{meal.strMeal}</h1>
        <div className="flex flex-wrap gap-2">
          <FavButton id={meal.idMeal} />
          <div className="recipe-language" role="group" aria-label="ภาษาสูตรอาหาร">
            <button type="button" aria-label="แสดงสูตรภาษาไทย" aria-pressed={language === 'th'} onClick={() => setLanguage('th')}>ไทย</button>
            <button type="button" aria-label="แสดงสูตรภาษาอังกฤษ" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          {meal.strYoutube && <a className="btn btn-ghost rounded-full" href={meal.strYoutube} target="_blank" rel="noreferrer">ดูวิดีโอ</a>}
        </div>
        {language === 'th' && <div className="translation-status" role="status" aria-live="polite">
          {translation.isFetching ? 'กำลังแปลสูตรเป็นภาษาไทย… ระหว่างนี้อ่านต้นฉบับได้เลย' : translation.isError ? <><span>{translation.error.message} — กำลังแสดงต้นฉบับ</span><button type="button" onClick={() => void translation.refetch()}>ลองแปลอีกครั้ง</button></> : thai ? 'สูตรอาหารภาษาไทย · เลือกดูภาษาอังกฤษได้' : null}
        </div>}
        <section className="recipe-ingredients mt-2 rounded-2xl bg-accent/30 p-5">
          <h2 className="mb-3 text-xl font-bold">ส่วนผสม</h2>
          <div className="mb-4 flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-secondary/30 bg-base-100 px-3 py-2" role="group" aria-label="ปรับจำนวนคน">
            <span className="text-sm font-semibold text-secondary">จำนวนคน</span>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-sm btn-circle btn-secondary size-8 text-lg disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/50" onClick={() => setServings((s) => Math.max(1, s - 1))} disabled={servings <= 1} aria-label="ลดจำนวนคน">−</button>
              <output className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-accent/60 px-2 text-xl font-semibold tabular-nums text-secondary" aria-live="polite" aria-label="จำนวนคนที่เลือก">{servings}</output>
              <button type="button" className="btn btn-sm btn-circle btn-secondary size-8 text-lg disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/50" onClick={() => setServings((s) => Math.min(20, s + 1))} disabled={servings >= 20} aria-label="เพิ่มจำนวนคน">+</button>
            </div>
            <span className="text-sm font-semibold text-secondary">คน</span>
          </div>
          <ul lang={thai ? 'th' : 'en'} className="grid gap-x-6 sm:grid-cols-2">{scaledIngredients.map((i, index) => <li key={index} className="border-b border-base-300/70 py-1.5 text-sm">{i}</li>)}</ul>
        </section>
      </div>
      <section className="recipe-method min-w-0 md:col-span-5">
        <div className="recipe-method-heading mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">วิธีทำ</h2>
          <CookingMode key={meal.idMeal} name={meal.strMeal} steps={scaledSteps} servings={servings} language={thai ? 'th' : 'en'} />
        </div>
        <p className="mb-4 text-sm opacity-70">ปริมาณในวิธีทำสำหรับ {servings} คน</p>
        <ol lang={thai ? 'th' : 'en'} className="flex max-w-3xl flex-col gap-4">
          {scaledSteps.map((s, i) => (
            <li key={i} className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm text-secondary-content">{i + 1}</span><p>{s}</p></li>
          ))}
        </ol>
      </section>
      <RecipeCommunity key={meal.idMeal} mealId={meal.idMeal} />
    </article>
  )
}
export default function RecipePage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, error, refetch } = useQuery(mealQuery(id))
  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="back-link"><ArrowIcon className="arrow-back" />กลับไปหน้าเมนู</Link>
      {isLoading ? <div className="grid gap-8 md:grid-cols-5" aria-busy="true"><div className="skeleton aspect-[4/5] w-full rounded-3xl md:col-span-2" /><div className="flex flex-col gap-4 md:col-span-3"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-40 w-full" /></div></div>
        : isError ? <ErrorBox message={error.message} onRetry={() => void refetch()} /> : data && <RecipeView meal={data} />}
    </div>
  )
}
