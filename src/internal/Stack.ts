import { Identifier, IExpression, IExpressionStack as IStack, INode } from "../interface"
import { abs } from "./Abs"
import { add, sub } from "./Add"
import { eq, Expression, toNode } from "./Expression"
import { div, mult } from "./Mult"
import { pow } from "./Pow"
import { cos, sin, tan } from "./Trig"

type Term = number | Identifier | Expression

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stackBinnary<N extends IStack<any> | IExpression>(
  op: (a: INode, b: INode) => INode,
  parent: N,
  n: INode,
  t?: Term
) {
  if (t !== undefined) {
    return new Stack<N>(parent, op(n, toNode(t)))
  }
  if (parent instanceof Stack) {
    return new Stack<N>(parent.parent, op(parent.n, n))
  } else {
    const prev = (parent as Expression).n
    const result = op(prev, n)
    if (result === prev) // it was a no op
      return parent
    return new Expression(result) as unknown as N
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stackUnary<N extends IStack<any> | IExpression>(
  op: (a: INode) => INode,
  self: Stack<N>,
  n: INode,
  t?: Term,
) {
  if (t === undefined) {
    return new Stack<N>(self.parent, op(n))
  } else {
    return new Stack<Stack<N>>(self, op(toNode(t)))
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Stack<N extends IStack<any> | IExpression> implements IStack<N> {
  constructor(readonly parent: N, readonly n: INode) { }

  public plus(): N
  public plus(c: Term): IStack<N>
  public plus(c?: Term): N | IStack<N> {
    return stackBinnary(add, this.parent, this.n, c)
  }

  public minus(): N
  public minus(c: Term): Stack<N>
  public minus(c?: Term): N | Stack<N> {
    return stackBinnary(sub, this.parent, this.n, c)
  }

  public times(): N
  public times(c: Term): Stack<N>
  public times(c?: Term): N | Stack<N> {
    return stackBinnary(mult, this.parent, this.n, c)
  }

  public divide(): N {
    return stackBinnary(div, this.parent, this.n, undefined) as N
  }

  public dividedBy(c: Term): Stack<N> {
    return stackBinnary(div, this.parent, this.n, c) as Stack<N>
  }

  public eq(): N
  public eq(c: Term): Stack<N>
  public eq(c?: Term): N | Stack<N> {
    return stackBinnary(eq, this.parent, this.n, c)
  }

  public squared(): Stack<N> {
    return this.toThe(2)
  }

  public toThe(c: Term): Stack<N> {
    return stackBinnary(pow, this.parent, this.n, c) as Stack<N>
  }

  public abs(): Stack<N>
  public abs(b: Term): Stack<Stack<N>>
  public abs(b?: Term): Stack<N> | Stack<Stack<N>> {
    return stackUnary(abs, this, this.n, b)
  }

  public sin(): Stack<N>
  public sin(b: Term): Stack<Stack<N>>
  public sin(b?: Term): Stack<N> | Stack<Stack<N>> {
    return stackUnary(sin, this, this.n, b)
  }

  public cos(): Stack<N>
  public cos(b: Term): Stack<Stack<N>>
  public cos(b?: Term): Stack<N> | Stack<Stack<N>> {
    return stackUnary(cos, this, this.n, b)
  }

  public tan(): Stack<N>
  public tan(b: Term): Stack<Stack<N>>
  public tan(b?: Term): Stack<N> | Stack<Stack<N>> {
    return stackUnary(tan, this, this.n, b)
  }

  public push(b: Term): Stack<Stack<N>> {
    return new Stack<Stack<N>>(this, toNode(b))
  }

  public toString() {
    const pStr = this.parent.toString()
    const bStr = this.n.print()
    return pStr + " | " + bStr
  }
}
