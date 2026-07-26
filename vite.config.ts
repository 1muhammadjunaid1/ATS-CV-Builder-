import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  if (!chunks.length) return undefined
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return undefined
  return JSON.parse(raw)
}

function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/enhance', async (req, res) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/enhance.ts')
          const apiReq = Object.assign(req, { body: await readJsonBody(req) })
          const apiRes = {
            status(code: number) {
              res.statusCode = code
              return this
            },
            json(payload: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
            },
          }
          await handler(apiReq, apiRes)
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local API route failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value
  }
  return { plugins: [localApiPlugin(), react()] }
})
