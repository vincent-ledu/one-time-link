import { expect } from "chai";
import { Secret } from "./Secret";
/* tslint:disable no-unused-expression */
describe("Testing Secret class", () => {
  it("should return an object with constructor()", () => {
    const s = new Secret();
    expect(s).not.to.be.undefined;
    expect(s.id).to.be.a.string;
    expect(s.attachmentFilename).to.be.undefined;
    expect(s.message).to.be.eq("");
  });
  it("should return an object with constructor('id')", () => {
    const s = new Secret("id");
    expect(s).not.to.be.undefined;
    expect(s.id).to.be.eq("id");
    expect(s.attachmentFilename).to.be.undefined;
    expect(s.message).to.be.eq("");
  });
  it("should return an object with constructor(undefined, 'msg')", () => {
    const s = new Secret(undefined, "msg");
    expect(s).not.to.be.undefined;
    expect(s.id).to.be.a.string;
    expect(s.attachmentFilename).to.be.undefined;
    expect(s.message).to.be.eq("msg");
  });
  it("should return an object with constructor(undefined, 'msg', afile)", () => {
    const s = new Secret(undefined, "msg", "afile");
    expect(s).not.to.be.undefined;
    expect(s.id).to.be.a.string;
    expect(s.attachmentFilename).to.be.a.string;
    expect(s.message).to.be.eq("msg");
  });
});
