import { Identifier, INode } from "../interface"

export class Const implements INode {
  constructor(readonly value: number) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_subs: Map<Identifier, INode>): INode {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  derivative(_withRespectTo: Identifier): INode {
    return ZERO
  }

  print(): string {
    if (this.value === Number.POSITIVE_INFINITY) {
      return '∞'
    }
    if (this.value === Number.MIN_VALUE) {
      return '0';
    }
    if (this.value === -Number.MIN_VALUE) {
      return '0';
    }
    if (this.value === Number.NEGATIVE_INFINITY) {
      return '-∞'
    }
    return this.value.toString()
  }
}

export const INF = new Const(Number.POSITIVE_INFINITY)
export const TWO = new Const(2)
export const ONE = new Const(1)
export const MIN = new Const(NaN) // equivalent to 1/∞ or 0 in most cases
export const ZERO = new Const(0)
export const NEG_MIN = new Const(NaN) // equivalent to -1/∞ or 0 in most cases
export const NEG_ONE = new Const(-1)
export const NEG_INF = new Const(Number.NEGATIVE_INFINITY)

export function value(a: number): Const {
  if (a === 0)
    return ZERO
  if (a === 1)
    return ONE
  if (a === -1)
    return NEG_ONE
  if (a === 2)
    return TWO
  if (a === Number.POSITIVE_INFINITY)
    return INF
  if (a === Number.NEGATIVE_INFINITY)
    return NEG_INF
  return new Const(a)
}
