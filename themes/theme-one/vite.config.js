import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'assets/built'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'assets/js/index.js'),
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index[extname]',
      },
    },
  },
});
