import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/mealSearch.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { matchesMealSearch } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('Thai names, transliterations and English return the same relevant meals', () => {
  const examples = [
    ['Fried Chicken', 'Chicken', ['ไก่', 'ชิกเก้น', 'ชิคเก้น', 'CHICKEN', 'ไก่ทอด', 'ทอดไก่']],
    ['Pancakes', 'Dessert', ['แพนเค้ก', 'แพนเคก', 'pancake', 'ขนมหวาน']],
    ['Chocolate Cheesecake', 'Dessert', ['ชีสเค้ก', 'ช็อคโกแลต', 'เค้กช็อกโกแลต', 'chocolate cake']],
    ['Spaghetti Carbonara', 'Pork', ['สปาเก็ตตี้', 'คาโบนาร่า', 'คาร์โบนารา', 'พาสต้า']],
    ['Algerian Kefta (Meatballs)', 'Beef', ['เนื้อวัว', 'เคฟต้า', 'ลูกชิ้น', 'kefta']],
    ['Æbleskiver', 'Dessert', ['เอบเลสกีเวอร์', 'aebleskiver', 'แพนเค้ก']],
    ['Chicken Fried Rice', 'Chicken', ['ข้าวผัดไก่', 'ไก่ ข้าวผัด', 'ข้าวผัด chicken']],
    ['Grilled Salmon', 'Seafood', ['แซลมอน', 'แซลม่อน', 'ปลา', 'อาหารทะเล']],
  ]
  for (const [name, category, queries] of examples) {
    for (const query of queries) assert.ok(matchesMealSearch(name, query, category), `${query} should find ${name}`)
  }
})

test('requires all query terms, handles whitespace and accents, rejects unknown queries', () => {
  assert.ok(matchesMealSearch('Crème brûlée', ' creme   brulee ', 'Dessert'))
  assert.ok(matchesMealSearch('Chicken Curry', '   ', 'Chicken'))
  assert.equal(matchesMealSearch('Beef Stew', 'ไก่', 'Beef'), false)
  assert.equal(matchesMealSearch('Vanilla Cake', 'เค้กช็อกโกแลต', 'Dessert'), false)
  assert.equal(matchesMealSearch('Fried Chicken', 'แพนเค้ก', 'Chicken'), false)
  assert.equal(matchesMealSearch('Pancakes', 'เมนูที่ไม่มีอยู่จริง', 'Dessert'), false)
})
