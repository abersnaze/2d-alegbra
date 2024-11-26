import { describe, expect, test } from 'vitest'
import { expression } from "../src"
import { toInterval } from '../src/internal/Const'

describe("const", () => {
  test("toInterval(1) => [1-e, 1+e]", () => {
    const [min, max] = toInterval(1.0)
    expect(min).to.equal(0.9999999999999998)
    expect(max).to.equal(1.0000000000000002)
  })
})
