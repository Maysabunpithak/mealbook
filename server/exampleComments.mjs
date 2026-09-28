// Fictional starter conversations, visibly labelled in the app.
// Stable, recipe-scoped IDs let real users reply without duplicating examples.
export function exampleComments(mealId) {
  const prefix = `example-${mealId}`
  const entries = [
    ['prep', null, 'มะลิ', 'เพิ่งลองทำเมนูนี้ครั้งแรก ควรเตรียมส่วนผสมให้ครบก่อนเริ่มเลยไหมคะ?'],
    ['prep-reply', 'prep', 'ต้น', 'แนะนำให้อ่านวิธีทำให้จบก่อน แล้วตวงและแยกส่วนผสมไว้เป็นถ้วย ๆ ครับ ตอนลงมือจะได้ไม่ต้องหยุดหาของ'],
    ['prep-thanks', 'prep', 'มะลิ', 'ขอบคุณค่ะ เดี๋ยวลองจัดส่วนผสมไว้ก่อน น่าจะทำตามได้ง่ายขึ้น 😊'],
    ['servings', null, 'พลอย', 'อยากทำให้เพื่อนหลายคน ต้องคูณส่วนผสมเองหรือเปล่าคะ?'],
    ['servings-reply', 'servings', 'นนท์', 'กดเพิ่มจำนวนคนตรงส่วนผสมได้เลยครับ ตัวเลขปริมาณส่วนผสมและปริมาณที่รองรับในวิธีทำจะปรับให้'],
    ['servings-thanks', 'servings', 'พลอย', 'เจอปุ่มแล้วค่ะ ขอบคุณมาก มีโหมดทีละขั้นด้วย เดี๋ยวเปิดตอนเข้าครัวเลย'],
  ]
  return entries.map(([id, parent, author, body]) => ({
    id: `${prefix}-${id}`, mealId, parentId: parent ? `${prefix}-${parent}` : null,
    author, body, createdAt: null, isExample: true,
  }))
}
