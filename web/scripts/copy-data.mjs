import fs from 'node:fs'
import path from 'node:path'

const source = path.join(import.meta.dirname, '..', '..', 'data')
const destination = path.join(import.meta.dirname, '..', 'public', 'data')

fs.rmSync(destination, { recursive: true, force: true })
fs.cpSync(source, destination, { recursive: true })
console.log(`Copied ${source} -> ${destination}`)
