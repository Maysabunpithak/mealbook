import { useId, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchComments, postComment, type Comment } from './communityApi'

function CommentText({ comment }: { comment: Comment }) {
  return <>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-bold break-all text-secondary">{comment.author}</span>
      {comment.isExample ? <span className="rounded-full bg-accent/50 px-2 py-0.5 text-xs text-accent-content">ตัวอย่าง</span> : comment.createdAt && <time className="text-xs opacity-60" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</time>}
    </div>
    <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6">{comment.body}</p>
  </>
}

function CommentForm({ mealId, parentId = null, author, setAuthor, onSent, onCancel }: {
  mealId: string
  parentId?: string | null
  author: string
  setAuthor: (value: string) => void
  onSent: () => void
  onCancel?: () => void
}) {
  const [body, setBody] = useState('')
  const id = useId()
  const queryClient = useQueryClient()
  const send = useMutation({
    mutationFn: postComment,
    onSuccess: (comment) => {
      queryClient.setQueryData<Comment[]>(['community', mealId], (current = []) => [...current.filter((item) => item.id !== comment.id), comment])
      void queryClient.invalidateQueries({ queryKey: ['community', mealId] })
      setBody('')
      onSent()
    },
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!author.trim() || !body.trim() || send.isPending) return
    send.mutate({ mealId, parentId, author: author.trim(), body: body.trim() })
  }
  return <form onSubmit={submit} className="community-form">
    <div>
      <label htmlFor={`${id}-name`} className="mb-1 block text-sm font-semibold">ชื่อที่แสดง</label>
      <input id={`${id}-name`} className="input input-sm w-full max-w-sm bg-base-100" value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={40} required placeholder="ชื่อเล่นของคุณ" disabled={send.isPending} />
    </div>
    <div>
      <label htmlFor={`${id}-body`} className="mb-1 block text-sm font-semibold">{parentId ? 'คำตอบของคุณ' : 'คำถามหรือเคล็ดลับของคุณ'}</label>
      <textarea id={`${id}-body`} className="textarea min-h-20 w-full bg-base-100 text-sm" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} required placeholder={parentId ? 'แชร์คำแนะนำให้เพื่อนเข้าครัว…' : 'ถามปัญหาหรือแชร์เคล็ดลับ…'} disabled={send.isPending} aria-describedby={`${id}-count`} />
      <p id={`${id}-count`} className="mt-1 text-right text-xs opacity-60">{body.length}/2,000</p>
    </div>
    {send.isError && <p role="alert" className="text-sm text-error">{send.error.message}</p>}
    <div className="flex flex-wrap justify-end gap-2">
      {onCancel && <button type="button" className="btn btn-ghost rounded-full" onClick={onCancel} disabled={send.isPending}>ยกเลิก</button>}
      <button type="submit" className="btn btn-sm btn-secondary rounded-full" disabled={send.isPending || !author.trim() || !body.trim()}>{send.isPending ? 'กำลังส่ง…' : parentId ? 'ส่งคำตอบ' : 'ตั้งกระทู้'}</button>
    </div>
  </form>
}

export function RecipeCommunity({ mealId }: { mealId: string }) {
  const [author, setAuthor] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const titleId = useId()
  const comments = useQuery({
    queryKey: ['community', mealId],
    queryFn: ({ signal }) => fetchComments(mealId, signal),
    refetchInterval: 15000,
    retry: 1,
  })
  const all = comments.data ?? []
  const threads = all.filter((comment) => comment.parentId === null).slice().reverse()
  return <section className="recipe-community md:col-span-5" aria-labelledby={titleId}>
    <header className="mb-4">
      <h2 id={titleId} className="text-lg font-bold text-secondary">คุยกันเรื่องเมนูนี้ <span className="text-xs font-normal">· {threads.length} กระทู้</span></h2>
      <p className="mt-1 text-xs opacity-60">ถามปัญหา แชร์เคล็ดลับ · ทุกคนเห็นข้อความได้ พูดคุยกันอย่างสุภาพนะ</p>
    </header>
    <div className="community-layout">
      <div className="community-compose">
        <h3 className="mb-2 text-sm font-semibold text-secondary">ตั้งกระทู้ใหม่</h3>
        <CommentForm mealId={mealId} author={author} setAuthor={setAuthor} onSent={() => setNotice('ส่งความคิดเห็นแล้ว')} />
        <p role="status" className="mt-3 text-sm text-secondary">{notice}</p>
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 text-sm font-semibold text-secondary">กระทู้ล่าสุด</h3>
    {comments.isPending && <p className="py-6 text-sm" role="status">กำลังโหลดความคิดเห็น…</p>}
    {comments.isError && <div role="alert" className="my-4 flex flex-wrap items-center gap-3 text-sm"><p>{comments.error.message}</p><button type="button" className="btn btn-sm btn-outline rounded-full" onClick={() => void comments.refetch()}>ลองโหลดใหม่</button></div>}
    {comments.isSuccess && threads.length === 0 && <div className="community-empty"><p className="font-semibold">ยังไม่มีคำถามสำหรับเมนูนี้</p><p className="mt-1 text-sm opacity-70">เริ่มบทสนทนาแรก หรือแชร์ประสบการณ์ที่คุณลองทำได้เลย</p></div>}
    <div className="community-topics">
      {threads.map((thread) => {
        const replies = all.filter((comment) => comment.parentId === thread.id)
        return <details key={thread.id} className="community-thread">
          <summary className="community-topic-summary">
            <span className="community-topic-chevron" aria-hidden="true">›</span>
            <span className="min-w-0">
              <span className="community-topic-title">{thread.body}</span>
              <span className="community-topic-meta">{thread.author}{thread.isExample && <span className="community-example">ตัวอย่าง</span>}</span>
            </span>
            <span className="community-topic-count">{replies.length}<span>ตอบกลับ</span></span>
          </summary>
          <div className="community-topic-content">
          <CommentText comment={thread} />
          <button type="button" className="btn btn-ghost mt-2 min-h-11 rounded-full text-sm text-secondary" aria-expanded={replyTo === thread.id} onClick={() => { setReplyTo(thread.id); setNotice('') }}>ตอบกลับ{replies.length > 0 ? ` (${replies.length})` : ''}</button>
          {replies.length > 0 && <div className="community-replies">{replies.map((reply) => <div key={reply.id} className="py-3"><CommentText comment={reply} /></div>)}</div>}
          {replyTo === thread.id && <div className="mt-3"><CommentForm key={thread.id} mealId={mealId} parentId={thread.id} author={author} setAuthor={setAuthor} onSent={() => { setReplyTo(null); setNotice('ส่งคำตอบแล้ว') }} onCancel={() => setReplyTo(null)} /></div>}
          </div>
        </details>
      })}
    </div>
      </div>
    </div>
  </section>
}
