import { IGenericServerResponse } from '../../shared/types'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

/**
 * Codec to encode the response to the client
 * @param res
 */
export const defaultCodec = (res: IGenericServerResponse): string =>
  pipe(
    E.tryCatch(
      () => JSON.stringify(res),
      () => 'Unable to encode response.'
    ),
    E.fold(
      (err) =>
        JSON.stringify({
          type: 'Error',
          error: err,
          updatedAt: new Date().getTime(),
        }),
      (v) => v
    )
  )
