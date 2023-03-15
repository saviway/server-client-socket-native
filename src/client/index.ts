import { createClient, ClientManager } from './client'
import * as dotenv from 'dotenv'
import { ISharedConfig } from '../shared/types/ISharedConfig'

import { defaultClientIdGenerator } from './defaultClientIdGenerator'
import { IClientDependencies } from './types'
import { createClientLogger } from '../shared/logger/clientLogger'
import { defaultRequestCodec } from './codecs/defaultRequestCodec'
import { CMD_COUNT_SUBSCRIBERS, CMD_SUBSCRIBE } from '../shared/types'
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

const logger = createClientLogger()

const clientId = defaultClientIdGenerator()

const clientDeps: IClientDependencies = {
  logger,
  responseDispatcher: (res) => {
    logger.log(`${clientId} got response: ${JSON.stringify(res)}`)
  },
  requestCodec: defaultRequestCodec,
}
const start = async () => {
  const clientMng = await createClient(() => clientId, sharedConfig)(clientDeps)
  clientMng.sendToServer(CMD_SUBSCRIBE)
  clientMng.sendToServer(CMD_COUNT_SUBSCRIBERS)
}

start().catch((e) => {
  console.error(e)
})
