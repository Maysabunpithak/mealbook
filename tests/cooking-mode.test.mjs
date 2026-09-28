import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { act, createElement, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/CookingMode.tsx', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} })
const executable = outputText.replace(/from (['"])(react(?:\/jsx-runtime)?)\1/g, (_, quote, module) => `from ${JSON.stringify(import.meta.resolve(module))}`)
const { CookingMode } = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`)

test('StrictMode queued close does not dismiss a reopened cooking dialog; navigation and reopening work', async (t) => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // Native close events are queued, so StrictMode cleanup can deliver one
  // after the second effect has already reopened the same dialog element.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true }
  dom.window.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return
    this.open = false
    setTimeout(() => this.dispatchEvent(new dom.window.Event('close')), 0)
  }
  dom.window.HTMLElement.prototype.scrollTo = function () { this.scrollTop = 0 }
  const root = createRoot(document.getElementById('root'))
  t.after(async () => {
    await act(async () => root.unmount())
    await new Promise((resolve) => setTimeout(resolve, 10))
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  })
  const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)) })
  async function click(label) {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent === label)
    assert.ok(button, `Missing button: ${label}`)
    await act(async () => button.click())
    await settle()
  }
  await act(async () => root.render(createElement(StrictMode, null, createElement(CookingMode, {
    name: 'เมนูทดสอบ', steps: ['เตรียมส่วนผสม', 'ปรุงอาหาร'], servings: 2, language: 'th',
  }))))
  await click('เริ่มทำอาหารทีละขั้น')
  assert.ok(document.querySelector('dialog')?.open, 'Cooking dialog should remain open after StrictMode replay')
  assert.equal(document.body.style.overflow, 'hidden')
  assert.match(document.querySelector('dialog').textContent, /ขั้นตอนที่ 1 จาก 2/)
  await click('ถัดไป')
  assert.match(document.querySelector('dialog').textContent, /ขั้นตอนที่ 2 จาก 2/)
  await click('ย้อนกลับ')
  assert.match(document.querySelector('dialog').textContent, /ขั้นตอนที่ 1 จาก 2/)
  await click('ถัดไป')
  await click('ทำเสร็จแล้ว')
  assert.match(document.querySelector('dialog').textContent, /ทำอาหารครบทุกขั้นตอนแล้ว/)
  await click('กลับไปดูสูตร')
  assert.equal(document.querySelector('dialog'), null)
  assert.equal(document.body.style.overflow, '')
  await click('เริ่มทำอาหารทีละขั้น')
  assert.match(document.querySelector('dialog').textContent, /ขั้นตอนที่ 1 จาก 2/)
  await act(async () => document.querySelector('dialog').close())
  await settle()
  assert.equal(document.querySelector('dialog'), null, 'An actual close should still exit')
  await click('เริ่มทำอาหารทีละขั้น')
  await act(async () => document.querySelector('dialog').dispatchEvent(new dom.window.Event('cancel', { cancelable: true })))
  await settle()
  assert.equal(document.querySelector('dialog'), null, 'Escape/cancel should exit')
  await click('เริ่มทำอาหารทีละขั้น')
  await click('ปิดโหมด')
  assert.equal(document.querySelector('dialog'), null)
})
