export class LogAggregatorDestination {
  async write(_logs) {}
  async close() {}

  makeLog(name, raw, maps = {}, timestamp = new Date()) {
    return { name, maps, raw, timestamp };
  }
}
