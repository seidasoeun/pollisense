import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[/\\](react|react-dom)[/\\]/ },
            { name: 'vendor-charts', test: /node_modules[/\\](recharts|d3-|victory-vendor|clsx)[/\\]/ },
          ],
        },
      },
    },
  },
});
