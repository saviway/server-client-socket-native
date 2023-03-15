import { ILogger } from '../types'
import * as chalk from 'chalk'

/**
 * Logger to log server actions
 * @param prefix
 */
export const createClientLogger = (prefix: string = 'client'): ILogger => ({
  log: (...data: any[]) => {
    console.log(chalk.grey(`${prefix}::> ` + data.join(' ')))
  },
})
