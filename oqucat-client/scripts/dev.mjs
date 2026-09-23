import { spawn } from 'node:child_process'

import dotenv from 'dotenv'

const isLocal = process.argv[2] === 'local'
const viteCommand = process.platform === 'win32' ? 'vp.cmd' : 'vp'

dotenv.config({ path: isLocal ? '.env.local' : '.env' })

const child = spawn(viteCommand, ['dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exitCode = code ?? 1
})
