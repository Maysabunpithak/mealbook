import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { createCommunityMiddleware } from './community.mjs'

const root = resolve('dist/client')
const community = createCommunityMiddleware()
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

async function serveApp(request, response) {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end()
      return
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = resolve(root, `.${pathname}`)
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end()
      return
    }
    const target = extname(file) ? file : resolve(root, 'index.html')
    const body = await readFile(target)
    response.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch {
    response.writeHead(404).end('Not found')
  }
}
const server = createServer((request, response) => {
  void community(request, response, () => { void serveApp(request, response) })
})
server.requestTimeout = 15000
const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'
server.listen(port, host, () => console.log(`MealBook: http://${host}:${port}`))
