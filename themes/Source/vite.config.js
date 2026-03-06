import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'assets/built'),
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'assets/js/source.js'),
      output: {
        entryFileNames: 'source.js',
        assetFileNames: 'screen[extname]',
      },
    },
  },
});
