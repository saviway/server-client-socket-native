import { CMD_COUNT_SUBSCRIBERS, CMD_SUBSCRIBE, CMD_UNSUBSCRIBE } from './Command'

export type ServerResponseType =
  | typeof CMD_SUBSCRIBE
  | typeof CMD_COUNT_SUBSCRIBERS
  | typeof CMD_UNSUBSCRIBE
  | 'HeartBeat'
  | 'Error'
export interface IGenericServerResponse {
  type: ServerResponseType
  updatedAt: number
}
