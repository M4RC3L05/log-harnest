export class LogAggregatorSource {
  name;
  maps;

  constructor(name, maps) {
    this.name = name;
    this.maps = maps;
  }

  onData(_fn) {}
  onClose(_fn) {}
  onError(_fn) {}
  async close() {}
}
