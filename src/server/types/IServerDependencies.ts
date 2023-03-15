import { ILogger } from '../../shared/types/ILogger'
import { ISharedConfig } from '../../shared/types/ISharedConfig'

export interface IServerDependencies {
  logger: ILogger

  sharedConfig: ISharedConfig

  clientResponseCodec: unknown
  commandDispatcher: unknown
}
