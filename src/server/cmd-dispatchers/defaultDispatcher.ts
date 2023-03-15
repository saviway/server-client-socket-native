import { Reader } from 'fp-ts/Reader'
import { ICommandHandlerDependencies } from '../types/ICommandHandlerDependencies'

// todo
export const defaultDispatcher =
  (cmd: unknown): Reader<ICommandHandlerDependencies, string> =>
  (deps) => {
    deps.logger.log('cmd given', cmd)
    return cmd as string // todo
  }
