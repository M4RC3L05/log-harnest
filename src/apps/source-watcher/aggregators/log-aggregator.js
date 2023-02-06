export class LogAggregator {
  source;
  destination;

  constructor(source, destination) {
    this.source = source;
    this.destination = destination;
  }

  async close() {}
}
