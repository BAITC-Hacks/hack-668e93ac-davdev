import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, '.env.example')
const force = process.argv.includes('--force')

const envFiles = [
  ['.env', '# USE FOR LOCAL DEVELOPMENT WITH PROXY TUNNEL'],
  ['.env.local', '# USE FOR LOCAL DEVELOPMENT ON LOCALHOST'],
  ['.env.production', '# USE FOR DEPLOYMENT ONLY'],
]

if (!fs.existsSync(sourcePath)) {
  throw new Error('.env.example was not found')
}

const template = fs.readFileSync(sourcePath, 'utf8').replace(/^#.*\r?\n/, '')

for (const [fileName, comment] of envFiles) {
  const filePath = path.join(root, fileName)

  if (fs.existsSync(filePath) && !force) {
    throw new Error(`${fileName} already exists. Use --force to overwrite it.`)
  }

  fs.writeFileSync(filePath, `${comment}\n${template}`)
  console.log(`Generated ${fileName}`)
}
