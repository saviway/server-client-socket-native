import {
  CMD_SUBSCRIBE,
  IGenericServerResponse,
  RES_STATUS_SUBSCRIBED,
} from '../../../src/shared/types'
import * as E from 'fp-ts/Either'
import { parseServerResponse } from '../../../src/client/clientOps'

describe('Server OPS', () => {
  it('should parse server response correctly', async () => {
    const fakeResponses: Array<string> = [
      `{"type": "${CMD_SUBSCRIBE}", "status": "${RES_STATUS_SUBSCRIBED}"}`,
      `{"type": "${CMD_SUBSCRIBE}", "status": xxx}`, // wrong one
    ]

    const result = parseServerResponse(fakeResponses)

    expect(result.length).toEqual(2)
    expect(E.isRight(result[0])).toEqual(true)
    expect(E.isLeft(result[1])).toEqual(true)

    E.map((x: IGenericServerResponse) => {
      expect(x.type).toEqual(CMD_SUBSCRIBE)
    })(result[0])
  })
})
