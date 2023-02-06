export const makeLog = (name, raw, maps = {}) => ({
  name,
  maps,
  raw: raw.trim(),
  timestamp: new Date().toISOString(),
});

export class LogAggregatorDestination {
  async write(_logs) {}
}
