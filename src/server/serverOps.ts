// utils the server use to decode client request into IClientRequest
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { map, filter } from 'fp-ts/Array'

import { CLIENT_ID_SEPARATOR, MESSAGE_SEPARATOR } from '../shared/constants'
import { IClientPayload, IClientRequest } from '../shared/types'
import { pipe } from 'fp-ts/function'

/**
 * Convert Buffer into string
 * @param buff
 */
export const bufferToString = (buff: Buffer): string => buff.toString()

/**
 * Split series of client messages into array of message
 * @param str
 */
export const splitClientMessages = (str: string): Array<string> =>
  str.split(MESSAGE_SEPARATOR).filter((c) => !!c)

/**
 * Parse array of client raw payload into array of Either with left value as error message or right value as IClientResponse
 * @param messages
 */
export const parseClientMessages = (
  messages: Array<string>
): Array<E.Either<string, IClientRequest>> =>
  pipe(
    messages,
    map((i: string) => i.split(CLIENT_ID_SEPARATOR)),
    filter((a: string[]) => !!a[0] && !!a[1]),
    map((i: string[]) =>
      E.tryCatch(
        () => {
          const payload: IClientPayload = JSON.parse(i[1])
          return {
            id: i[0],
            command: payload.type,
          }
        },
        () => 'Bad formatted payload, non JSON'
      )
    )
  )

/**
 * Full pipeline of parsing client message
 * @param data
 */
export const parseClientRequestsPipeline = (
  data: Buffer
): Array<E.Either<string, IClientRequest>> =>
  pipe(data, bufferToString, splitClientMessages, parseClientMessages)

export const getAwaitTime =
  (k: string) =>
  (awaitingMap: Record<string, number>): number =>
    pipe(
      O.fromNullable(awaitingMap[k]),
      O.getOrElse(() => 0)
    )
