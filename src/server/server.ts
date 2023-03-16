import * as net from 'net'
import { Reader } from 'fp-ts/Reader'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { map } from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { IServerDependencies } from './types'
import { IClientRequest, IGenericServerResponse } from '../shared/types'
import { getAwaitTime, parseClientRequestsPipeline } from './serverOps'
import * as process from 'process'

export type ServerConfig = {
  enableHeartBeatResponse?: boolean
  heartBeatInterval?: number

  awaitingTime: Record<string, number>
}

export type ServerManager = {
  server: net.Server
  shutdown: () => void
}
export const createServer =
  (srvConfig: ServerConfig): Reader<IServerDependencies, E.Either<Error, ServerManager>> =>
  (deps) => {
    // timer to count interval of heart beat
    let timer: ReturnType<typeof setInterval> | null = null
    try {
      const server = net.createServer((s: net.Socket) => {
        s.setEncoding('utf-8')

        s.on('data', (data: Buffer) => {
          // deps.logger.log('data given', data.toString())
          // format client messages
          const clientMessages: Array<E.Either<string, IClientRequest>> =
            parseClientRequestsPipeline(data)

          // process messages from the client into responses
          const responses = pipe(
            clientMessages,
            map((r) =>
              pipe(
                r,
                E.fold<string, IClientRequest, IGenericServerResponse>(
                  (err: string) => ({
                    type: 'Error',
                    error: err,
                    updatedAt: new Date().getTime(),
                  }),
                  (req) => deps.commandDispatcher(req)
                )
              )
            )
          )

          // send response to the Client
          responses.forEach((r) => {
            const awaitTime = getAwaitTime(r.type)(srvConfig.awaitingTime)
            if (awaitTime > 0) {
              setTimeout(() => s.write(deps.clientResponseCodec(r)), awaitTime)
            } else {
              s.write(deps.clientResponseCodec(r))
            }
          })
        })
        // heart beat
        if (O.getOrElse(() => false)(O.fromNullable(srvConfig.enableHeartBeatResponse))) {
          const interval = O.getOrElse(() => 1000)(O.fromNullable(srvConfig.heartBeatInterval))
          timer = setInterval(() => {
            s.write(
              deps.clientResponseCodec({
                type: 'HeartBeat',
                updatedAt: new Date().getTime(),
              })
            )
          }, interval)
        }

        s.on('end', () => {
          // clear intervals if exists
          if (timer) {
            clearInterval(timer)
          }
        })
      })
      return E.right({
        server,
        shutdown: () => process.exit(0),
      })
    } catch (e) {
      return E.left(new Error(`Unable to create server due to: ${e}`))
    }
  }
