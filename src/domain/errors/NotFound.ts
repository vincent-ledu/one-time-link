import VError from "verror";

export default class NotFound extends VError {
  constructor(message = "Resource not found") {
    super({ name: "NOT_FOUND" }, message);
  }
}
