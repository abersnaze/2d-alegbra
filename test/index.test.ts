import { expect } from "chai";
import "mocha";
import { expression } from "../src/";

describe("expression", () => {
  it("README", () => {
    const m = 3; // slope
    const b = 4; // point
    const x = Symbol("x");
    const y = Symbol(); // naming your symbols is optional
    const line = expression(m).times(x).plus(b).eq(y);

    const solution = new Map([
      [x, 7483],
      [y, 22453],
    ]);

    const err = line.eval(solution);
    expect(err, "line error").to.equal(0);

    const dxLine = line.derivative(x);
    const xSlope = dxLine.eval(solution);
    expect(xSlope, "x slope").to.equal(0);

    const dyLine = line.derivative(y);
    const ySlope = dyLine.eval(solution);
    expect(ySlope, "y slope").to.equal(0);

    const dx2Line = dxLine.derivative(x);
    const xCup = dx2Line.eval(solution);
    expect(xCup, "x cup").to.be.greaterThan(0);

    const dy2Line = dyLine.derivative(y);
    const yCup = dx2Line.eval(solution);
    expect(yCup, "y cup").to.be.greaterThan(0);

    // https://en.wikipedia.org/wiki/Second_partial_derivative_test
    const dxdyLine = dxLine.derivative(y);
    const hessianDet = dx2Line.times(dy2Line).minus(dxdyLine.squared());
    const xySaddle = hessianDet.eval(solution);
    expect(xySaddle, "x,y saddle").to.equal(0);
  });

  it("1+2 => 3", () => {
    const q = expression(1).plus(2);
    expect(q.toString()).to.equal("3");
  });

  it("(1+x)+2 => x+3", () => {
    const q = expression(1).plus(Symbol("x")).plus(2);
    expect(q.toString()).to.equal("3 + x");
  });

  it("1+(x+(0+2)) => x+3", () => {
    const x = Symbol("x");
    const q = expression(1).push(x).push(0).plus(2).plus().plus();
    expect(q.toString()).to.equal(`3 + x`);
  });

  it("(x+y)+(1+z) => (1+(x+(y+z)", () => {
    const [x, y, z] = [Symbol("x"), Symbol("y"), Symbol("z")];
    const q = expression(x).plus(y).push(1).plus(z).plus();
    expect(q.toString()).to.equal(`1 + z + y + x`);
    const dq = q.derivative(x);
    expect(dq.toString()).to.equal("1");
  });

  it("x+0 => x", () => {
    const [x] = [Symbol("x")];
    const q = expression(x).plus(0);
    expect(q.toString()).to.equal("x");
  });

  it("x+x => 2*x", () => {
    const x = Symbol("x");
    const q = expression(x).plus(x);
    expect(q.toString()).to.equal(`2*x`);
  });

  it("2*3 => 6", () => {
    const q = expression(2).times(3);
    expect(q.toString()).to.equal("6");
  });

  it("(2+x)*3 => 6+3*x", () => {
    const x = Symbol("x");
    const q = expression(2).plus(x).times(3);
    expect(q.toString()).to.equal(`6 + 3*x`);
  });

  it("(2*x)*2 => 4*x", () => {
    const x = Symbol("x");
    const q = expression(2).times(x).times(2);
    expect(q.toString()).to.equal(`4*x`);
  });

  it("2*(x*2) => 4*x", () => {
    const x = Symbol("x");
    const q = expression(2).push(x).times(2).times();
    expect(q.toString()).to.equal(`4*x`);
  });

  it("(2*x)*(3*x) => 6*x", () => {
    const x = Symbol("x");
    const q = expression(2).times(x).push(3).times(x).times();
    expect(q.toString()).to.equal(`6*x^2`);
  });

  it("x*0 => 0", () => {
    const x = Symbol("x");
    const q = expression(x).times(0);
    expect(q.toString()).to.equal("0");
  });

  it("x*1 => x", () => {
    const x = Symbol("x");
    const q = expression(x).times(1);
    expect(q.toString()).to.equal("x");
    const dq = q.derivative(x);
    expect(dq.toString()).to.equal("1");
  });

  it("x*x => x^2", () => {
    const x = Symbol("x");
    const q = expression(x).times(x);
    expect(q.toString()).to.equal(`x^2`);
    const dq = q.derivative(x);
    expect(dq.toString()).to.equal(`2*x`);
  });

  it("2+(3*x) => 2 + 3*x", () => {
    const x = Symbol("x");
    const q = expression(2).push(3).times(x).plus();
    expect(q.toString()).to.equal(`2 + 3*x`);
  });

  it("2/(3*x) => 2/3*x^-1", () => {
    const x = Symbol("x");
    const q = expression(2).push(3).times(x).divide();
    expect(q.toString()).to.equal("0.6666666666666666*x^-1");
  });

  it("derivative product rule", () => {
    const x = Symbol("x");

    const r = expression(x).squared().push(x).plus(3);
    const q = r.times();
    expect(q.toString()).to.equal("3*x^2 + x^3");
    const dx = q.derivative(x);
    expect(dx.toString()).to.equal("6*x + 3*x^2");
  });

  it("derivative quoten rule", () => {
    const x = Symbol("x");

    const q = expression(x).squared().push(x).plus(3).divide();
    expect(q.toString()).to.equal("(3 + x)^-1*x^2");
    const dx = q.derivative(x);
    expect(dx.toString()).to.equal(
      "(9 + 6*x + x^2)^-1*-1*x^2 + (3 + x)^-1*2*x"
    );
  });

  it("apply", () => {
    const x = Symbol("x");
    const y = Symbol("y");

    const q = expression(-3).times(x).minus(y).eq(-2);
    const subs = new Map([[y, expression(2).times(x).minus(5)]]);

    const r = q.apply(subs);
    expect(r.toString("", false)).to.equal(`+
├ 49
└ +
  ├ *
  │ ├ -70
  │ └ x
  └ *
    ├ 25
    └ ^
      ├ x
      └ 2`);
    expect(r.toString()).to.equal(`49 + -70*x + 25*x^2`);

    const err = r.eval(new Map([[x, 1.4]]));
    expect(err).to.be.closeTo(0, Number.EPSILON * 32);
  });

  it("trig", () => {
    const theta = Symbol("Θ");
    const q = expression(theta).sin().squared();
    expect(q.toString()).to.equal("sin(Θ)^2");
    const dq = q.derivative(theta);
    expect(dq.toString()).to.equal("2*sin(Θ)*cos(Θ)");

    const r = expression(theta).cos().squared();
    expect(r.toString()).to.equal("cos(Θ)^2");
    const rq = r.derivative(theta);
    expect(rq.toString()).to.equal("-2*sin(Θ)*cos(Θ)");

    const ds = dq.plus(rq);
    expect(ds.toString()).to.equal("0");
  });

  it("tangent", () => {
    const theta = Symbol("Θ");
    const q = expression(theta).tan();
    expect(q.toString()).to.equal("sin(Θ)*cos(Θ)^-1");
    const dq = q.derivative(theta);
    // it would be nice if simplified (cos^2 + sin^2) to 1.
    // would likely take implementing multiple stragies for
    // simplification and seeing which one was better
    // could result in exponentially more time.
    // or set up a system to identify these cases and code
    // the simplier form.
    expect(dq.toString()).to.equal("1 + sin(Θ)^2*cos(Θ)^-2");
  });

  it("constants", () => {
    expect(expression(0).sin().toString()).to.equal("0");
    expect(expression(Math.PI).cos().toString()).to.equal("-1");
    expect(expression(0).tan().toString()).to.equal("0");
    expect(expression(5).dividedBy(-1).toString()).to.equal("-5");
    expect(expression(5).dividedBy(1).toString()).to.equal("5");
    expect(expression(0).dividedBy(1).toString()).to.equal("0");
    expect(expression("x").toThe(5).toThe(4).toString()).to.equal("x^20");
  });
});
