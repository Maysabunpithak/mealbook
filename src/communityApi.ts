export interface Comment {
  id: string
  mealId: string
  parentId: string | null
  author: string
  body: string
  createdAt: string | null
  isExample?: boolean
}

export interface NewComment {
  mealId: string
  parentId: string | null
  author: string
  body: string
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error ?? 'เชื่อมต่อพื้นที่พูดคุยไม่สำเร็จ กรุณาลองอีกครั้ง')
  if (!data) throw new Error('พื้นที่พูดคุยยังไม่พร้อมใช้งาน กรุณาลองอีกครั้ง')
  return data
}

export async function fetchComments(mealId: string, signal: AbortSignal): Promise<Comment[]> {
  const response = await fetch(`/api/community?mealId=${encodeURIComponent(mealId)}`, { signal })
  const data = await readResponse(response)
  if (!Array.isArray(data.comments)) throw new Error('พื้นที่พูดคุยยังไม่พร้อมใช้งาน')
  return data.comments
}

export async function postComment(comment: NewComment): Promise<Comment> {
  const response = await fetch('/api/community', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  return (await readResponse(response)).comment
}
