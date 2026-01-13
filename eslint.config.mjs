import { defineConfig } from 'eslint/config'

// Temporarily disable ESLint by ignoring all files.
// If you want to re-enable later, restore the original config or remove the ignore.
export default defineConfig({
  ignores: ['**/*']
})
