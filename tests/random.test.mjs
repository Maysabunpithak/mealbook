import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/api.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { fetchRandom } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('all categories uses the existing random endpoint', async (t) => {
  const meal = { idMeal: '1', strCategory: 'Seafood' }
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.endsWith('/random.php'))
    return Response.json({ meals: [meal] })
  })
  assert.deepEqual(await fetchRandom(), meal)
})

test('category random picks only from the filtered list and loads full recipe', async (t) => {
  const list = [{ idMeal: '10' }, { idMeal: '20' }]
  let selectedIndex = 0
  t.mock.method(Math, 'random', () => selectedIndex === 0 ? 0 : 0.999999)
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    requests.push(url)
    if (url.endsWith('/filter.php?c=Dessert')) return Response.json({ meals: list })
    assert.ok(url.endsWith(`/lookup.php?i=${list[selectedIndex].idMeal}`))
    return Response.json({ meals: [{ ...list[selectedIndex], strCategory: 'Dessert', strInstructions: 'Mix and bake.' }] })
  })
  for (selectedIndex = 0; selectedIndex < list.length; selectedIndex++) {
    const result = await fetchRandom('Dessert')
    assert.equal(result.idMeal, list[selectedIndex].idMeal)
    assert.equal(result.strInstructions, 'Mix and bake.')
  }
  assert.equal(requests.length, 4)
  assert.ok(requests.every((url) => !url.endsWith('/random.php')))
})

test('empty category reports an error without random fallback', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ meals: null }))
  await assert.rejects(fetchRandom('Chicken'), /ไม่พบเมนูในประเภทนี้/)
  assert.equal(fetchMock.mock.callCount(), 1)
})

test('request failures surface for retry', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }))
  await assert.rejects(fetchRandom('Beef'), /HTTP 503/)
})

test('multiple selected categories form one deduplicated pool', async (t) => {
  const requests = []
  let randomValue = 0
  t.mock.method(Math, 'random', () => randomValue)
  t.mock.method(globalThis, 'fetch', async (url) => {
    requests.push(url)
    if (url.endsWith('/filter.php?c=Chicken')) return Response.json({ meals: [{ idMeal: '10' }, { idMeal: '20' }] })
    if (url.endsWith('/filter.php?c=Seafood')) return Response.json({ meals: [{ idMeal: '20' }, { idMeal: '30' }] })
    const id = new URL(url).searchParams.get('i')
    assert.ok(['10', '20', '30'].includes(id))
    return Response.json({ meals: [{ idMeal: id }] })
  })
  for (const [value, expectedId] of [[0, '10'], [0.4, '20'], [0.8, '30']]) {
    randomValue = value
    assert.equal((await fetchRandom(['Chicken', 'Seafood', 'Chicken'])).idMeal, expectedId)
  }
  assert.equal(requests.filter((url) => url.endsWith('/filter.php?c=Chicken')).length, 3)
  assert.ok(requests.every((url) => !url.endsWith('/random.php')))
})

test('empty selection means all categories', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.endsWith('/random.php'))
    return Response.json({ meals: [{ idMeal: '99' }] })
  })
  assert.equal((await fetchRandom([])).idMeal, '99')
})

test('three categories include all selected groups, even if one is empty', async (t) => {
  const categories = []
  t.mock.method(Math, 'random', () => 0.99)
  t.mock.method(globalThis, 'fetch', async (url) => {
    const category = new URL(url).searchParams.get('c')
    if (category) {
      categories.push(category)
      return Response.json({ meals: category === 'Seafood' ? null : [{ idMeal: category === 'Chicken' ? '10' : '30' }] })
    }
    assert.ok(url.endsWith('/lookup.php?i=30'))
    return Response.json({ meals: [{ idMeal: '30', strCategory: 'Dessert' }] })
  })
  assert.equal((await fetchRandom(['Chicken', 'Seafood', 'Dessert'])).strCategory, 'Dessert')
  assert.deepEqual(categories.sort(), ['Chicken', 'Dessert', 'Seafood'])
})

test('a failed selected category does not silently draw from a partial pool', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.endsWith('/filter.php?c=Chicken')) return Response.json({ meals: [{ idMeal: '10' }] })
    return new Response('', { status: 503 })
  })
  await assert.rejects(fetchRandom(['Chicken', 'Seafood']), /HTTP 503/)
})
