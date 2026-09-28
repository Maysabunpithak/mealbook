import { useEffect, useState } from 'react'


const slides = [
  { src: '/images/hero-pasta.jpg', alt: 'พาสต้าซอสมะเขือเทศและชีสบนจานเซรามิก', label: 'ความอร่อยในทุกวัน' },
  { src: '/images/hero-pancakes.jpg', alt: 'แพนเค้กสีทองกับสตรอว์เบอร์รีและบลูเบอร์รี', label: 'เติมความหวานให้มื้อพิเศษ' },
  { src: '/images/hero-salad.jpg', alt: 'สลัดผักหลากสีพร้อมเต้าหู้และไข่', label: 'เติมความสดใหม่ให้จานโปรด' },
  { src: '/images/hero-pizza.jpg', alt: 'พิซซ่าชีสและใบโหระพาสด', label: 'แบ่งปันความอร่อยกับคนโปรด', position: '50% 55%' },
  { src: '/images/hero-salmon.jpg', alt: 'แซลมอนกับหน่อไม้ฝรั่งและมะเขือเทศ', label: 'มื้อดี ๆ เริ่มที่วัตถุดิบสดใหม่' },
  { src: '/images/hero-berry-cake.jpg', alt: 'เค้กครีมสดตกแต่งด้วยเบอร์รี', label: 'เติมรอยยิ้มด้วยความหวาน', position: '50% 65%' },
  { src: '/images/hero-tomato-pasta.jpg', alt: 'สปาเกตตีซอสมะเขือเทศโรยชีส', label: 'เสน่ห์ของรสชาติที่คุ้นเคย', position: '50% 60%' },
  { src: '/images/hero-garden-salad.jpg', alt: 'สลัดผักและไข่ในชามไม้', label: 'สดใสได้ในทุกคำ' },
  { src: '/images/hero-salmon-lemon.jpg', alt: 'แซลมอนหนังกรอบกับมันฝรั่งและเลมอน', label: 'เปลี่ยนมื้อธรรมดาให้น่าจดจำ', position: '50% 65%' },
  { src: '/images/hero-chocolate-cake.jpg', alt: 'เค้กช็อกโกแลตตกแต่งด้วยเชอร์รี', label: 'ปิดท้ายมื้อพิเศษด้วยของหวาน' },
]
const cycleLength = (slides.length - 1) * 2

export default function HeroCarousel() {
  const [step, setStep] = useState(0)
  const [hidden, setHidden] = useState(document.hidden)
  const rotating = !hidden
  const current = step < slides.length ? step : cycleLength - step

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!rotating) return
    const timer = window.setInterval(() => setStep((previous) => (previous + 1) % cycleLength), 4500)
    return () => window.clearInterval(timer)
  }, [rotating])

return (
    <section className="food-hero hero-carousel" role="region" aria-roledescription="สไลด์ภาพ" aria-label="แรงบันดาลใจสำหรับมื้อพิเศษ">
      <div className="hero-slides" style={{ transform: `translateX(-${current * 100}%)` }} aria-live="off">
        {slides.map((slide, index) => <div key={`${slide.src}-${index}`} className="hero-slide" role="group" aria-roledescription="ภาพ" aria-label={`${index + 1} จาก ${slides.length}: ${slide.label}`} aria-hidden={index !== current}>
          <img src={slide.src} alt={slide.alt} style={{ objectPosition: slide.position ?? 'center' }} fetchPriority={index === 0 ? 'high' : 'low'} decoding={index === 0 ? 'auto' : 'async'} draggable={false} />
        </div>)}
      </div>
      <div className="hero-copy"><p className="eyebrow">WELCOME TO MEALBOOK</p><h1>เปลี่ยนทุกมื้อ<br />ให้เป็นมื้อพิเศษ</h1><p>ทำกับข้าวไม่เก่งก็เริ่มได้<br />ลองทำเมนูที่คิดถึง ให้อร่อยเหมือนฝีมือแม่</p></div>
      <div className="hero-controls">
        <span className="hero-slide-label">{slides[current].label}</span>
        <div className="hero-control-buttons">
          <div className="hero-auto-dots" aria-hidden="true">{slides.map((slide, index) => <span key={slide.src} className={index === current ? "active" : ""} />)}</div>
        </div>
      </div>
    </section>
  )
}
