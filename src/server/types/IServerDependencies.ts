import { IClientRequest, IGenericServerResponse, ILogger } from '../../shared/types'
import { ISharedConfig } from '../../shared/types/ISharedConfig'
import { Reader } from 'fp-ts/Reader'
import { ICommandHandlerDependencies } from './ICommandHandlerDependencies'

export interface IServerDependencies {
  logger: ILogger

  sharedConfig: ISharedConfig

  clientResponseCodec: (str: IGenericServerResponse) => string
  commandDispatcher: (msg: IClientRequest) => IGenericServerResponse
}
