import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 將站台掛在 /pixel-game/ 子路徑下
  // 本機 dev 不受影響（Vite dev server 會自動處理 base）
  base: '/pixel-game/',
})
