import { Applications, Identifier, INode, Interval } from "../interface"
import { toInterval } from "./Internval"
import { PI as PI_VAR, E as E_VAR, variable } from "./Var"

export class Const implements INode {
  constructor(readonly value: Interval) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_subs: Applications): INode {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  derivative(_withRespectTo: Identifier): INode {
    return ZERO
  }

  toString(): string {
    return this.value.toString()
  }
}

const NEG_ONE = new Const(toInterval(-1))
const ZERO = new Const(toInterval(0))
const ONE = new Const(toInterval(1))
const TWO = new Const(toInterval(2))

export function value(a: Interval | number): INode {
  if (a === 0)
    return ZERO
  if (a === 1)
    return ONE
  if (a === -1)
    return NEG_ONE
  if (a === 2)
    return TWO
  if (a === Math.PI)
    return variable(PI_VAR)
  if (a === Math.E)
    return variable(E_VAR)
  return new Const(Array.isArray(a) ? a : toInterval(a))
}
