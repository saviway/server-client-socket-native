import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { createServer } from './server'
import * as net from 'net'
import * as dotenv from 'dotenv'
import { ISharedConfig } from '../shared/types/ISharedConfig'
import * as process from 'process'
import { serverConfig } from './serverConfig'
import { IServerDependencies } from './types'
import { createServerLogger } from '../shared/logger/serverLogger'
import { defaultClientCmdDispatcher } from './cmd-dispatchers'
import { ICommandHandlerDependencies } from './types/ICommandHandlerDependencies'
import { InMemorySubscriberStorage } from './storage/InMemorySubscriberStorage'
dotenv.config()

/**
 * Shared config
 */
const sharedConfig: ISharedConfig = {
  port: ((p: string | undefined) => {
    if (!p) {
      return 8080
    }
    const pInt = parseInt(p)

    return isNaN(pInt) ? 8080 : pInt
  })(process.env.HTTP_PORT),
}

/**
 * dependencies of command handler
 */
const commandHandlerDeps: ICommandHandlerDependencies = {
  logger: createServerLogger('server/cmdHandler'),
  subscriberStorage: new InMemorySubscriberStorage(),
}

/**
 * Server dependencies
 */
const serverDeps: IServerDependencies = {
  logger: createServerLogger(),
  clientResponseCodec: () => false, // todo
  commandDispatcher: (cmd) => defaultClientCmdDispatcher(cmd)(commandHandlerDeps),
  sharedConfig,
}

const start = () =>
  pipe(
    createServer(serverConfig)(serverDeps),
    E.fold(
      (e) => {
        throw new Error(e.message)
      },
      (srv: net.Server) => {
        srv.listen(sharedConfig.port, () => {
          serverDeps.logger.log('Server started')
        })
      }
    )
  )

// start the server
start()
