import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      // rollupOptions: {
      //   input: {
      //     main: resolve('src/main/index.ts'),
      //     _worker: resolve('src/langcore/_worker.ts')
      //   },
      //   output: {
      //     dir: resolve(__dirname, 'out/main'),
      //     format: 'cjs'
      //   }
      // }
    },
    resolve: {
      alias: {
        '@/lib': resolve('src/main/lib'),
        '@langcore': resolve('src/langcore')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    assetsInclude: 'src/renderer/assets/**',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@langcore': resolve('src/langcore'),
        '@/hooks': resolve('src/renderer/src/hooks'),
        '@/assets': resolve('src/renderer/src/assets'),
        '@/components': resolve('src/renderer/src/components')
      }
    },
    plugins: [react()]
  }
})
