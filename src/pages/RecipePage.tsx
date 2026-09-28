import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { mealQuery } from '../queries'
import { getIngredients } from '../api'
import { ErrorBox, FavButton } from '../components'
import { CATEGORY_TH, type MealDetail } from '../types'
export function RecipeView({ meal }: { meal: MealDetail }) {
  const steps = meal.strInstructions.split(/\r?\n+/).map((s) => s.trim()).filter((s) => s && !/^step\s*\d+$/i.test(s))
  const ingredients = getIngredients(meal)
  const translateUrl = `https://translate.google.com/?sl=en&tl=th&op=translate&text=${encodeURIComponent(`${meal.strMeal}\n\n${ingredients.join('\n')}\n\n${meal.strInstructions}`)}`
  return (
    <article className="grid gap-8 md:grid-cols-5 md:gap-12">
      <img src={meal.strMealThumb} alt={meal.strMeal} className="aspect-[4/5] w-full rounded-3xl object-cover md:col-span-2" />
      <div className="flex flex-col gap-4 md:col-span-3">
        <div className="flex gap-2"><span className="badge badge-secondary">{CATEGORY_TH[meal.strCategory] ?? meal.strCategory}</span>{meal.strArea && meal.strArea !== 'Unknown' && <span className="badge badge-outline">{meal.strArea}</span>}</div>
        <h1 className="text-3xl font-bold text-secondary sm:text-4xl">{meal.strMeal}</h1>
        <div className="flex flex-wrap gap-2">
          <FavButton id={meal.idMeal} />
          <a className="btn btn-ghost rounded-full" target="_blank" rel="noreferrer" href={translateUrl}>แปลสูตรเป็นภาษาไทย</a>
          {meal.strYoutube && <a className="btn btn-ghost rounded-full" href={meal.strYoutube} target="_blank" rel="noreferrer">ดูวิดีโอ</a>}
        </div>
        <section className="mt-2 rounded-2xl bg-accent/30 p-5">
          <h2 className="mb-3 text-xl font-bold">ส่วนผสม</h2>
          <ul className="grid gap-x-6 sm:grid-cols-2">{ingredients.map((i) => <li key={i} className="border-b border-base-300/70 py-1.5 text-sm">{i}</li>)}</ul>
        </section>
      </div>
      <section className="md:col-span-5">
        <h2 className="mb-4 text-2xl font-bold">วิธีทำ</h2>
        <ol className="flex max-w-3xl flex-col gap-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm text-secondary-content">{i + 1}</span><p>{s}</p></li>
          ))}
        </ol>
      </section>
    </article>
  )
}
export default function RecipePage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, error, refetch } = useQuery(mealQuery(id))
  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="link link-hover w-fit text-sm">← กลับไปหน้าเมนู</Link>
      {isLoading ? <div className="grid gap-8 md:grid-cols-5" aria-busy="true"><div className="skeleton aspect-[4/5] w-full rounded-3xl md:col-span-2" /><div className="flex flex-col gap-4 md:col-span-3"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-40 w-full" /></div></div>
        : isError ? <ErrorBox message={error.message} onRetry={() => void refetch()} /> : data && <RecipeView meal={data} />}
    </div>
  )
}
