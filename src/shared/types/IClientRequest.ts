import { Command } from './Command'

/**
 * Describes PARSED client request.
 * Please note it's not the type of data which the client's really sending
 */
export interface IClientRequest {
  id: string
  command: Command
}
