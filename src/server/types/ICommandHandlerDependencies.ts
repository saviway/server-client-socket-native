import { SubscriberStorageAbstract } from '../storage/SubscriberStorageAbstract'
import { ILogger } from '../../shared/types/ILogger'

/**
 * Describes the dependencies of client command handler
 */
export interface ICommandHandlerDependencies {
  logger: ILogger
  subscriberStorage: SubscriberStorageAbstract
}
