const CACHE_KEY = 'mealbook-th-translations-v1'
const cache = new Map<string, string>()
try {
  const saved: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]')
  if (Array.isArray(saved)) for (const entry of saved) {
    if (Array.isArray(entry) && typeof entry[0] === 'string' && typeof entry[1] === 'string') cache.set(entry[0], entry[1])
  }
} catch { /* Storage may be disabled; in-memory caching still works. */ }

// MyMemory accepts at most 500 UTF-8 bytes per segment.
export function splitTranslationText(text: string): string[] {
  const chunks: string[] = []
  let chunk = ''
  for (const word of text.trim().split(/\s+/)) {
    if (new TextEncoder().encode(`${chunk} ${word}`).length > 480 && chunk) {
      chunks.push(chunk)
      chunk = ''
    }
    for (const character of word) {
      if (new TextEncoder().encode(chunk + character).length > 480) {
        chunks.push(chunk)
        chunk = ''
      }
      chunk += character
    }
    chunk += ' '
  }
  if (chunk.trim()) chunks.push(chunk.trim())
  return chunks.map((value) => value.trim())
}

async function translateSegment(source: string, signal: AbortSignal): Promise<string> {
  signal.throwIfAborted()
  const cached = cache.get(source)
  if (cached) return cached
  const params = new URLSearchParams({ q: source, langpair: 'en|th', mt: '1' })
  const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  })
  if (!response.ok) throw new Error('บริการแปลไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง')
  const result = await response.json() as {
    responseStatus?: number | string
    quotaFinished?: boolean
    responseData?: { translatedText?: string }
  }
  if (result.quotaFinished || Number(result.responseStatus) === 429) throw new Error('ใช้โควตาแปลฟรีวันนี้ครบแล้ว ยังอ่านสูตรต้นฉบับได้ตามปกติ')
  const translated = result.responseData?.translatedText
  if (Number(result.responseStatus) !== 200 || !translated?.trim()) throw new Error('แปลสูตรไม่สำเร็จ กรุณาลองใหม่')
  const decoder = document.createElement('textarea')
  decoder.innerHTML = translated
  const text = decoder.value
  cache.set(source, text)
  while (cache.size > 1000) cache.delete(cache.keys().next().value!)
  try { localStorage.setItem(CACHE_KEY, JSON.stringify([...cache])) } catch { /* Use memory when storage is full. */ }
  return text
}

export async function translateRecipe(ingredients: string[], steps: string[], signal: AbortSignal) {
  const input = [...ingredients, ...steps]
  const output = new Array<string>(input.length)
  let next = 0
  const controller = new AbortController()
  const combined = AbortSignal.any([signal, controller.signal])
  async function worker() {
    while (next < input.length) {
      combined.throwIfAborted()
      const index = next++
      const translated: string[] = []
      for (const chunk of splitTranslationText(input[index])) translated.push(await translateSegment(chunk, combined))
      output[index] = translated.join(' ')
    }
  }
  // Cancel remaining requests if one fails, while retaining completed translations.
  try { await Promise.all(Array.from({ length: Math.min(3, input.length) }, worker)) }
  catch (error) { controller.abort(); throw error }
  return { ingredients: output.slice(0, ingredients.length), steps: output.slice(ingredients.length) }
}
