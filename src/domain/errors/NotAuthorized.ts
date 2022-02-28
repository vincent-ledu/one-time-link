import VError from "verror";

export default class NotAuthorized extends VError {
  constructor(message = "Operation not authorized") {
    super({ name: "NOT_AUTHORIZED" }, message);
  }
}
