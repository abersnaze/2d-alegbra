import { describe, expect, test } from 'vitest'
import { expression } from '../src'
import { Const, ONE, TWO, value, ZERO } from "../src/internal/Const"

describe("const", () => {
  test("0", () => {
    expect(value(0)).toBe(ZERO)
  })

  test("1", () => {
    expect(value(1)).toBe(ONE)
  })

  test("2", () => {
    expect(value(2)).toBe(TWO)
  })

  test("random", () => {
    const n = Math.random()
    expect(value(n)).not.toBe(value(n))
    expect((value(n) as Const).value).toBe(n)
  })

  test("ℝ d/dx => 0", () => {
    const x = Symbol("x")
    expect(expression(4).derivative(x).toString()).to.equal("0")
  })
})
