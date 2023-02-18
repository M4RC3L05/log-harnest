export class LogAggregatorDestination {
  async write(_logs) {}

  makeLog(name, raw, maps = {}, timestamp = new Date()) {
    return { name, maps, raw, timestamp };
  }
}
