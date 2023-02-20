export type SourceConfig = { name: string; maps: Record<string, string>; source: any };

export class LogAggregatorSource {
  name: string;
  maps: Record<string, string>;
  source: any;

  constructor(source: SourceConfig) {
    this.name = source.name;
    this.maps = source.maps;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.source = source.source;
  }

  onData(_fn: (data: string) => void) {
    //
  }

  onClose(_fn: () => void) {
    //
  }

  onError(_fn: (error: Error) => void) {
    //
  }

  async close() {
    //
  }
}
