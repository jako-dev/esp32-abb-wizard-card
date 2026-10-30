import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/abb-welcome-wizard-card.ts',
      formats: ['es'],
      fileName: () => 'abb-welcome-wizard-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2021',
    sourcemap: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});
