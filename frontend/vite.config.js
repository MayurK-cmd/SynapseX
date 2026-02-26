import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import taillwindcss from '@tailwindcss/vite' 
import {nodePolyfills} from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), taillwindcss(), nodePolyfills()],
   resolve: {
    alias: {
      // fix buffer/crypto issues from WalletConnect
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
})
