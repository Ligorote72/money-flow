// Triggering Vite reload for new dependencies
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-512.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'MoneyFlow - Control de Gastos',
        short_name: 'MoneyFlow',
        description: 'Tu plataforma financiera personal premium con sincronización en la nube.',
        theme_color: '#06090f',
        background_color: '#06090f',
        display: 'standalone',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
