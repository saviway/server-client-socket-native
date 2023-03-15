import { ILogger } from '../../shared/types/ILogger'
import { ISharedConfig } from '../../shared/types/ISharedConfig'
import { Reader } from 'fp-ts/Reader'
import { ICommandHandlerDependencies } from './ICommandHandlerDependencies'

export interface IServerDependencies {
  logger: ILogger

  sharedConfig: ISharedConfig

  clientResponseCodec: unknown
  // commandDispatcher: (msg: unknown) => Reader<ICommandHandlerDependencies, string> // todo replace unknown
  commandDispatcher: (msg: unknown) => string // todo replace unknown
}
