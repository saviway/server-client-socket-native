import { SubscriberStorageAbstract } from './SubscriberStorageAbstract'

/**
 * Class to operate with subscribers
 */
export class InMemorySubscriberStorage extends SubscriberStorageAbstract {
  /**
   * Storage
   * @private
   */
  #_subscribers: Record<string, { status: boolean; updateTime: number }> = {}

  /**
   * Register subscriber by given client identifier
   * @param id {string}
   */
  subscribe(id: string): number {
    const time = new Date().getTime()
    if (this.#_subscribers[id] && this.#_subscribers[id].status) {
      // already subscribed
      return this.#_subscribers[id].updateTime
    }
    this.#_subscribers[id] = {
      status: true,
      updateTime: time,
    }
    return time
  }

  /**
   * Unsubscribe the client by given identifier
   * @param id
   */
  unsubscribe(id: string): number {
    const time = new Date().getTime()
    if (this.#_subscribers[id] && !this.#_subscribers[id].status) {
      return this.#_subscribers[id].updateTime
    }
    this.#_subscribers[id] = {
      status: false,
      updateTime: time,
    }
    return time
  }

  /**
   * Count all subscribers
   */
  countSubscribers(): [number, number] {
    const array = Object.values(this.#_subscribers).filter((s) => s.status)
    return [array.length, new Date().getTime()]
  }
}
