import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
      },
      manifest: {
        name: '神器戰爭 War of Relics',
        short_name: '神器戰爭',
        description: '奇幻 Roguelite 回合制戰鬥遊戲',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
