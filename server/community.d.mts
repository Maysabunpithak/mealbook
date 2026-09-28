import type { Connect } from 'vite'
export function createCommunityMiddleware(options?: { dataDir?: string; includeExamples?: boolean }): Connect.NextHandleFunction
