import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // Dynamically load the key from .env.local only in development mode
  let geminiKey = '';
  if (command === 'serve') {
    try {
      const envPath = path.resolve(__dirname, '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8').trim();
        if (content) {
          if (content.includes('=')) {
            const match = content.match(/(?:VITE_)?GEMINI_API_KEY=(.*)/);
            if (match) geminiKey = match[1].trim();
          } else {
            // If it's just the raw key string
            geminiKey = content;
          }
        }
      }
    } catch (e) {
      console.error('Failed to read .env.local in vite.config.ts:', e);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey || process.env.VITE_GEMINI_API_KEY || ''),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey || process.env.VITE_GEMINI_API_KEY || ''),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
