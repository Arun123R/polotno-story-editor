import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: [
      {
        find: /^@blueprintjs\/icons$/,
        // point to local proxy module (ESM)
        replacement: fileURLToPath(new URL('./src/blueprint-icons-proxy/proxy.jsx', import.meta.url)),
      },
    ],
  },
})
