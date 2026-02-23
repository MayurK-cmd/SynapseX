import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import taillwindcss from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), taillwindcss()],
})
