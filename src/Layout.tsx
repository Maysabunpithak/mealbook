import { NavLink, Outlet } from 'react-router'
import { useAppStore } from './store'
const links = [{ to: '/', label: 'เมนูทั้งหมด' }, { to: '/collection', label: 'คอลเลกชัน' }, { to: '/random', label: 'สุ่มเมนู' }, { to: '/about', label: 'เกี่ยวกับ' }]
export default function Layout() {
  const count = useAppStore((s) => s.favoriteIds.length)
  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content">
      <header className="sticky top-0 z-10 border-b border-base-300 bg-base-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3">
          <span className="font-serif text-2xl font-bold text-secondary">MealBook</span>
          <nav className="ml-auto flex flex-wrap gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `rounded-full px-4 py-1.5 text-sm transition-colors ${isActive ? 'bg-secondary text-secondary-content' : 'hover:bg-base-300'}`}>
                {l.label}{l.to === '/collection' && count > 0 ? ` · ${count}` : ''}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"><Outlet /></main>
      <footer className="border-t border-base-300 py-6 text-center text-sm opacity-60">ข้อมูลสูตรอาหารจาก TheMealDB</footer>
    </div>
  )
}
