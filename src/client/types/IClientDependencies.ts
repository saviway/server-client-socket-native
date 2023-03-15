import { ILogger } from '../../shared/types'

export interface IClientDependencies {
  logger: ILogger

  responseDispatcher: (data: Buffer) => unknown // todo
  requestCodec: (c: unknown) => string
}
