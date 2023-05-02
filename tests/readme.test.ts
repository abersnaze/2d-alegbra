import { expect, test } from 'vitest'
import { cos, expression, matrix, minus, sin } from "../src"

/*
 * make sure README.md documentations is functional.
 */

test('line derivatives', () => {
  const m = 3 // slope
  const b = 4 // point
  const x = Symbol("x")
  const y = Symbol() // naming your symbols is optional
  const line = expression(m).times(x).plus(b).eq(y)

  expect(line.toString()).toBe("(x*3 + -x1 + 4)^2")

  const solution = new Map([
    [x, 7483],
    [y, 22453],
  ])

  const err = line.eval(solution)
  expect(err).to.equal(0)

  const dxLine = line.derivative(x)
  const xSlope = dxLine.eval(solution)
  expect(xSlope).to.equal(0)
  expect(dxLine.toString()).toBe("(x*3 + -x1 + 4)*2")

  const dyLine = line.derivative(y)
  const ySlope = dyLine.eval(solution)
  expect(ySlope).to.equal(0)
  expect(dyLine.toString()).toBe("(x*3 + -x1 + 4)*2")

  const dx2Line = dxLine.derivative(x)
  const xCup = dx2Line.eval(solution)
  expect(xCup).to.be.greaterThanOrEqual(0)

  const dy2Line = dyLine.derivative(y)
  const yCup = dx2Line.eval(solution)
  expect(yCup).to.be.greaterThanOrEqual(0)

  // https://en.wikipedia.org/wiki/Second_partial_derivative_test
  const dxdyLine = dxLine.derivative(y)
  const hessianDet = dx2Line.times(dy2Line).minus(dxdyLine.squared())
  const xySaddle = hessianDet.eval(solution)
  expect(xySaddle).to.equal(0)
})

test('circle expression', () => {
  const x = Symbol("x")
  const y = Symbol("y")
  const r = Symbol("r")

  const step1 = expression(x)
  expect(step1.toString()).toBe("x")
  const step2 = step1.squared()
  expect(step2.toString()).toBe("x^2")
  const step3 = step2.push(y)
  expect(step3.toString()).toBe("x^2 | y")
  const step4 = step3.squared()
  expect(step4.toString()).toBe("x^2 | y^2")
  const step5 = step4.plus()
  expect(step5.toString()).toBe("x^2 + y^2")
  const step6 = step5.push(r)
  expect(step6.toString()).toBe("x^2 + y^2 | r")
  const step7 = step6.squared()
  expect(step7.toString()).toBe("x^2 + y^2 | r^2")
  const step8 = step7.eq()
  expect(step8.toString()).toBe("(x^2 + y^2 + -r^2)^2")
})

test('matrix simple', () => {
  const M = matrix(1, 2, 3)(4, 5, 6)
  const N = matrix(7, 8)(9, 10)(11, 12)

  const O = M.times(N)
  expect(O.toString()).toBe("[58, 64; 139, 154]")
})

test('matrix expression', () => {
  const x = Symbol("x")
  const y = Symbol("y")
  const theta = Symbol("Θ")

  // 2D translate
  const translate = matrix
    (1, 0, x)
    (0, 1, y)
    (0, 0, 1)

  // 2D rotation
  const rotate = matrix
    (cos(theta), sin(theta).times(-1), 0)
    (sin(theta), cos(theta), 0)
    (0, 0, 1)

  // 2D rotation around arbitrary point
  // 1) move to origin
  // 2) rotate around origin
  // 3) move back
  const actual = translate.times(rotate).dividedBy(translate)

  const expected = matrix
    (cos(theta), sin(theta).times(-1), cos(theta).times(x).times(-1).plus(sin(theta).times(y)).plus(x))
    (sin(theta), cos(theta), sin(theta).times(x).times(-1).minus(cos(theta).times(y)).plus(y))
    (0, 0, 1)

  expect(actual.exps).toEqual(expected.exps)
})
