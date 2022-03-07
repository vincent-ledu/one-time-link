import { v4 as uuidv4 } from "uuid";

export class Secret {
  id: string;
  message: string;
  date: string;
  attachmentFilename: string;
  password: string;

  constructor(
    id?: string,
    message?: string,
    attachmentFilename?: string,
    password?: string,
    date?: string
  ) {
    this.id = id || uuidv4();
    this.message = message || "";
    this.password = password || "";
    this.attachmentFilename = attachmentFilename || undefined;
    this.date = date || new Date().toISOString().split("T")[0];
  }
}
