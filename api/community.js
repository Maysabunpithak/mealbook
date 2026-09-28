// Keep the two public frontends on the same durable community database.
const upstream = 'https://mealbook-kitchen.misterzhurtgp.chatgpt.site/api/community'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }
  if (request.method === 'POST' && request.headers.origin) {
    try {
      if (new URL(request.headers.origin).host !== request.headers.host) {
        return response.status(403).json({ error: 'ไม่อนุญาตให้ส่งข้อความจากเว็บไซต์อื่น' })
      }
    } catch {
      return response.status(403).json({ error: 'Origin ไม่ถูกต้อง' })
    }
  }
  const url = new URL(upstream)
  if (request.method === 'GET') {
    url.search = new URL(request.url, 'https://mealbook.local').search
  }
  try {
    const body = request.method === 'POST' ? (typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? null)) : undefined
    if (body && Buffer.byteLength(body) > 16000) return response.status(413).json({ error: 'ข้อความยาวเกินไป' })
    const result = await fetch(url, {
      method: request.method,
      headers: request.method === 'POST' ? { 'Content-Type': request.headers['content-type'] ?? '' } : {},
      body,
      signal: AbortSignal.timeout(10000),
    })
    return response.status(result.status).json(await result.json())
  } catch {
    return response.status(502).json({ error: 'เชื่อมต่อพื้นที่พูดคุยไม่สำเร็จ กรุณาลองอีกครั้ง' })
  }
}
