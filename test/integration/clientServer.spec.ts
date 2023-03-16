import { createServer, ServerConfig, ServerManager } from '../../src/server/server'
import { createClient, ClientManager } from '../../src/client/client'
import {
  CMD_COUNT_SUBSCRIBERS,
  CMD_SUBSCRIBE,
  CMD_UNSUBSCRIBE,
  IClientRequest,
  IGenericServerResponse,
  ILogger,
} from '../../src/shared/types'
import { IServerDependencies } from '../../src/server/types'
import { defaultCodec } from '../../src/server/codecs'
import { ISharedConfig } from '../../src/shared/types/ISharedConfig'
import { IClientDependencies } from '../../src/client/types'
import { defaultRequestCodec } from '../../src/client/codecs/defaultRequestCodec'
import * as E from 'fp-ts/Either'
import { ICommandHandlerDependencies } from '../../src/server/types/ICommandHandlerDependencies'
import { defaultClientCmdDispatcher } from '../../src/server/cmd-dispatchers'
import { InMemorySubscriberStorage } from '../../src/server/storage/InMemorySubscriberStorage'

function* counter() {
  let counter = 0
  while (true) {
    yield (counter += 1)
  }
}

describe('Client - Server integration test', () => {
  const gottenCommands: Record<number, IClientRequest> = {}
  const gottenResponses: Record<number, IGenericServerResponse> = {}

  const defaultLogger: ILogger = {
    log: (...a: any[]) => {
      console.log(...a)
    },
  }
  const sharedConfig: ISharedConfig = {
    port: 8180,
  }

  const testCmdDispatcherDeps: ICommandHandlerDependencies = {
    subscriberStorage: new InMemorySubscriberStorage(),
    logger: defaultLogger,
  }

  const cmdCounter = counter()
  const serverDeps: IServerDependencies = {
    logger: defaultLogger,
    clientResponseCodec: defaultCodec,
    sharedConfig,
    commandDispatcher: (msg: IClientRequest) => {
      gottenCommands[cmdCounter.next().value!] = msg
      return defaultClientCmdDispatcher(msg)(testCmdDispatcherDeps)
    },
  }
  const defaultServerConfig: ServerConfig = {
    // ...serverConfig,
    awaitingTime: {},
    enableHeartBeatResponse: false,
    heartBeatInterval: 1000,
  }

  const resCounter = counter()
  const clientDeps: IClientDependencies = {
    logger: defaultLogger,
    requestCodec: defaultRequestCodec,
    responseDispatcher: (response: IGenericServerResponse) => {
      const c = resCounter.next().value!
      gottenResponses[c] = response
    },
  }

  const executeWithDelay = async (fn: () => void, delay: number): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(fn())
      }, delay)
    })

  it('should process the responses in predictable order', async () => {
    const server: E.Either<Error, ServerManager> = createServer(defaultServerConfig)(serverDeps)

    // start server
    E.fold(
      (e) => {
        console.error(e)
      },
      (srv: ServerManager) => {
        srv.server.listen(sharedConfig.port, () => {})
      }
    )(server)

    // start client
    const client1: ClientManager = await createClient(() => 'client-1', sharedConfig)(clientDeps)

    client1.sendToServer(CMD_SUBSCRIBE)
    client1.sendToServer(CMD_SUBSCRIBE)

    client1.sendToServer(CMD_COUNT_SUBSCRIBERS)
    client1.sendToServer(CMD_UNSUBSCRIBE)
    client1.sendToServer(CMD_COUNT_SUBSCRIBERS)

    await executeWithDelay(() => {
      // check commands order
      expect(gottenCommands[1].command).toEqual(CMD_SUBSCRIBE)
      expect(gottenCommands[2].command).toEqual(CMD_SUBSCRIBE)
      expect(gottenCommands[3].command).toEqual(CMD_COUNT_SUBSCRIBERS)
      expect(gottenCommands[4].command).toEqual(CMD_UNSUBSCRIBE)
      expect(gottenCommands[5].command).toEqual(CMD_COUNT_SUBSCRIBERS)
      // it must be only 5 commands given and 6 should be undefined
      expect(gottenCommands[6]).toBeUndefined()

      // check responses
      expect(gottenResponses[1].type).toEqual(CMD_SUBSCRIBE)
      expect(gottenResponses[2].type).toEqual(CMD_SUBSCRIBE)
      // check idempotence - response two must have same time with req 1 cause the client already subscribed
      expect(gottenResponses[2].updatedAt).toEqual(gottenResponses[1].updatedAt)
      expect(gottenResponses[3].type).toEqual(CMD_COUNT_SUBSCRIBERS)
      // we tried to subscribe two times but must have subscribers count equal to 1 cause already subscribed after 1 request
      expect((gottenResponses[3] as IGenericServerResponse & { count: number }).count).toEqual(1)

      expect(gottenResponses[4].type).toEqual(CMD_UNSUBSCRIBE)
      expect(gottenResponses[5].type).toEqual(CMD_COUNT_SUBSCRIBERS)
      // we should have 0 subscribers cause we unsubscribed
      expect((gottenResponses[5] as IGenericServerResponse & { count: number }).count).toEqual(0)
    }, 1000)
  })
})
