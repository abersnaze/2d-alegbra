import { describe, expect, test } from 'vitest'
import { value } from '../src/internal/Const'
import { determinant, inverse, matrix, minor } from '../src/internal/Matrix'

describe("matrix", () => {
  test("minor 0,0 [0] => []", () => {
    expect(minor(0, 0, matrix(0)).exps).toEqual(matrix().exps)
  })

  test("minor 0,0 [0,1,2,3] => [3]", () => {
    expect(minor(0, 0, matrix(0, 1)(2, 3)).exps).toEqual(matrix(3).exps)
  })

  test("determinant 2x2", () => {
    const M = matrix
      (3, 7)
      (1, -4)
    expect(determinant(M)).toEqual(value(-19))
  })
  test("determinant 3x3", () => {
    const M = matrix
      (6, 1, 1)
      (4, -2, 5)
      (2, 8, 7)
    expect(determinant(M)).toEqual(value(-306))
  })

  test("inverse", () => {
    const M = matrix
      (3, 0, 2)
      (2, 0, -2)
      (0, 1, 1)
    // because .1+.2 doesn't equal .3
    const point3 = .1 + .2
    const N = matrix
      (.2, .2, 0)
      (-.2, point3, 1)
      (.2, -point3, 0)
    expect(inverse(M).exps).toEqual(N.exps)
  })
})

