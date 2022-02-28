import { v4 as uuidv4 } from "uuid";

export class Secret {
  id: string;
  message: string;
  attachmentFilename: string;
  password: string;

  constructor(
    id?: string,
    message?: string,
    attachmentFilename?: string,
    password?: string
  ) {
    this.id = id || uuidv4();
    this.message = message || "";
    this.password = this.password || "";
    this.attachmentFilename = attachmentFilename || undefined;
  }
}
