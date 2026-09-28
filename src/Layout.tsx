import { Link, NavLink, Outlet } from 'react-router'
import { useAppStore } from './store'
const links = [{ to: '/', label: 'เมนูทั้งหมด' }, { to: '/collection', label: 'คอลเลกชัน' }, { to: '/random', label: 'สุ่มเมนู' }, { to: '/about', label: 'เกี่ยวกับ' }]
export default function Layout() {
  const count = useAppStore((s) => s.favoriteIds.length)
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
      <div className="announcement">A LITTLE INSPIRATION FOR YOUR EVERYDAY COOKING</div>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="MealBook หน้าแรก">MealBook<span>RECIPES & LITTLE MOMENTS</span></Link>
        <nav aria-label="เมนูหลัก">{links.map((l) => <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{l.label}{l.to === '/collection' && count > 0 ? ` (${count})` : ''}</NavLink>)}</nav>
      </header>
      <main id="main-content" className="site-main"><Outlet /></main>
      <footer className="site-footer">
        <div><Link to="/" className="footer-brand">MealBook</Link><p>ความสุขเล็ก ๆ เริ่มต้นได้ในครัวของคุณ</p></div>
        <div className="footer-links"><Link to="/">ค้นหาสูตรอาหาร</Link><Link to="/collection">เมนูที่เก็บไว้</Link><Link to="/about">เกี่ยวกับเรา</Link></div>
        <p className="footer-credit">สูตรอาหารจาก TheMealDB · Mini Project 2</p>
      </footer>
    </div>
  )
}
