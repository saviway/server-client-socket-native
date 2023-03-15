import { Reader } from 'fp-ts/Reader'
import { ICommandHandlerDependencies } from '../types/ICommandHandlerDependencies'
import {
  CMD_COUNT_SUBSCRIBERS,
  CMD_SUBSCRIBE,
  CMD_UNSUBSCRIBE,
  IClientRequest,
  IGenericServerResponse,
  RES_STATUS_SUBSCRIBED,
  RES_STATUS_UNSUBSCRIBED,
} from '../../shared/types'

/**
 * Dispatch and process client messages and produces IGenericServerResponse as a result
 * @param cmd
 */
export const defaultDispatcher =
  (cmd: IClientRequest): Reader<ICommandHandlerDependencies, IGenericServerResponse> =>
  (deps) => {
    const { command, id } = cmd
    const currentTime = new Date().getTime()
    switch (command) {
      case 'Subscribe': {
        const time = deps.subscriberStorage.subscribe(id) // idempotent
        return {
          type: CMD_SUBSCRIBE,
          status: RES_STATUS_SUBSCRIBED,
          updatedAt: time,
        }
      }
      case 'Unsubscribe': {
        const time = deps.subscriberStorage.unsubscribe(id) // idempotent
        return {
          type: CMD_UNSUBSCRIBE,
          status: RES_STATUS_UNSUBSCRIBED,
          updatedAt: time,
        }
      }
      case 'CountSubscribers': {
        const [count, updateTime] = deps.subscriberStorage.countSubscribers()
        return {
          type: CMD_COUNT_SUBSCRIBERS,
          count,
          updatedAt: updateTime,
        }
      }
      default: {
        return {
          type: 'Error',
          error: 'Requested method not implemented',
          updatedAt: currentTime,
        }
      }
    }
  }
