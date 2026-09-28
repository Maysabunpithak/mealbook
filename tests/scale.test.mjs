import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/scale.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { scaleInstruction, scaleInstructions, scaleIngredients } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

test('Thai instructions scale amounts and yield, preserving ratios and dimensions', () => {
  const step = 'รวมเนื้อบดกับ 1/2 ของกระเทียมสับและหัวหอมสับ 1 ช้อนโต๊ะ ปั้นเป็นชิ้นขนาด 1 1/2 นิ้ว คุณควรมีลูกชิ้น 12 ถึง 14 ลูก'
  assert.equal(scaleInstruction(step, 2), 'รวมเนื้อบดกับ 1/2 ของกระเทียมสับและหัวหอมสับ 2 ช้อนโต๊ะ ปั้นเป็นชิ้นขนาด 1 1/2 นิ้ว คุณควรมีลูกชิ้น 24 ถึง 28 ลูก')
})

test('English quantities and ranges scale', () => {
  assert.equal(scaleInstruction('Mix 1/2 of the garlic with 1 tablespoon onion. Shape into 1 1/2 inch patties; makes 12 to 14 meatballs.', 2), 'Mix 1/2 of the garlic with 2 tablespoon onion. Shape into 1 1/2 inch patties; makes 24 to 28 meatballs.')
  assert.equal(scaleInstruction('Add 1-2 teaspoons salt and 1 1/2 cups water.', 2), 'Add 2-4 teaspoons salt and 3 cups water.')
  assert.equal(scaleInstruction('เติมน้ำ 1/2 ถ้วยตวง และแป้ง 1.5 กรัม', 3), 'เติมน้ำ 1.5 ถ้วยตวง และแป้ง 4.5 กรัม')
})

test('times, temperatures, dimensions and step numbers stay fixed', () => {
  for (const step of [
    '1. ทอด 10 นาที ผัดหัวหอม 5 นาที ผัดกระเทียม 30 วินาที',
    '2. Bake at 180 degrees for 10-15 minutes; cut into 2 cm pieces.',
    'ตั้งเตา 180 องศา หั่นหนา 1/2 นิ้ว พัก 1 ชั่วโมง',
  ]) assert.equal(scaleInstruction(step, 4), step)
})

test('amount per individual piece is preserved', () => {
  for (const step of ['ปั้นลูกละ 30 กรัม', 'Make patties of 30 grams each.', 'Use 1 teaspoon per patty.']) {
    assert.equal(scaleInstruction(step, 2), step)
  }
})

test('serving changes use the original recipe without accumulating multipliers', () => {
  const steps = ['เติมน้ำ 1/2 ถ้วยตวง ต้ม 5 นาที']
  const ingredients = ['น้ำ 1/2 ถ้วยตวง']
  for (const servings of [2, 3, 20, 2, 1]) {
    const [ingredient] = scaleIngredients(ingredients, servings)
    assert.equal(scaleInstructions(steps, servings)[0], `เติม${ingredient} ต้ม 5 นาที`)
  }
  assert.deepEqual(steps, ['เติมน้ำ 1/2 ถ้วยตวง ต้ม 5 นาที'])
})
