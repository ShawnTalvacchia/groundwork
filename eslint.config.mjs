import next from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.claude/worktrees/**',
    ],
  },
  ...next,
]

export default config
