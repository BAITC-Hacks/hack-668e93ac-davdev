import { spawn } from 'node:child_process'

import { loadEnv } from 'vite'

const isProduction = process.argv.includes('--production')
const mode = isProduction ? 'production' : 'development'

const env = loadEnv(mode, process.cwd(), '')

const isWindows = process.platform === 'win32'

const command = isWindows ? 'pnpm.cmd' : 'pnpm'

const args = isProduction
  ? ['tauri', 'android', 'build']
  : ['tauri', 'android', 'dev']

console.log(`Vite mode: ${mode}`)
console.log(`Telegram client: ${env.TELEGRAM_CLIENT_ID}`)
console.log(`Telegram redirect: ${env.TELEGRAM_REDIRECT_URI}`)

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    TELEGRAM_CLIENT_ID: env.TELEGRAM_CLIENT_ID,
    TELEGRAM_REDIRECT_URI: env.TELEGRAM_REDIRECT_URI,
  },
  ...(isWindows ? { shell: true } : {}),
})

child.on('error', (error) => {
  console.error('Failed to start Tauri:', error)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
