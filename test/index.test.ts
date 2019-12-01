import 'mocha';
import { expect } from 'chai';
import expression from '../src/';

test("1+2 => 3", () => {
  const q = expression(1).plus(2);
  expect(q.toString()).to.equal("3");
});

test("(1+x)+2 => x+3", () => {
  const q = expression(1).plus(Symbol("x")).plus(2);
  expect(q.toString()).to.equal(`+
├ 3
└ x`);
});

test("1+(x+(0+2)) => x+3", () => {
  const x = Symbol("x");
  const q = expression(1).push(x).push(0).plus(2).plus().plus();
  expect(q.toString()).to.equal(`+
├ 3
└ x`);
});

test("(x+y)+(1+z) => (1+(x+(y+z)", () => {
  const [x, y, z] = [Symbol("x"), Symbol("y"), Symbol("z")];
  const q = expression(x).plus(y).push(1).plus(z).plus();
  expect(q.toString()).to.equal(`+
├ 1
└ +
  ├ z
  └ +
    ├ y
    └ x`);
  const dq = q.derivative(x);
  expect(dq.toString()).to.equal("1");
});

test("x+0 => x", () => {
  const [x] = [Symbol("x")];
  const q = expression(x).plus(0);
  expect(q.toString()).to.equal("x");
});

test("x+x => 2*x", () => {
  const x = Symbol("x");
  const q = expression(x).plus(x);
  expect(q.toString()).to.equal(`*
├ 2
└ x`);
});

test("2*3 => 6", () => {
  const q = expression(2).times(3);
  expect(q.toString()).to.equal("6");
});

test("(2+x)*3 => 6+3*x", () => {
  const x = Symbol("x");
  const q = expression(2).plus(x).times(3);
  expect(q.toString()).to.equal(`+
├ 6
└ *
  ├ 3
  └ x`);
});

test("(2*x)*2 => 4*x", () => {
  const x = Symbol("x");
  const q = expression(2).times(x).times(2);
  expect(q.toString()).to.equal(`*
├ 4
└ x`);
});

test("2*(x*2) => 4*x", () => {
  const x = Symbol("x");
  const q = expression(2).push(x).times(2).times();
  expect(q.toString()).to.equal(`*
├ 4
└ x`);
});

test("(2*x)*(3*x) => 4*x", () => {
  const x = Symbol("x");
  const q = expression(2).times(x).push(3).times(x).times();
  expect(q.toString()).to.equal(`*
├ 6
└ ^
  ├ x
  └ 2`);
});

test("x*0 => 0", () => {
  const x = Symbol("x");
  const q = expression(x).times(0);
  expect(q.toString()).to.equal("0");
});

test("x*1 => x", () => {
  const x = Symbol("x");
  const q = expression(x).times(1);
  expect(q.toString()).to.equal("x");
  const dq = q.derivative(x);
  expect(dq.toString()).to.equal("1");
});

test("x*x => x^2", () => {
  const x = Symbol("x");
  const q = expression(x).times(x);
  expect(q.toString()).to.equal(`^
├ x
└ 2`);
  const dq = q.derivative(x);
  expect(dq.toString()).to.equal(`*
├ 2
└ x`);
});

test("2+(3*x) => x", () => {
  const x = Symbol("x");
  const q = expression(2).push(3).times(x).plus();
  expect(q.toString()).to.equal(`+
├ 2
└ *
  ├ 3
  └ x`);
});

test("derivative", () => {
  const x = Symbol("x");
  const y = Symbol("y");

  const q = expression(x).minus(3).squared();
  expect(q.toString()).to.equal(`+
├ 9
└ +
  ├ *
  │ ├ -6
  │ └ x
  └ ^
    ├ x
    └ 2`);
  const dx = q.derivative(x);
  expect(dx.toString()).to.equal(`+
├ -6
└ *
  ├ 2
  └ x`);
});
