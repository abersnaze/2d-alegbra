import { describe, expect, test } from 'vitest'
import { cos, expression, sin, tan } from '../src'

describe("power", () => {
  test("x^0 => 1", () => {
    const x = Symbol("x")
    expect(expression(x).toThe(0).eval(new Map())).toBe(1)
  })
  test("x^1 => 1", () => {
    const x = Symbol("x")
    expect(expression(x).toThe(1).toString()).toBe("x")
  })

  test("(x^n)^m) => x^(n * m)", () => {
    const x = Symbol("x")
    expect(expression(x).toThe(3).toThe(4).toString()).toBe("x^12")
  })

  test("x^(n^m) => x^(n * m)", () => {
    const x = Symbol("x")
    expect(expression(x).toThe(3).toThe(4).toString()).toBe("x^12")
  })

  test("sin(x); x=y => sin(y)", () => {
    const x = Symbol("x")
    const y = Symbol("y")
    const s = new Map([[x, y]])
    expect(sin(x).apply(s).toString()).to.equal("sin(y)")
  })

  test("cos(ℝ) => ℝ", () => {
    const n = Math.random()
    expect(cos(n).toString()).toBe(Math.cos(n).toString())
  })

  test("cos(x^2) d/dx => x*cos(x^2)", () => {
    const x = Symbol("x")
    expect(expression(x).squared().cos().derivative(x).toString()).toBe("-sin(x^2)*x*2")
  })

  test("cos(x); x=y => cos(y)", () => {
    const x = Symbol("x")
    const y = Symbol("y")
    const s = new Map([[x, y]])
    expect(cos(x).apply(s).toString()).to.equal("cos(y)")
  })

  test("tan(π/4) => 1", () => {
    expect(tan(Math.PI / 4).eval(new Map())).closeTo(1, 10)
  })

  test("tan(x) => sin(x)/cos(x)", () => {
    const x = Symbol("x")
    expect(tan(x).toString()).toBe("sin(x)*(cos(x))^-1")
  })
})
