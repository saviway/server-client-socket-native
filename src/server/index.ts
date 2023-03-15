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
dotenv.config()

const sharedConfig: ISharedConfig = {
  port: ((p: string | undefined) => {
    if (!p) {
      return 8080
    }
    const pInt = parseInt(p)

    return isNaN(pInt) ? 8080 : pInt
  })(process.env.HTTP_PORT),
}

const serverDeps: IServerDependencies = {
  logger: createServerLogger(),
  clientResponseCodec: () => false, // todo
  commandDispatcher: () => false, // todo
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
