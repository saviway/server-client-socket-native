import * as net from 'net'
import { Lazy, pipe } from 'fp-ts/function'
import { map } from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { ISharedConfig } from '../shared/types/ISharedConfig'
import { Reader } from 'fp-ts/Reader'
import { IClientDependencies } from './types'
import { Command, IClientPayload, IClientRequest } from '../shared/types'
import { parseServerResponsePipeline } from './clientOps'
import * as process from 'process'

const createCommand = (cmd: Command, clientId: string): IClientRequest => ({
  command: cmd,
  id: clientId,
})

export type ClientManager = {
  socket: net.Socket
  sendToServer: (msg: Command) => void

  shutdown: () => void
}
export const createClient =
  (
    clientIdGenerator: Lazy<string>,
    sharedConfig: ISharedConfig
  ): Reader<IClientDependencies, Promise<ClientManager>> =>
  (deps) =>
    new Promise((resolve) => {
      const clientId = clientIdGenerator()

      const socket = net.createConnection({ port: sharedConfig.port }, () => {
        deps.logger.log(`Client ${clientId} is ready to operate with server.`)
        resolve({
          socket,
          sendToServer: (cmd: Command) => {
            socket.write(pipe(cmd, (c) => createCommand(c, clientId), deps.requestCodec))
          },
          shutdown: () => {
            process.exit(0)
          },
        })
      })

      socket.setEncoding('utf-8')

      socket.on('data', (data: Buffer) =>
        pipe(
          data,
          parseServerResponsePipeline,
          map((r) =>
            pipe(
              r,
              E.map((v) => deps.responseDispatcher(v)),
              E.mapLeft((e) => deps.logger.log(`Error: ${e}`))
            )
          )
        )
      )
      socket.on('close', () => {
        deps.logger.log(`Client ${clientId} disconnected`)
      })

      socket.on('end', () => deps.logger.log(`Client ${clientId} stopped`))
    })
