import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { map } from 'fp-ts/Array'
import { bufferToString, splitMessagesToChunks } from '../shared/utils/parsers'
import { IGenericServerResponse } from '../shared/types'
import { error } from 'fp-ts/Console'

export const parseServerResponse = (
  arr: Array<string>
): Array<E.Either<string, IGenericServerResponse>> =>
  pipe(
    arr,
    map((c: string) =>
      E.tryCatch(
        () => JSON.parse(c),
        (e) => `Unable to parse server response ${e}`
      )
    )
  )

export const parseServerResponsePipeline = (
  data: Buffer
): Array<E.Either<string, IGenericServerResponse>> =>
  pipe(data, bufferToString, splitMessagesToChunks, parseServerResponse)
