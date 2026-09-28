interface Member { name: string; nick: string; studentId: string; email: string; phone: string; role: string; desc: string; photo?: string }
// แก้ข้อมูลสมาชิกที่นี่ (ใส่รูปจริงได้ที่ photo เช่น '/members/1.jpg' โดยวางไฟล์ไว้ใน public/members/)
const members: Member[] = [
  { name: 'นางสาวนิชาภา ศรีแจ่มใส', nick: 'ใบหม่อน', studentId: '1660706050', email: 'nichapa.sree@bumail.net', phone: '065-935-4229', photo: '/members/nichapa.png', role: 'Full-Stack Developer', desc: 'ดูแลโครงสร้างโปรเจกต์ Routing และการแยก Client State ด้วย Zustand ออกจาก Server State ด้วย TanStack Query' },
  { name: 'นางสาวบุญพิทักษ์ โรจนประภาวสุ', nick: 'เมษา', studentId: '1660707538', email: 'bunpithak.rotc@bumail.net', phone: '096-791-6698', photo: '/members/bunpithak.jpg', role: 'UI/UX Developer, Feature Developer', desc: 'ออกแบบหน้าจอด้วย Tailwind CSS และ DaisyUI รวมถึง Loading State, Error State และ Responsive Design พัฒนาระบบคอลเลกชันส่วนตัวและหน้าสุ่มเมนู' },
]
function Avatar({ m }: { m: Member }) {
  if (m.photo) return <img src={m.photo} alt={m.name} width="144" height="144" className="size-36 shrink-0 rounded-full object-cover object-top" />
  return (
    <div className="flex size-36 shrink-0 items-center justify-center rounded-full bg-accent/60 text-secondary" role="img" aria-label={m.name}>
      <svg viewBox="0 0 24 24" className="size-16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3.2" /><path d="M5.8 18.6c1.4-2.6 3.6-3.6 6.2-3.6s4.8 1 6.2 3.6" /></svg>
    </div>
  )
}
export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="mb-2 text-center">
        <h1 className="text-3xl font-bold text-secondary sm:text-4xl">เกี่ยวกับผู้พัฒนา</h1>
        <p className="mt-1 opacity-60">Mini Project 2 - Decoupled SPA Architecture</p>
      </header>
      {members.map((m) => (
        <section key={m.studentId} className="member-card flex flex-col items-center gap-6 rounded-3xl border border-accent bg-base-100 p-6 shadow-sm sm:flex-row sm:p-8">
          <Avatar m={m} />
          <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <h2 className="text-2xl font-bold">{m.name} ({m.nick})</h2>
            <p className="text-sm opacity-80">ผู้จัดทำ · {m.studentId}</p>
            <span className="rounded-xl bg-accent/60 px-3 py-1 text-sm text-accent-content">Role: {m.role}</span>
            <p className="text-sm opacity-80">{m.desc}</p>
            <a className="link link-hover break-all text-sm text-secondary" href={`mailto:${m.email}`}>{m.email}</a>
            <p className="text-sm">โทรศัพท์: <a className="link link-hover" href={`tel:${m.phone.replaceAll('-', '')}`}>{m.phone}</a></p>
          </div>
        </section>
      ))}
      <section className="rounded-3xl border border-accent bg-base-100 p-6 shadow-sm sm:p-8">
        <h2 className="border-b border-base-300 pb-3 text-xl font-bold">แหล่งที่มาของข้อมูล (API Attribution)</h2>
        <div className="mt-4 flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-base-300 text-xs text-secondary" aria-hidden="true">API</span>
          <div className="min-w-0 break-words">
            <p className="font-semibold">Data Source: TheMealDB</p>
            <p className="text-sm opacity-75">ข้อมูลสูตรอาหารทั้งหมดดึงจาก TheMealDB (Public REST API) ผ่าน TanStack Query พร้อมแคชข้อมูลตามค่า staleTime</p>
            <a className="link link-hover mt-1 inline-block break-all text-sm text-secondary" href="https://www.themealdb.com/api.php" target="_blank" rel="noreferrer">เอกสาร API: https://www.themealdb.com/api.php</a>
          </div>
        </div>
      </section>
    </div>
  )
}
