import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { exampleComments } from './exampleComments.mjs'

const validMealId = (value) => typeof value === 'string' && /^\d{1,12}$/.test(value)
function fail(status, message) {
  return Object.assign(new Error(message), { status })
}
function send(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  response.end(JSON.stringify(data))
}
function readBody(request) {
  return new Promise((resolveBody, reject) => {
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size <= 16000) chunks.push(chunk)
    })
    request.on('end', () => {
      if (size > 16000) return reject(fail(413, 'ข้อความยาวเกินไป'))
      try { resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8'))) }
      catch { reject(fail(400, 'รูปแบบข้อความไม่ถูกต้อง')) }
    })
    request.on('error', reject)
    request.on('aborted', () => reject(fail(400, 'การส่งข้อความถูกยกเลิก')))
  })
}

export function createCommunityMiddleware({ dataDir = resolve('data/community'), includeExamples = true } = {}) {
  function readComments(mealId) {
    const examples = includeExamples ? exampleComments(mealId) : []
    try {
      const stored = readFileSync(resolve(dataDir, `${mealId}.jsonl`), 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
      return [...examples, ...stored]
    } catch (error) {
      if (error.code === 'ENOENT') return examples
      throw error
    }
  }
  return async (request, response, next) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (url.pathname !== '/api/community') return next()
    try {
      if (request.method === 'GET') {
        const mealId = url.searchParams.get('mealId')
        if (!validMealId(mealId)) throw fail(400, 'รหัสเมนูไม่ถูกต้อง')
        return send(response, 200, { comments: readComments(mealId) })
      }
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'GET, POST')
        throw fail(405, 'ไม่รองรับคำขอนี้')
      }
      if (request.headers.origin && new URL(request.headers.origin).host !== request.headers.host) throw fail(403, 'ไม่อนุญาตให้ส่งข้อความจากเว็บไซต์อื่น')
      if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw fail(415, 'รูปแบบข้อความไม่ถูกต้อง')
      const input = await readBody(request)
      if (!input || !validMealId(input.mealId)) throw fail(400, 'รหัสเมนูไม่ถูกต้อง')
      const author = typeof input.author === 'string' ? input.author.trim() : ''
      const body = typeof input.body === 'string' ? input.body.trim() : ''
      if (!author || author.length > 40) throw fail(400, 'กรุณาใส่ชื่อไม่เกิน 40 ตัวอักษร')
      if (!body || body.length > 2000) throw fail(400, 'กรุณาใส่ข้อความไม่เกิน 2,000 ตัวอักษร')
      const parentId = input.parentId ?? null
      const existing = readComments(input.mealId)
      if (parentId !== null && (typeof parentId !== 'string' || !existing.some((comment) => comment.id === parentId && comment.parentId === null))) throw fail(400, 'ไม่พบความคิดเห็นที่ต้องการตอบกลับในเมนูนี้')
      const comment = { id: randomUUID(), mealId: input.mealId, parentId, author, body, createdAt: new Date().toISOString() }
      mkdirSync(dataDir, { recursive: true })
      appendFileSync(resolve(dataDir, `${input.mealId}.jsonl`), `${JSON.stringify(comment)}\n`, 'utf8')
      return send(response, 201, { comment })
    } catch (error) {
      if (!response.destroyed) send(response, error.status ?? 500, { error: error.status ? error.message : 'บันทึกหรือโหลดความคิดเห็นไม่สำเร็จ กรุณาลองอีกครั้ง' })
    }
  }
}
