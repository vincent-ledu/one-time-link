import { VError } from "verror";

export default class InternalError extends VError {
  constructor(message = "Internal Error") {
    super({ name: "Internal Error" }, message);
  }
}
