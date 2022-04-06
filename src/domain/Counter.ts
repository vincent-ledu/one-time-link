export class Counter {
  counterName: string;
  counter: number;
  updatedAt: string;
  createdAt: string;

  constructor(
    counterName: string,
    counter: number,
    updatedAt: string,
    createdAt: string
  ) {
    this.counterName = counterName;
    this.counter = counter;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
