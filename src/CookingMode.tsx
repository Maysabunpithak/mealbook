import { useEffect, useId, useRef, useState } from 'react'

interface CookingRecipe {
  name: string
  steps: string[]
  servings: number
  language: 'th' | 'en'
}

export function CookingMode(props: CookingRecipe) {
  const [recipe, setRecipe] = useState<CookingRecipe | null>(null)
  return <>
    <button type="button" className="btn btn-secondary rounded-full" disabled={!props.steps.length} onClick={() => setRecipe({ ...props, steps: [...props.steps] })}>เริ่มทำอาหารทีละขั้น</button>
    {recipe && <CookingSession recipe={recipe} onExit={() => setRecipe(null)} />}
  </>
}

function CookingSession({ recipe, onExit }: { recipe: CookingRecipe; onExit: () => void }) {
  const [step, setStep] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const finished = step === recipe.steps.length

  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    content.current?.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [step])

  return (
    <dialog ref={dialog} className="cooking-dialog" aria-labelledby={titleId} onCancel={onExit} onClose={(event) => {
      // StrictMode cleanup queues a close event before reopening this dialog.
      // Ignore that stale event while the dialog is open again.
      if (!event.currentTarget.open) onExit()
    }}>
      <div className="cooking-panel">
        <header className="cooking-header">
          <div><p className="text-sm font-semibold text-secondary">โหมดทำอาหาร · {recipe.servings} คน</p><p className="mt-1 text-sm">{recipe.name}</p></div>
          <button type="button" className="btn btn-ghost min-h-11 shrink-0 rounded-full" onClick={onExit}>ปิดโหมด</button>
        </header>
        <div ref={content} className="cooking-content">
          <h2 ref={heading} id={titleId} tabIndex={-1} className="text-2xl font-bold text-secondary outline-none">{finished ? 'ทำอาหารครบทุกขั้นตอนแล้ว!' : `ขั้นตอนที่ ${step + 1} จาก ${recipe.steps.length}`}</h2>
          <progress className="progress progress-secondary my-5 w-full" value={finished ? recipe.steps.length : step + 1} max={recipe.steps.length} aria-label="ความคืบหน้าขั้นตอนทำอาหาร" />
          {finished ? <p className="cooking-step">พร้อมเสิร์ฟแล้ว ขอให้อร่อยกับมื้อนี้นะ!</p> : <p lang={recipe.language} className="cooking-step">{recipe.steps[step]}</p>}
        </div>
        <footer className="cooking-actions">
          <button type="button" className="btn btn-outline btn-secondary min-h-12 rounded-full text-base" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>ย้อนกลับ</button>
          {finished
            ? <button type="button" className="btn btn-secondary min-h-12 rounded-full text-base" onClick={onExit}>กลับไปดูสูตร</button>
            : <button type="button" className="btn btn-secondary min-h-12 rounded-full text-base" onClick={() => setStep((value) => Math.min(recipe.steps.length, value + 1))}>{step === recipe.steps.length - 1 ? 'ทำเสร็จแล้ว' : 'ถัดไป'}</button>}
        </footer>
      </div>
    </dialog>
  )
}
