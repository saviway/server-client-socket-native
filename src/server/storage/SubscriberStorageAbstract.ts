export abstract class SubscriberStorageAbstract {
  abstract subscribe(id: string): number
  abstract unsubscribe(id: string): number

  abstract countSubscribers(): [number, number]
}
