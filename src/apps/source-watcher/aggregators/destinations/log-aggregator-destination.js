export class LogAggregatorDestination {
  async write(_logs) {}

  makeLog(name, raw, maps = {}) {
    return {
      name,
      maps,
      raw: raw.trim(),
      timestamp: new Date().toISOString(),
    };
  }
}
