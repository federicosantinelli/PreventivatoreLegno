import { createHash } from 'node:crypto'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const password = env.VITE_ADMIN_PASSWORD
  if (!password) {
    throw new Error('VITE_ADMIN_PASSWORD must be set in .env.local')
  }

  const passwordHash = createHash('sha256').update(password).digest('hex')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ADMIN_PASSWORD_HASH': JSON.stringify(passwordHash),
    },
  }
})
