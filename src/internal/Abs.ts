import { Identifier, INode } from "../interface"
import { Const, MIN, NEG_MIN, NEG_ONE, value } from "./Const"
import { mult } from "./Mult"
import { pow } from "./Pow"

export function abs(a: INode): INode {
  if (a instanceof Const) {
    if (a === NEG_MIN || a === MIN)
      return MIN
    return value(Math.abs(a.value))
  }
  if (a instanceof Abs) {
    return a
  }
  return new Abs(a)
}

class Abs implements INode {
  constructor(readonly a: INode) { }

  derivative(withRespectTo: Identifier): INode {
    return mult(this.a.derivative(withRespectTo), this.a, pow(abs(this.a), NEG_ONE))
  }

  apply(subs: Map<Identifier, INode>): INode {
    const _a = this.a.apply(subs)
    if (_a === this.a)
      return this
    return abs(_a)
  }

  print(): string {
    return "|" + this.a.print() + "|"
  }
}
