import { Identifier, INode } from "../interface"
import { Const, value } from "./Const"
import { div, mult } from "./Mult"

export function abs(a: INode): INode {
  if (a instanceof Const) {
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
    return mult(this.a.derivative(withRespectTo), div(this.a, abs(this.a)))
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
