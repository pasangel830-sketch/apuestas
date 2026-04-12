/**
 * Genera copias precomprimidas *.gz junto a cada asset en dist/
 * (útil para nginx gzip_static, S3+CloudFront con Content-Encoding, etc.)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const dist = join(process.cwd(), 'dist')
const compressible = /\.(html|js|css|svg|json|xml|txt|woff2?)$/i

function walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (!ent.name.endsWith('.gz') && compressible.test(ent.name)) {
      const raw = readFileSync(p)
      writeFileSync(p + '.gz', gzipSync(raw, { level: 9 }))
    }
  }
}

try {
  walk(dist)
  console.log('[gzip-dist] Archivos .gz escritos en dist/')
} catch (e) {
  console.error('[gzip-dist]', e.message)
  process.exit(1)
}
