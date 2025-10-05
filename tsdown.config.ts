import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.tsx'],
  format: ['esm'],
  platform: 'node',
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  minify: false,
  sourcemap: true,
  watch: false, // Enable with --watch flag
  external: [
    'react',
    'ink',
    'chalk',
    'commander',
    'conf',
    'execa',
    '@linear/sdk',
    '@ai-sdk/openai',
    'ai',
    'better-sqlite3',
    'drizzle-orm'
  ]
})
