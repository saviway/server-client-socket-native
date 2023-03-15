import { splitClientMessage } from '../../../src/server/serverOps'
import { MESSAGE_SEPARATOR } from '../../../src/shared/constants'

describe('Server OPS', () => {
  it('should split series of messages correctly', async () => {
    const str = `msg1${MESSAGE_SEPARATOR}msg2`
    const result: Array<string> = splitClientMessage(str)

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual('msg1')
    expect(result[1]).toEqual('msg2')
  })
})
