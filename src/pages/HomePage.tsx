import HeroCarousel from '../HeroCarousel'
import { ArrowIcon, HeartIcon } from '../icons'
﻿import { useState } from 'react'
import { Link } from 'react-router'
import { useQueries } from '@tanstack/react-query'
import { categoryQuery } from '../queries'
import { useAppStore } from '../store'
import { CATEGORIES, CATEGORY_TH } from '../types'
import { mealImage } from '../mealImages'
import { ErrorBox, FavButton } from '../components'
import { matchesMealSearch } from '../mealSearch'
export default function HomePage() {
  const { category, setCategory, favoriteIds } = useAppStore()
  const [q, setQ] = useState('')
  const searching = q.trim().length > 0
  const results = useQueries({ queries: CATEGORIES.map((value) => ({ ...categoryQuery(value), enabled: searching || value === category })) })
  const activeResults = results.filter((_, index) => searching || CATEGORIES[index] === category)
  const isLoading = activeResults.some((result) => result.isPending)
  const failed = activeResults.find((result) => result.isError)
  const candidates = results.flatMap((result, index) => searching || CATEGORIES[index] === category
    ? (result.data ?? []).map((meal) => ({ ...meal, category: CATEGORIES[index] })) : [])
  const meals = [...new Map(candidates.filter((meal) => matchesMealSearch(meal.strMeal, q, meal.category)).map((meal) => [meal.idMeal, meal])).values()]
  return (
    <div className="home-page">
      <HeroCarousel />
      <div className="journal-layout" id="recipes">
        <section className="recipe-journal" aria-labelledby="recipes-title">
          <p className="eyebrow">FROM THE RECIPE BOOK</p>
          <div className="section-heading"><h2 id="recipes-title">วันนี้อยากทำอะไรดี?</h2><span>ค้นพบจานโปรดของคุณ</span></div>
          <label className="recipe-search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input type="search" placeholder="ค้นหา เช่น ไก่ แพนเค้ก หรือ chicken…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหาชื่อเมนูภาษาไทยหรืออังกฤษในทุกหมวด" /></label>
          <div className="category-list" role="group" aria-label="หมวดอาหาร">{CATEGORIES.map((c) => <button key={c} aria-pressed={!searching && c === category} className={!searching && c === category ? 'selected' : ''} onClick={() => { setCategory(c); setQ('') }}>{CATEGORY_TH[c]}</button>)}</div>
          {isLoading ? <div className="journal-loading" aria-label="กำลังโหลดสูตรอาหาร" aria-busy="true">{[0, 1, 2].map((i) => <div className="skeleton h-72 rounded-none" key={i} />)}</div> : failed ? <ErrorBox message={failed.error?.message} onRetry={() => { activeResults.forEach((result) => { void result.refetch() }) }} /> : meals.length === 0 ? <div className="journal-empty">ไม่พบเมนูที่ตรงกับคำค้นหา ลองใช้คำสั้น ๆ เช่น ไก่ เค้ก หรือชื่อภาษาอังกฤษ</div> : <>
            <p className="result-count" aria-live="polite">{searching ? 'ผลค้นหาจากทั้ง 5 หมวด' : CATEGORY_TH[category]} · {meals.length} สูตรอาหาร</p>
            <div className="journal-cards">{meals.map((meal) => <article className="journal-card" key={meal.idMeal}>
              <Link to={`/recipe/${meal.idMeal}`} className="journal-image"><img src={mealImage(meal)} alt={meal.strMeal} loading="lazy" /></Link>
              <div className="journal-card-copy"><p className="eyebrow">MEALBOOK / {CATEGORY_TH[meal.category]}</p><h3><Link to={`/recipe/${meal.idMeal}`}>{meal.strMeal}</Link></h3><p className="recipe-teaser">เติมไอเดียให้มื้อต่อไปของคุณด้วยสูตรนี้<br />ดูส่วนผสมและวิธีทำ แล้วเข้าครัวไปด้วยกัน</p><div className="journal-card-footer"><Link to={`/recipe/${meal.idMeal}`}>อ่านสูตรอาหาร <span className="arrow-disc"><ArrowIcon /></span></Link><FavButton id={meal.idMeal} compact /></div></div>
            </article>)}</div>
          </>}
        </section>
        <aside className="journal-sidebar">
          <section className="about-card"><div className="about-illustration"><img src="/mealbook-mark.svg?v=chef-script" alt="โลโก้ MealBook รูปหมวกเชฟ" width="92" height="74" /><span>MealBook</span></div><p className="eyebrow">HELLO, FOOD LOVERS</p><h2>ยินดีต้อนรับเข้าครัว MealBook</h2><p>พื้นที่เล็ก ๆ สำหรับคนรักการทำอาหาร รวบรวมสูตรจากทั่วโลก ให้คุณค้นพบจานใหม่และเก็บจานโปรดไว้ทำอีกครั้ง</p><Link className="text-link" to="/about">รู้จักเรามากขึ้น <span className="arrow-disc"><ArrowIcon /></span></Link></section>
          <section className="collection-card"><span className="sidebar-heart"><HeartIcon /></span><p className="eyebrow">YOUR PERSONAL COOKBOOK</p><h2>เก็บความอร่อย<br />ไว้ใกล้ตัว</h2><p>{favoriteIds.length > 0 ? `คุณมีสูตรโปรดแล้ว ${favoriteIds.length} เมนู พร้อมกลับมาทำได้ทุกเมื่อ` : 'กดหัวใจที่เมนูถูกใจ แล้วกลับมาเปิดสูตรได้ในคอลเลกชันของคุณ'}</p><Link className="editorial-button" to="/collection">เปิดคอลเลกชัน <span className="arrow-disc"><ArrowIcon /></span></Link></section>
          <section className="random-card"><p className="eyebrow">A LITTLE SURPRISE</p><h2>เลือกไม่ถูกใช่ไหม?</h2><p>ให้เราเลือกเมนูมื้อต่อไปให้คุณ</p><Link className="editorial-button" to="/random">ลองสุ่มเมนู <span className="arrow-disc"><ArrowIcon /></span></Link></section>
        </aside>
      </div>
      <section className="cooking-note"><p className="eyebrow">MADE WITH A LITTLE LOVE</p><h2>ไม่ต้องเป็นเชฟ ก็สร้างมื้อพิเศษได้</h2><p>เริ่มจากสูตรที่ถูกใจ แล้วสนุกกับทุกช่วงเวลาในครัว</p><Link className="text-link" to="/random">ค้นพบเมนูใหม่วันนี้ <span className="arrow-disc"><ArrowIcon /></span></Link></section>
    </div>
  )
}
