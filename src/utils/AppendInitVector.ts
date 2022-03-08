import { Transform, TransformCallback, TransformOptions } from "stream";

export class AppendInitVect extends Transform {
  initVect: Buffer;
  appended: boolean;
  constructor(initVect: Buffer, opts: TransformOptions) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    callback();
  }
}
