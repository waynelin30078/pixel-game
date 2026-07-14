import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 會將站台掛在 /<repo-name>/ 子路徑下
  // 透過環境變數注入，本機 dev 預設為 '/'
  base: process.env.VITE_BASE_URL ?? '/',
})
