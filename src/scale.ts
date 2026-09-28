/**
 * ปรับสเกลปริมาณส่วนผสมตามจำนวนเสิร์ฟ
 * รองรับ: จำนวนเต็ม (2), เศษส่วน (1/2), จำนวนผสม (1 1/2), และข้อความผสม
 */

// แปลงเศษส่วนเป็นทศนิยม
function parseFraction(str: string): number | null {
  str = str.trim()
  // เศษส่วนเช่น "1/2"
  const fracMatch = str.match(/^(\d+)\/(\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10)
    const den = parseInt(fracMatch[2], 10)
    return den !== 0 ? num / den : null
  }
  // จำนวนผสมเช่น "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10)
    const num = parseInt(mixedMatch[2], 10)
    const den = parseInt(mixedMatch[3], 10)
    return den !== 0 ? whole + num / den : null
  }
  // จำนวนเต็มหรือทศนิยม
  const num = parseFloat(str)
  return isNaN(num) ? null : num
}

// จัดรูปแบบตัวเลขให้สวยงาม
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  // ปัดเป็นทศนิยม 2 ตำแหน่ง แต่ตัดศูนย์ท้าย
  const rounded = Math.round(n * 100) / 100
  // ถ้าใกล้เคียงเศษส่วนที่รู้จัก ให้แสดงเป็นเศษส่วน
  const fractions: [number, string][] = [
    [0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'],
    [0.66, '2/3'], [0.75, '3/4'],
  ]
  for (const [val, str] of fractions) {
    if (Math.abs(rounded - val) < 0.03) return str
  }
  return rounded.toString()
}

/**
 * ปรับสเกลสตริงส่วนผสม เช่น "2 cups flour" → "4 cups flour"
 * รองรับข้อความแปลที่วางปริมาณหลังชื่อ เช่น "เนื้อบด 1 ปอนด์"
 * ถ้า parse ไม่ได้ จะคืนค่าเดิม
 */
export function scaleIngredient(ingredient: string, scale: number): string {
  if (scale === 1) return ingredient

  // หาตัวเลขแรกในสตริง (รองรับเศษส่วน เช่น "1/2", "1 1/2")
  const match = ingredient.match(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/)
  if (!match) return ingredient

  const originalStr = match[1]
  const originalNum = parseFraction(originalStr)
  if (originalNum === null || originalNum === 0) return ingredient

  const scaled = originalNum * scale
  const scaledStr = formatNumber(scaled)

  return ingredient.replace(originalStr, scaledStr)
}

/**
 * ปรับสเกลรายการส่วนผสมทั้งหมด
 */
export function scaleIngredients(ingredients: string[], scale: number): string[] {
  return ingredients.map((i) => scaleIngredient(i, scale))
}

// Only explicit ingredient measures and food counts are scaled in instructions.
// Ratios ("1/2 of the garlic"), durations, temperatures and dimensions stay fixed.
const quantity = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`
const instructionQuantity = new RegExp(
  String.raw`(?<![\d./])(${quantity})(?:(\s*(?:ถึง|to|[-–—])\s*)(${quantity}))?`,
  'gi',
)
const ingredientUnit = /^(?:ช้อนโต๊ะ|ช้อนชา|ถ้วยตวง|ถ้วย|กิโลกรัม|กรัม|มิลลิลิตร|ลิตร|ปอนด์|ออนซ์|กลีบ|ฟอง|ลูก|ก้อน|(?:tablespoons?|teaspoons?|tbsp|tsp|cups?|kilograms?|grams?|kg|g|millilit(?:er|re)s?|ml|lit(?:er|re)s?|liters?|l|pounds?|lbs?|ounces?|oz|cloves?|eggs?|meatballs?|patties|balls?)\b)/i

export function scaleInstruction(instruction: string, scale: number): string {
  if (scale === 1) return instruction
  return instruction.replace(instructionQuantity, (match: string, first: string, separator: string | undefined, last: string | undefined, offset: number) => {
    const after = instruction.slice(offset + match.length).trimStart()
    if (!ingredientUnit.test(after)) return match
    // A quantity per piece remains the same when the number of pieces changes.
    const before = instruction.slice(0, offset)
    if (/(?:ชิ้นละ|ลูกละ|ก้อนละ|อย่างละต่อชิ้น|each|per piece)\s*$/i.test(before)) return match
    if (/^(?:[a-z]+\s+)(?:each|per\s+(?:piece|patty|meatball))\b/i.test(after)) return match
    const start = parseFraction(first)
    const end = last === undefined ? undefined : parseFraction(last)
    if (start === null || end === null) return match
    return formatNumber(start * scale) + (end === undefined ? '' : `${separator}${formatNumber(end * scale)}`)
  })
}

export function scaleInstructions(instructions: string[], scale: number): string[] {
  return instructions.map((instruction) => scaleInstruction(instruction, scale))
}
