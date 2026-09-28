import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { createCommunityMiddleware } from '../server/community.mjs'

async function fixture(t, includeExamples = false) {
  const dataDir = mkdtempSync(join(tmpdir(), 'mealbook-community-'))
  let server
  async function start() {
    const handler = createCommunityMiddleware({ dataDir, includeExamples })
    server = createServer((req, res) => { void handler(req, res, () => res.writeHead(404).end()) })
    await new Promise((done) => server.listen(0, '127.0.0.1', done))
    return `http://127.0.0.1:${server.address().port}`
  }
  let base = await start()
  const close = () => new Promise((done) => { server.close(done); server.closeAllConnections() })
  t.after(async () => {
    await close()
    assert.equal(dirname(resolve(dataDir)), resolve(tmpdir()))
    assert.ok(dataDir.includes('mealbook-community-'))
    rmSync(dataDir, { recursive: true, force: true })
  })
  return {
    get: (mealId) => fetch(`${base}/api/community?mealId=${encodeURIComponent(mealId)}`),
    post: (input, headers = {}) => fetch(`${base}/api/community`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(input) }),
    restart: async () => { await close(); base = await start() },
  }
}
const question = { mealId: '53281', parentId: null, author: 'คนทำอาหาร', body: 'ใช้หม้อทอดได้ไหม?' }

test('labelled starter conversations accept real replies and remain stable across reloads', async (t) => {
  const api = await fixture(t, true)
  const { comments: initial } = await (await api.get('53281')).json()
  assert.equal(initial.length, 6)
  assert.equal(initial.filter((comment) => comment.parentId === null).length, 2)
  assert.ok(initial.every((comment) => comment.isExample === true && comment.createdAt === null))
  const response = await api.post({ ...question, parentId: initial[0].id })
  assert.equal(response.status, 201)
  const { comment: realReply } = await response.json()
  assert.equal(realReply.isExample, undefined)
  await api.restart()
  const { comments } = await (await api.get('53281')).json()
  assert.equal(comments.length, 7)
  assert.deepEqual(comments.slice(0, 6), initial)
  assert.equal(comments[6].parentId, initial[0].id)
  assert.equal((await api.post({ ...question, mealId: '53120', parentId: initial[0].id })).status, 400)
})

test('comments and replies are shared through HTTP and survive server restart', async (t) => {
  const api = await fixture(t)
  assert.deepEqual(await (await api.get('53281')).json(), { comments: [] })
  const posted = await api.post(question)
  assert.equal(posted.status, 201)
  const { comment } = await posted.json()
  const reply = await api.post({ ...question, parentId: comment.id, author: 'เพื่อน', body: 'เคยลองทำแล้วค่ะ' })
  assert.equal(reply.status, 201)
  await api.restart()
  const { comments } = await (await api.get('53281')).json()
  assert.equal(comments.length, 2)
  assert.equal(comments[0].body, question.body)
  assert.equal(comments[1].parentId, comment.id)
  assert.equal(comments[1].author, 'เพื่อน')
  assert.deepEqual(await (await api.get('53120')).json(), { comments: [] })
})

test('replies cannot reference a different recipe or another reply', async (t) => {
  const api = await fixture(t)
  const { comment } = await (await api.post(question)).json()
  assert.equal((await api.post({ ...question, mealId: '53120', parentId: comment.id })).status, 400)
  const { comment: reply } = await (await api.post({ ...question, parentId: comment.id })).json()
  assert.equal((await api.post({ ...question, parentId: reply.id })).status, 400)
})

test('validates blank, oversized, invalid IDs, and cross-origin submissions', async (t) => {
  const api = await fixture(t)
  for (const input of [
    { ...question, author: '   ' }, { ...question, body: '\n ' },
    { ...question, author: 'a'.repeat(41) }, { ...question, body: 'a'.repeat(2001) },
    { ...question, mealId: '../secret' }, { ...question, parentId: 'missing' }, null,
  ]) assert.equal((await api.post(input)).status, 400)
  assert.equal((await api.post({ ...question, body: 'x'.repeat(17000) })).status, 413)
  assert.equal((await api.post(question, { Origin: 'http://other.example' })).status, 403)
  assert.equal((await api.post(question, { 'Content-Type': 'text/plain' })).status, 415)
  assert.equal((await api.get('../../secret')).status, 400)
  assert.deepEqual(await (await api.get('53281')).json(), { comments: [] })
})

test('simultaneous writers do not lose comments; text and newlines round-trip intact', async (t) => {
  const api = await fixture(t)
  const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => api.post({ ...question, body: `คำถาม ${i}\n<script>alert(1)</script>` })))
  assert.ok(responses.every((response) => response.status === 201))
  const { comments } = await (await api.get('53281')).json()
  assert.equal(comments.length, 12)
  assert.equal(new Set(comments.map((item) => item.id)).size, 12)
  assert.ok(comments.some((item) => item.body === 'คำถาม 0\n<script>alert(1)</script>'))
})
