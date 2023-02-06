export class LogAggregatorSource {
  constructor(source) {
    Object.assign(this, source);
  }

  onData(_fn) {}
  onClose(_fn) {}
  onError(_fn) {}
  async close() {}
}
