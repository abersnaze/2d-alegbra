import { Assignments, Identifier, IExpression, INode, IStack, Substitutions, Term } from "../interface"
import { abs as _abs } from "./Abs"
import { add, sub } from "./Add"
import { Const, value } from "./Const"
import { log } from "./Log"
import { div, mult } from "./Mult"
import { pow } from "./Pow"
import { Stack } from "./Stack"
import { cos as _cos, sin as _sin, tan as _tan } from "./Trig"
import { variable } from "./Var"

export function expression(t: Term): IExpression {
  return new Expression(toNode(t))
}
export function minus(t: Term) {
  return expression(t).times(-1)
}
export function abs(t: Term) {
  return expression(t).abs()
}
export function sin(t: Term) {
  return expression(t).sin()
}
export function cos(t: Term) {
  return expression(t).cos()
}
export function tan(t: Term) {
  return expression(t).tan()
}

export class Expression implements IExpression {
  constructor(readonly n: INode) { }

  times = apply(mult, this)

  dividedBy = apply(div, this)

  plus = apply(add, this)

  minus = apply(sub, this)

  toThe = apply(pow, this)

  log(): IExpression {
    return new Expression(log(this.n));
  }

  squared(): IExpression {
    return new Expression(pow(this.n, value(2)))
  }

  public abs(): IExpression
  public abs(b: Term): IStack<IExpression>
  public abs(b?: Term): IExpression | IStack<IExpression> {
    if (b !== undefined) {
      return this.push(b).abs()
    }
    return new Expression(_abs(this.n))
  }

  public sin(): IExpression
  public sin(b: Term): IStack<IExpression>
  public sin(b?: Term): IExpression | IStack<IExpression> {
    if (b !== undefined) {
      return this.push(b).sin()
    }
    return new Expression(_sin(this.n))
  }

  public cos(): IExpression
  public cos(b: Term): IStack<IExpression>
  public cos(b?: Term): IExpression | IStack<IExpression> {
    if (b !== undefined) {
      return this.push(b).cos()
    }
    return new Expression(_cos(this.n))
  }

  public tan(): IExpression
  public tan(b: Term): IStack<IExpression>
  public tan(b?: Term): IExpression | IStack<IExpression> {
    if (b !== undefined) {
      return this.push(b).tan()
    }
    return new Expression(_tan(this.n))
  }

  public eq(b: Term): IExpression {
    return new Expression(eq(this.n, toNode(b)))
  }

  public push(b: Term): IStack<IExpression> {
    return new Stack<IExpression>(this, toNode(b))
  }

  derivative(withRespectTo: Identifier) {
    const result = this.n.derivative(withRespectTo)
    if (result === this.n)
      return this
    return new Expression(result)
  }

  eval(subs: Assignments): number {
    subs.delete(I)
    const result = this.apply(subs)
    if (result.n instanceof Const) {
      return result.n.value
    }
    throw new Error()
  }

  apply(subs: Substitutions) {
    const _subs = new Map(Array.from(subs, ([k, v]) => [k, toNode(v)]))
    const result = this.n.apply(_subs)
    if (result === this.n)
      return this
    return new Expression(result)
  }

  simplify(): Expression {
    return this
  }

  toString(): string {
    return this.simplify().n.print()
  }
}

export function toNode(x: Term): INode {
  const typeofX = typeof x
  if (typeofX === "symbol" || typeofX === "string") {
    return variable(x as Identifier)
  } else if (typeofX === "number") {
    return value(x as number)
  } else if (x instanceof Expression) {
    return x.n
  } else {
    throw new Error("term is not number, symbol, string, or Expression")
  }
}

function apply(op: (a: INode, b: INode) => INode, exp: Expression) {
  return (t: Term): IExpression => {
    const result = op(exp.n, toNode(t))
    if (result === exp.n)
      return exp
    return new Expression(result)
  }
}

export function eq(a: INode, b: INode): INode {
  return pow(sub(a, b), value(2))
}

export const I = Symbol("𝑖")
