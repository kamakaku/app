import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Needed for Docker
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true // Needed for Docker on some systems
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'firebase'],
          ui: ['antd', '@ant-design/icons'],
          pdf: ['react-pdf', 'pdfjs-dist']
        }
      }
    }
  }
});