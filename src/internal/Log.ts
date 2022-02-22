import { Identifier, INode } from "../interface"
import { Const, value } from "./Const"
import { div } from "./Mult"

export function log(a: INode): INode {
  if (a instanceof Const) {
    return value(Math.log(a.value))
  }
  return new Log(a)
}

class Log implements INode {
  constructor(readonly a: INode) { }

  apply(subs: Map<Identifier, INode>): INode {
    const a = this.a.apply(subs)
    if (a === this.a)
      return this
    return log(a)
  }

  derivative(withRespectTo: Identifier): INode {
    const da = this.a.derivative(withRespectTo)
    return div(da, this.a)
  }

  print(): string {
    return "ln(" + this.a.print() + ")"
  }
}
