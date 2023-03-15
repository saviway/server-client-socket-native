import { ServerConfig } from './server'
import { CMD_SUBSCRIBE, CMD_UNSUBSCRIBE } from '../shared/types'

export const serverConfig: ServerConfig = {
  enableHeartBeatResponse: false,
  heartBeatInterval: 1000,
  awaitingTime: {
    [CMD_SUBSCRIBE]: 4000,
    [CMD_UNSUBSCRIBE]: 8000,
  },
}
