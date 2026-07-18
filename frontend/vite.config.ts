import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'sitemap.xml', 'og-image.jpg'],
      manifest: {
        name: 'דוד הובלות · Movalo',
        short_name: 'דוד הובלות',
        description: 'אתר הלקוחות של דוד הובלות — הצעת מחיר, מעקב הובלה ותשלום',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/demo',
        scope: '/',
        icons: [
          {
            src: '/og-image.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // מפנה ישירות למקורות TS של shared — מונע בעיית CJS/ESM בסביבת dev
      // (ב-production build, Rollup קורא מ-dist דרך package.json "main")
      'shared': path.resolve(__dirname, '../shared/src/index.ts')
    }
  },
  build: {
    commonjsOptions: {
      // נדרש רק עבור תלויות CJS בתוך node_modules (לא shared, שכבר מנוטרל ע"י alias)
      include: [/node_modules/]
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
