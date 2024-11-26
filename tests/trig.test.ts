import { describe, expect, test } from 'vitest'
import { expression } from "../src"

describe("trig", () => {
  test("sin(x); x=π => 0", () => {
    const x = Symbol("x")
    const s = { [x]: Math.PI }
    expect(expression(x).sin().eval(s).toString()).to.equal("0")
  })

  test("sin(x); x=π => 0", () => {
    const x = Symbol("x")
    const s = { [x]: Math.PI }
    expect(expression(x).abs().eval(s).toString()).to.equal("0")
  })

  test("cos(x); x=π => -1", () => {
    const x = Symbol("x")
    const s = { [x]: Math.PI }
    expect(expression(x).cos().eval(s).toString()).to.equal("-1")
  })

  test("tan(x); x=y => abs(y)", () => {
    const x = Symbol("x")
    const y = Symbol("y")
    const s = { [x]: y }
    expect(expression(x).abs().apply(s).toString()).to.equal("|y|")
  })

  test("abs(abs(x)) => abs(x)", () => {
    expect(expression("x").abs().abs().toString()).to.equal("|x|")
  })

  test("abs(x) d/dx => x*abs(x)^-1", () => {
    const x = Symbol("x")
    expect(expression(x).abs().derivative(x).toString()).to.equal(
      "x*(|x|)^-1"
    )
  })
})
