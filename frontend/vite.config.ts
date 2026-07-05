import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    commonjsOptions: {
      // חבילת "shared" מקושרת דרך pnpm workspace symlink, כך שהנתיב האמיתי שלה
      // נמצא מחוץ ל-node_modules - יש לכלול אותה במפורש כדי ש-Rollup ינתח נכון
      // את הייצוא בעת build (אחרת מתקבל "X is not exported by shared/dist/index.js").
      include: [/shared/, /node_modules/]
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