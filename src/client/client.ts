import * as net from 'net'
import { Lazy, pipe } from 'fp-ts/function'

import { ISharedConfig } from '../shared/types/ISharedConfig'
import { Reader } from 'fp-ts/Reader'
import { IClientDependencies } from './types'
import { Command, IClientPayload } from '../shared/types'

const createCommand = (cmd: Command): IClientPayload => ({ type: cmd })

export type ClientManager = {
  socket: net.Socket
  sendToServer: (msg: Command) => void
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
            socket.write(pipe(cmd, createCommand, deps.requestCodec))
          },
        })
      })

      socket.setEncoding('utf-8')

      socket.on('data', (data: Buffer) => {
        // todo
      })

      socket.on('end', () => deps.logger.log(`Client ${clientId} stopped`))
    })
