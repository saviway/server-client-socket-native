import { IClientRequest } from '../../shared/types'
import { CLIENT_ID_SEPARATOR } from '../../shared/constants'

/**
 * Default request codec
 * @param p
 */
export const defaultRequestCodec = (p: IClientRequest): string =>
  `${p.id}${CLIENT_ID_SEPARATOR}${JSON.stringify({ type: p.command })}`
