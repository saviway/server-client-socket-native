// utils the server use to decode client request into IClientRequest

import { MESSAGE_SEPARATOR } from '../shared/constants'

/**
 * Convert Buffer into string
 * @param buff
 */
export const bufferToString = (buff: Buffer): string => buff.toString()

/**
 * Split series of client messages into array of message
 * @param str
 */
export const splitClientMessage = (str: string): Array<string> =>
  str.split(MESSAGE_SEPARATOR).filter((c) => !!c)
