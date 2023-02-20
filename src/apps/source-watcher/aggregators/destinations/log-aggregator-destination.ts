export type Log = {
  name: string;
  raw: Record<string, unknown>;
  maps: Record<string, string>;
  timestamp: Date;
};

export class LogAggregatorDestination {
  async write(_logs: Log | Log[]) {
    //
  }

  async close() {
    //
  }

  makeLog(name: string, raw: Record<string, unknown>, maps = {}, timestamp = new Date()): Log {
    return { name, maps, raw, timestamp };
  }
}
