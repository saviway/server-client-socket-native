import { Lazy } from 'fp-ts/function'

/**
 * Functions used to generate id for the client instance
 */
export const defaultClientIdGenerator: Lazy<string> = () => `client-${new Date().getTime()}`
