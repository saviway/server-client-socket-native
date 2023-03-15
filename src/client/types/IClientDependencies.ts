import { IClientRequest, IGenericServerResponse, ILogger } from '../../shared/types'

export interface IClientDependencies {
  logger: ILogger

  responseDispatcher: (response: IGenericServerResponse) => void
  requestCodec: (c: IClientRequest) => string
}
