import * as E from 'fp-ts/Either'
import { splitClientMessages, parseClientMessages } from '../../../src/server/serverOps'
import { CLIENT_ID_SEPARATOR, MESSAGE_SEPARATOR } from '../../../src/shared/constants'
import { CMD_COUNT_SUBSCRIBERS, CMD_SUBSCRIBE, IClientRequest } from '../../../src/shared/types'

describe('Server OPS', () => {
  it('should split series of messages correctly', async () => {
    const str = `msg1${MESSAGE_SEPARATOR}msg2`
    const result: Array<string> = splitClientMessages(str)

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual('msg1')
    expect(result[1]).toEqual('msg2')
  })

  it('should parse client messages', async () => {
    const messages: Array<string> = [
      `client-1${CLIENT_ID_SEPARATOR}{"type": "${CMD_SUBSCRIBE}"}`,
      `client-2${CLIENT_ID_SEPARATOR}{"type": "${CMD_COUNT_SUBSCRIBERS}"}`,
      `client-3${CLIENT_ID_SEPARATOR}{"type":}`, // another one to get an error
    ]
    const result: Array<E.Either<string, IClientRequest>> = parseClientMessages(messages)
    expect(messages.length).toEqual(3)
    expect(E.isRight(result[0])).toEqual(true)
    expect(E.isRight(result[1])).toEqual(true)
    expect(E.isRight(result[2])).toEqual(false)

    E.fold(
      () => {},
      (v: IClientRequest) => {
        expect(v.command).toEqual(CMD_SUBSCRIBE)
      }
    )(result[0])

    E.fold(
      () => {},
      (v: IClientRequest) => {
        expect(v.command).toEqual(CMD_COUNT_SUBSCRIBERS)
      }
    )(result[1])
    E.fold(
      (e) => {
        expect(e).toEqual('Bad formatted payload, non JSON') // i know the constant need to be here
      },
      (v: IClientRequest) => {}
    )(result[2])
  })
})
