// oxlint-disable import/no-nodejs-modules
import path from 'node:path'

import { devToolsPlugin } from '@bakdotdev/dev-tools/vite-plugin'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import sitemap from 'vite-plugin-sitemap'
import { defineConfig, loadEnv } from 'vite-plus'

import packageJson from './package.json'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const host = env.TAURI_DEV_HOST

  return {
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version),
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react',
                test: /[\\/]node_modules[\\/](?:react|react-dom|react-router-dom)[\\/]/u,
              },
              {
                name: 'icons',
                test: /[\\/]node_modules[\\/](?:icons)/u,
              },
              {
                name: 'mui',
                test: /[\\/]node_modules[\\/](?:@mui|@emotion|@fontsource)[\\/]/u,
              },
              {
                name: 'charts',
                test: /[\\/]node_modules[\\/](?:recharts)[\\/]/u,
              },
              {
                name: 'i18n',
                test: /[\\/]node_modules[\\/](?:i18next|react-i18next|i18next-)[\\/]/u,
              },
              {
                name: 'realtime',
                test: /[\\/]node_modules[\\/](?:socket\.io-client)[\\/]/u,
              },
              {
                name: 'maps',
                test: /[\\/]node_modules[\\/](?:leaflet|react-leaflet|@react-leaflet)[\\/]/u,
              },
              {
                name: 'ui_utils',
                test: /[\\/]node_modules[\\/](?:react-markdown|react-syntax-highlighter|mui-image|mui-one-time-password-input)[\\/]/u,
              },
              {
                name: 'utils',
                test: /[\\/]node_modules[\\/](?:axios|date-fns|html5-qrcode|qrcode\.react)[\\/]/u,
              },
              {
                name: 'landing-3d',
                test: /[\\/]node_modules[\\/](?:three|@react-three|@dimforge|meshline|maath|detect-gpu|suspend-react|its-fine)[\\/]/u,
              },
              {
                name: 'vendor',
                test: /[\\/]node_modules[\\/]/u,
              },
            ],
          },
        },
      },
    },
    plugins: [
      tailwindcss(),
      ...(mode === 'development' ? [devToolsPlugin()] : []),
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      sitemap({
        hostname: 'https://oqucat.dav-dev.kz/',
      }),
      VitePWA({
        manifest: {
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          name: env.VITE_APP_NAME,
          short_name: env.VITE_APP_NAME,
          start_url: '/menu',
          theme_color: '#3f35fd',
        },
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        devOptions: {
          enabled: true,
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallbackDenylist: [/^\/api\//u, /^\/PrivacyPolicy\.doc$/u],
        },
      }),
      visualizer({
        filename: '.ignore/bundle-report.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      allowedHosts: ['dev.oqucat.dav-dev.kz'],
      hmr: host
        ? {
            host,
            port: 3000,
            protocol: 'ws',
          }
        : undefined,
      host: true,
      port: 3000,
      strictPort: true,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
    assetsInclude: ['**/*.glb'],
  }
})
