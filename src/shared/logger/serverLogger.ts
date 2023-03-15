import { ILogger } from '../types/ILogger'
import * as chalk from 'chalk'

/**
 * Logger to log server actions
 * @param prefix
 */
export const createServerLogger = (prefix: string = 'server'): ILogger => ({
  log: (...data: any[]) => {
    console.log(chalk.green(`${prefix}::> ` + data.join(' ')))
  },
})
