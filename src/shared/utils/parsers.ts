import { MESSAGE_SEPARATOR } from '../constants'

/**
 * Convert Buffer into string
 * @param buff
 */
export const bufferToString = (buff: Buffer): string => buff.toString()

/**
 * Split series of client messages into array of message
 * @param str
 */
export const splitMessagesToChunks = (str: string): Array<string> =>
  str.split(MESSAGE_SEPARATOR).filter((c) => !!c)
