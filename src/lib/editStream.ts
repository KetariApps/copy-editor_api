import { Writable, WritableOptions } from "stream";
import { WorkerMessage } from "../workers/lib/types.js";
import { StreamMessage } from "./types.js";

export default class EditStream extends Writable {
  constructor(options?: WritableOptions) {
    super(options);
    // Add any additional setup if required
  }

  _write(
    chunk: StreamMessage,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.emit("data", chunk);

    callback();
  }
}
