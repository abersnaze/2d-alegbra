import { expect } from "chai";
import "mocha";
import { expression } from "../src";

describe("abs", () => {
  it("abs(x); x=-1 => 1", () => {
    const x = Symbol("x");
    const s = new Map([[x, -1]]);
    expect(expression(x).abs().eval(s).toString()).to.equal("1");
  });

  it("abs(x); x=1 => 1", () => {
    const x = Symbol("x");
    const s = new Map([[x, 1]]);
    expect(expression(x).abs().eval(s).toString()).to.equal("1");
  });

  it("abs(x); x=y => abs(y)", () => {
    const x = Symbol("x");
    const y = Symbol("y");
    const s = new Map([[x, y]]);
    expect(expression(x).abs().apply(s).toString()).to.equal("abs(y)");
  });

  it("abs(abs(x)) => abs(x)", () => {
    expect(expression("x").abs().abs().toString()).to.equal("abs(x)");
  });

  it("abs(x) + abs(y)) => abs(y + x)", () => {
    const x = Symbol("x");
    const y = Symbol("y");
    expect(expression(x).abs().abs(y).plus().toString()).to.equal("abs(y + x)");
  });

  it("abs(x)*abs(y)) => abs(y*x)", () => {
    const x = Symbol("x");
    const y = Symbol("y");
    expect(expression(x).abs().push(y).abs().times().toString()).to.equal(
      "abs(y*x)"
    );
  });

  it("abs(-3*x) => 3*abs(x)", () => {
    const x = Symbol("x");
    expect(expression(x).times(-3).abs().toString()).to.equal("3*abs(x)");
  });

  it("abs(x^2) => x^2", () => {
    const x = Symbol("x");
    expect(expression(x).squared().abs().toString()).to.equal("x^2");
  });

  it("abs(x) d/dx => x*abs(x)^-1", () => {
    const x = Symbol("x");
    expect(expression(x).abs().derivative(x).toString()).to.equal(
      "x*abs(x)^-1"
    );
  });

  it("abs(x) == abs(x) => x*abs(x)^-1", () => {
    const x = Symbol("x");
    expect(expression(x).abs().a.equals(expression(x).abs().a)).to.equal(true);
  });
});
