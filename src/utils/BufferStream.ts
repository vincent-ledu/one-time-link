import { Writable, WritableOptions } from "stream";

export class BufferStream extends Writable {
  content: Buffer;
  constructor(options: WritableOptions) {
    super(options);
    this.content = Buffer.from("");
  }
  _write(chunk: Buffer, enc: BufferEncoding, next: () => void) {
    this.content = Buffer.concat([this.content, chunk]);
    next();
  }
}
