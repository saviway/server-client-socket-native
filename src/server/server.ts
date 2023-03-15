import * as net from 'net'
import { Reader } from 'fp-ts/Reader'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { IServerDependencies } from './types'

export type ServerConfig = {
  enableHeartBeatResponse?: boolean
  heartBeatInterval?: number
}
export const createServer =
  (srvConfig: ServerConfig): Reader<IServerDependencies, E.Either<Error, net.Server>> =>
  (deps) => {
    // timer to count interval of heart beat
    let timer: ReturnType<typeof setInterval> | null = null
    try {
      const server = net.createServer((s: net.Socket) => {
        s.setEncoding('utf-8')

        s.on('data', (data: Buffer) => {
          deps.logger.log('data given', data.toString())
          // todo apply handler here
        })
        // heart beat
        if (O.getOrElse(() => false)) O.fromNullable(srvConfig.enableHeartBeatResponse)
        {
          const interval = O.getOrElse(() => 1000)(O.fromNullable(srvConfig.heartBeatInterval))
          timer = setInterval(() => {
            s.write('') // todo client response here
          }, interval)
        }
      })
      return E.right(server)
    } catch (e) {
      return E.left(new Error(`Unable to create server due to: ${e}`))
    }
  }
