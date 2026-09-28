import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRandom } from '../api'
import { ErrorBox } from '../components'
import { ArrowIcon } from '../icons'
import { mealImage } from '../mealImages'
import { RecipeView } from './RecipePage'
import { CATEGORIES, CATEGORY_TH, type Category } from '../types'
import { RandomChef } from '../RandomChef'

function ChefHatIcon() {
  return (
    <svg className="chef-hat-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 20v-5a5.5 5.5 0 1 1 2-10 6.5 6.5 0 0 1 10 0 5.5 5.5 0 1 1 2 10v5" />
      <path d="M9 20h14v6a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-6Zm4-5v5m6-5v5" />
    </svg>
  )
}

export default function RandomPage() {
  const queryClient = useQueryClient()
  const [animating, setAnimating] = useState(false)
  const [showRecipe, setShowRecipe] = useState(false)
  const [round, setRound] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const random = useMutation({
    mutationFn: (selectedCategories: Category[]) => fetchRandom(selectedCategories),
    onSuccess: (meal) => queryClient.setQueryData(['meal', meal.idMeal], meal),
  })
  const spinning = random.isPending || animating
  const winner = !spinning && random.isSuccess ? random.data : undefined

  useEffect(() => {
    if (!animating) return
    const timer = window.setTimeout(() => setAnimating(false), 2200)
    return () => window.clearTimeout(timer)
  }, [animating])

  function spin() {
    if (spinning) return
    setShowRecipe(false)
    setAnimating(true)
    setRound((value) => value + 1)
    random.mutate([...categories])
  }

  function toggleCategory(value: Category | '') {
    if (spinning) return
    setCategories((current) => value === '' ? [] : current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    setShowRecipe(false)
    random.reset()
  }

  return (
    <div className="random-page">
      <section className={`menu-machine ${spinning ? 'is-spinning' : ''} ${winner ? 'has-winner' : ''}`} aria-label="เกมสุ่มเมนูอาหาร" aria-busy={spinning}>
        <div className="machine-top"><span className="machine-pill"><ChefHatIcon /> MEALBOOK SURPRISE</span><span className="machine-round">{round > 0 ? `รอบที่ ${round.toString().padStart(2, '0')}` : 'พร้อมอร่อยหรือยัง?'}</span></div>
        <header className="random-intro"><h1>วันนี้ให้เชฟทำอะไรดี?</h1><p>เลือกของที่ชอบ แล้วให้เชฟเซอร์ไพรส์มื้อนี้</p></header>
      <fieldset className="random-categories" disabled={spinning}>
        <legend>เลือกประเภทที่อยากสุ่ม · เลือกได้มากกว่า 1 ประเภท</legend>
        <div className="flex flex-wrap justify-center gap-2">
          {(['', ...CATEGORIES] as const).map((value) => {
            const selected = value === '' ? categories.length === 0 : categories.includes(value)
            return <button key={value || 'all'} type="button" aria-pressed={selected} className={`btn rounded-full disabled:opacity-60 ${selected ? 'btn-secondary' : 'btn-outline btn-secondary'}`} onClick={() => toggleCategory(value)}>{selected && <span aria-hidden="true">✓</span>}{value ? CATEGORY_TH[value] : 'ทุกประเภท'}</button>
          })}
        </div>
        <p className="mt-3 text-sm opacity-75" role="status">{categories.length ? `เลือก ${categories.length} ประเภท: ${categories.map((value) => CATEGORY_TH[value]).join(' + ')}` : 'เชฟเลือกได้ทุกประเภท หรือแตะเลือกเฉพาะประเภทที่ชอบ'}</p>
      </fieldset>
        <div className={`machine-stage chef-stage ${winner ? 'chef-stage-result' : ''}`}>
          <div className="chef-scene"><div className="chef-speech">{spinning ? 'คนหม้ออีกนิด… ใกล้ได้แล้ว!' : winner ? 'เมนูของคุณ พร้อมเสิร์ฟ!' : 'เชฟพร้อมแล้ว คุณล่ะ?'}</div><RandomChef /></div>
          {winner && <div className="winner-card" key={round}><span className="winner-badge">{CATEGORY_TH[winner.strCategory] ?? winner.strCategory}</span><img src={mealImage(winner)} alt={winner.strMeal} /><h2>{winner.strMeal}</h2><p>น่าลองไหม? เปิดสูตรแล้วเข้าครัวกันเลย</p></div>}
        </div>
        <div className="machine-status" role="status" aria-live="polite">{spinning ? 'เชฟกำลังเลือกเมนูจากประเภทที่คุณเลือก…' : winner ? `ได้เมนู ${winner.strMeal} แล้ว!` : random.isError ? 'สุ่มไม่สำเร็จ ลองใหม่อีกครั้งนะ' : 'กดปุ่ม แล้วมาดูกันว่าเชฟจะเสิร์ฟอะไร'}</div>
        <div className="machine-actions"><button type="button" className="spin-button" onClick={spin} disabled={spinning}><ChefHatIcon />{spinning ? 'เชฟกำลังปรุง…' : round > 0 ? 'ให้เชฟสุ่มอีกครั้ง' : 'ให้เชฟสุ่มเมนู'}<ArrowIcon /></button>{winner && <button type="button" className="reveal-recipe-button" aria-expanded={showRecipe} aria-controls="random-recipe" onClick={() => setShowRecipe((value) => !value)}>{showRecipe ? 'ซ่อนสูตรอาหาร' : 'ดูสูตรเมนูนี้'}<ArrowIcon /></button>}</div>
        <p className="machine-note">สุ่มได้เรื่อย ๆ จนกว่าจะเจอจานที่อยากกิน</p>
        {!spinning && random.isError && <div className="mt-4"><ErrorBox message={random.error.message} onRetry={spin} /></div>}
      </section>
      {winner && showRecipe && <section id="random-recipe" className="random-recipe"><RecipeView meal={winner} /></section>}
    </div>
  )
}
