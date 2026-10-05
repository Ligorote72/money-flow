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
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
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
        ],
        shortcuts: [
          {
            name: 'Chat Asistente IA',
            short_name: 'Asistente IA',
            description: 'Chatea y dicta tus finanzas con MoneyFlow IA',
            url: '/?tab=chat',
            icons: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
          },
          {
            name: 'Dictar con IA',
            short_name: 'Voz IA',
            description: 'Registra un movimiento por voz con IA',
            url: '/?action=voice',
            icons: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
          },
          {
            name: 'Nuevo Gasto',
            short_name: 'Gasto',
            description: 'Registrar un gasto rápidamente',
            url: '/?action=expense',
            icons: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
          }
        ]
      }
    })
  ],
})
