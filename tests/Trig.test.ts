import { describe, expect, test } from 'vitest'
import { cos, expression, sin, tan } from '../src'

describe("trig", () => {
  test("sin(ℝ) => ℝ", () => {
    const n = Math.random()
    expect(sin(n).toString()).toBe(Math.sin(n).toString())
  })

  test("sin(x^2) d/dx => x*sin(x^2)", () => {
    const x = Symbol("x")
    expect(expression(x).squared().sin().derivative(x).toString()).toBe("cos(x^2)*x*2")
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
