import { exampleComments } from './exampleComments.mjs'

const origin = 'https://mealbook-kitchen.misterzhurtgp.chatgpt.site'
const validMealId = (value) => typeof value === 'string' && /^\d{1,12}$/.test(value)
const fail = (status, message) => Object.assign(new Error(message), { status })
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })

async function readInput(request) {
  const reader = request.body?.getReader()
  if (!reader) throw fail(400, 'กรุณาใส่ข้อความ')
  const chunks = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 16000) { await reader.cancel(); throw fail(413, 'ข้อความยาวเกินไป') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  try { return JSON.parse(new TextDecoder().decode(bytes)) }
  catch { throw fail(400, 'รูปแบบข้อความไม่ถูกต้อง') }
}

export async function community(request, env) {
  const url = new URL(request.url)
  try {
    if (request.method === 'GET') {
      const mealId = url.searchParams.get('mealId')
      if (!validMealId(mealId)) throw fail(400, 'รหัสเมนูไม่ถูกต้อง')
      const { results } = await env.DB.prepare('SELECT * FROM comments WHERE mealId = ? ORDER BY createdAt, id').bind(mealId).all()
      return json({ comments: [...exampleComments(mealId), ...results] })
    }
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } })
    if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) throw fail(403, 'ไม่อนุญาตให้ส่งข้อความจากเว็บไซต์อื่น')
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') throw fail(415, 'รูปแบบข้อความไม่ถูกต้อง')
    const input = await readInput(request)
    if (!input || !validMealId(input.mealId)) throw fail(400, 'รหัสเมนูไม่ถูกต้อง')
    const author = typeof input.author === 'string' ? input.author.trim() : ''
    const body = typeof input.body === 'string' ? input.body.trim() : ''
    if (!author || author.length > 40) throw fail(400, 'กรุณาใส่ชื่อไม่เกิน 40 ตัวอักษร')
    if (!body || body.length > 2000) throw fail(400, 'กรุณาใส่ข้อความไม่เกิน 2,000 ตัวอักษร')
    const parentId = input.parentId ?? null
    if (parentId !== null) {
      if (typeof parentId !== 'string') throw fail(400, 'ความคิดเห็นที่ตอบกลับไม่ถูกต้อง')
      const example = exampleComments(input.mealId).some((c) => c.id === parentId && c.parentId === null)
      const stored = example ? true : await env.DB.prepare('SELECT id FROM comments WHERE id = ? AND mealId = ? AND parentId IS NULL').bind(parentId, input.mealId).first()
      if (!stored) throw fail(400, 'ไม่พบความคิดเห็นที่ต้องการตอบกลับในเมนูนี้')
    }
    const comment = { id: crypto.randomUUID(), mealId: input.mealId, parentId, author, body, createdAt: new Date().toISOString() }
    await env.DB.prepare('INSERT INTO comments (id, mealId, parentId, author, body, createdAt) VALUES (?, ?, ?, ?, ?, ?)').bind(comment.id, comment.mealId, parentId, author, body, comment.createdAt).run()
    return json({ comment }, 201)
  } catch (error) {
    return json({ error: error.status ? error.message : 'บันทึกหรือโหลดความคิดเห็นไม่สำเร็จ กรุณาลองอีกครั้ง' }, error.status ?? 500)
  }
}

const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
export function recipeMetadata(html, meal, pathname) {
  const title = `${meal.strMeal} | MealBook`
  const description = `สูตร ${meal.strMeal} พร้อมส่วนผสม วิธีทำทีละขั้น และพื้นที่พูดคุยเรื่องเมนูนี้`
  const image = /^https:\/\/www\.themealdb\.com\//.test(meal.strMealThumb ?? '') ? meal.strMealThumb : null
  const tags = [['description', description], ['og:title', title], ['og:description', description], ['og:url', origin + pathname], ['og:type', 'article'], ['twitter:card', image ? 'summary_large_image' : 'summary'], ['twitter:title', title], ['twitter:description', description]]
  if (image) tags.push(['og:image', image], ['twitter:image', image])
  return html.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
    .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')
    .replace('</head>', tags.map(([name, value]) => `<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${escape(value)}" />`).join('') + '</head>')
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/community') return community(request, env)
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404)
    let response = await env.ASSETS.fetch(request)
    if (response.status === 404 && !url.pathname.split('/').at(-1).includes('.') && ['GET', 'HEAD'].includes(request.method)) {
      response = await env.ASSETS.fetch(new Request(new URL('/index.html', url), request))
    }
    const match = url.pathname.match(/^\/recipe\/(\d{1,12})\/?$/)
    if (match && request.method === 'GET' && response.ok) {
      try {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${match[1]}`, { signal: AbortSignal.timeout(4000) }).then((r) => r.json())
        if (data.meals?.[0]) {
          const headers = new Headers(response.headers)
          headers.delete('Content-Length'); headers.delete('ETag')
          return new Response(recipeMetadata(await response.text(), data.meals[0], url.pathname), { headers })
        }
      } catch { /* Keep the recipe app usable if the upstream metadata request fails. */ }
    }
    return response
  },
}
