import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '快递单号管理 v4.0',
        short_name: '快递管理',
        description: '移动端快递单号管理工具',
        theme_color: '#2563eb',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/tracking-tool/',
        scope: '/tracking-tool/',
        icons: [
          { src: '/tracking-tool/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/tracking-tool/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/tracking-tool/',
});
