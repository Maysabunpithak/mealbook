import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import worker, { community, recipeMetadata } from '../server/worker.mjs'

function database() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(readFileSync(new URL('../drizzle/0000_nasty_kree.sql', import.meta.url), 'utf8'))
  return { prepare(sql) { return { bind(...values) {
    const statement = sqlite.prepare(sql)
    return { all: async () => ({ results: statement.all(...values) }), first: async () => statement.get(...values), run: async () => statement.run(...values) }
  } } } }
}
const request = (body, extra = {}) => new Request('https://mealbook.test/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) })
test('hosted community persists shared comments and confines replies to a recipe', async () => {
  const env = { DB: database() }
  const input = { mealId: '53281', author: 'ทดสอบ', body: 'เคล็ดลับ' }
  const added = await community(request(input), env)
  assert.equal(added.status, 201)
  const { comment } = await added.json()
  const read = await community(new Request('https://mealbook.test/api/community?mealId=53281'), env)
  assert.equal((await read.json()).comments.at(-1).body, input.body)
  assert.equal((await community(request({ ...input, parentId: comment.id }), env)).status, 201)
  assert.equal((await community(request({ ...input, mealId: '53120', parentId: comment.id }), env)).status, 400)
  assert.equal((await community(request({ ...input, parentId: 'example-53281-prep' }), env)).status, 201)
  assert.equal((await community(request(input, { Origin: 'https://other.test' }), env)).status, 403)
  assert.equal((await community(request({ ...input, body: 'a'.repeat(16001) }), env)).status, 413)
})
test('hosted app falls back to its entrypoint for direct navigation', async () => {
  const env = { ASSETS: { fetch: async (r) => new URL(r.url).pathname === '/index.html' ? new Response('<div id="root"></div>') : new Response(null, { status: 404 }) } }
  const result = await worker.fetch(new Request('https://mealbook.test/random'), env)
  assert.equal(result.status, 200)
  assert.match(await result.text(), /id="root"/)
})
test('social metadata uses each recipe record and its own image', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /property="og:image"/)
  for (const [id, name] of [['53281', 'Algerian Kefta'], ['53120', 'Æbleskiver']]) {
    const image = `https://www.themealdb.com/images/media/meals/${id}.jpg`
    const result = recipeMetadata(html, { strMeal: name, strMealThumb: image }, `/recipe/${id}`)
    assert.ok(result.includes(`<title>${name} | MealBook</title>`))
    assert.ok(result.includes(`content="${image}"`))
    assert.ok(result.includes(`https://mealbook-kitchen.misterzhurtgp.chatgpt.site/recipe/${id}`))
    assert.ok(!result.includes('/og.png'))
  }
})
