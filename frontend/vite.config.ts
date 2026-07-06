import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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