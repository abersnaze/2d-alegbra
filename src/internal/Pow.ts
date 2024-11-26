import { Applications, Identifier, INode } from "../interface"
import { sub } from "./Add"
import { Const, value } from "./Const"
import { mult } from "./Mult"
import { Var } from "./Var"

export function pow(a: INode, b: INode): INode {
  if (b === value(0)) {
    return value(1)
  }
  if (b === value(1)) {
    return a
  }
  if (a instanceof Pow) {
    return pow(a.a, mult(a.b, b))
  }
  if (b instanceof Const && a instanceof Const) {
    return value(Math.pow(a.value, b.value))
  }
  return new Pow(a, b)
}

class Pow implements INode {
  constructor(readonly a: INode, readonly b: INode) { }

  apply(subs: Applications): INode {
    const a = this.a.apply(subs)
    const b = this.b.apply(subs)
    if (a === this.a && b === this.b)
      return this
    return pow(a, b)
  }

  derivative(withRespectTo: Identifier): INode {
    const da = this.a.derivative(withRespectTo)
    const x = pow(this.a, sub(this.b, value(1)))
    const out = mult(mult(this.b, x), da)
    return out
  }

  toString(): string {
    let b = this.b.toString()
    if (!(this.b instanceof Const)) {
      b = "(" + b + ")"
    }
    let a = this.a.toString()
    if (!(this.a instanceof Const || this.a instanceof Var)) {
      a = "(" + a + ")"
    }
    return a + "^" + b
  }
}
