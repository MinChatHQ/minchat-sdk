import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Jest-like globals
    globals: true,
    // Environment
    environment: 'node',
    // Include test files
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    // Exclude files
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})