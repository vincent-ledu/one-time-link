import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

export class Secret {
  id: string;
  message: string;
  attachmentFilename: string;

  constructor(id?: string, message?: string, attachmentFilename?: string) {
    this.id = id || uuidv4();
    this.message = message || "";
    this.attachmentFilename = attachmentFilename || undefined;
  }
}
