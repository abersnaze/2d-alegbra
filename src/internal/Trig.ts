import { Identifier, INode } from "../interface"
import { Const, value } from "./Const"
import { div, mult } from "./Mult"

export function sin(a: INode) {
  if (a instanceof Const) {
    return value(Math.sin(a.value))
  }
  return new Sine(a)
}

export function cos(a: INode) {
  if (a instanceof Const) {
    return value(Math.cos(a.value))
  }
  return new Cosine(a)
}

export function tan(a: INode) {
  if (a instanceof Const) {
    return value(Math.tan(a.value))
  }
  return div(sin(a), cos(a))
}

export class Sine implements INode {
  constructor(readonly a: INode) { }

  apply(subs: Map<Identifier, INode>): INode {
    const _a = this.a.apply(subs)
    if (_a === this.a)
      return this
    return sin(_a)
  }

  public derivative(withRespectTo: Identifier): INode {
    return mult(cos(this.a), this.a.derivative(withRespectTo))
  }

  public print(): string {
    return "sin(" + this.a.print() + ")"
  }
}

export class Cosine implements INode {
  constructor(readonly a: INode) { }

  apply(subs: Map<Identifier, INode>): INode {
    const _a = this.a.apply(subs)
    if (_a === this.a)
      return this
    return cos(_a)
  }

  public derivative(withRespectTo: Identifier): INode {
    return mult(value(-1), mult(sin(this.a), this.a.derivative(withRespectTo)))
  }

  public print(): string {
    return "cos(" + this.a.print() + ")"
  }
}
