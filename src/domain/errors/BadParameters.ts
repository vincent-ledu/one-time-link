import { VError } from "verror";

export default class BadParameters extends VError {
  constructor() {
    super("Bad parameters");
  }
}
