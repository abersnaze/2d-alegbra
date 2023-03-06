import { describe, expect, test } from 'vitest'
import { expression } from "../src"

describe("abs", () => {
  test("abs(x); x=-1 => 1", () => {
    const x = Symbol("x")
    const s = new Map([[x, -1]])
    expect(expression(x).abs().eval(s).toString()).to.equal("1")
  })

  test("abs(x); x=1 => 1", () => {
    const x = Symbol("x")
    const s = new Map([[x, 1]])
    expect(expression(x).abs().eval(s).toString()).to.equal("1")
  })

  test("abs(x); x=y => abs(y)", () => {
    const x = Symbol("x")
    const y = Symbol("y")
    const s = new Map([[x, y]])
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
