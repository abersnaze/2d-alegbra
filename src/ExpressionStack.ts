import { Expression } from "./Expression";
import { InlineFormat } from "./format/InlineFormat";
import { TreeFormat } from "./format/TreeFormat";
import {
  abs,
  add,
  cos,
  div,
  eq,
  Identifier,
  INode,
  mult,
  pow,
  sin,
  sub,
  tan,
  toNode,
} from "./node/index";

type Term = number | Identifier | Expression;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stack<N extends ExpressionStack<any> | Expression>(
  op: (a: INode, b: INode | number) => INode,
  parent: N,
  b: INode,
  c?: Term
) {
  if (c !== undefined) {
    return new ExpressionStack<N>(parent, op(b, toNode(c)));
  }
  if (parent instanceof ExpressionStack) {
    return new ExpressionStack<N>(parent.parent, op(parent.b, b)) as N;
  } else {
    return new Expression(op((parent as Expression).a, b)) as N;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ExpressionStack<N extends ExpressionStack<any> | Expression> {
  constructor(readonly parent: N, readonly b: INode) {}

  public plus(): N;
  public plus(c: Term): ExpressionStack<N>;
  public plus(c?: Term): N | ExpressionStack<N> {
    return stack(add, this.parent, this.b, c);
  }

  public minus(): N;
  public minus(c: Term): ExpressionStack<N>;
  public minus(c?: Term): N | ExpressionStack<N> {
    return stack(sub, this.parent, this.b, c);
  }

  public times(): N;
  public times(c: Term): ExpressionStack<N>;
  public times(c?: Term): N | ExpressionStack<N> {
    return stack(mult, this.parent, this.b, c);
  }

  public divide(): N {
    return stack(div, this.parent, this.b, undefined) as N;
  }

  public dividedBy(c: Term): ExpressionStack<N> {
    return stack(div, this.parent, this.b, c) as ExpressionStack<N>;
  }

  public eq(): N;
  public eq(c: Term): ExpressionStack<N>;
  public eq(c?: Term): N | ExpressionStack<N> {
    return stack(eq, this.parent, this.b, c);
  }

  public squared(): ExpressionStack<N> {
    return this.toThe(2);
  }

  public toThe(c: number): ExpressionStack<N> {
    return stack(pow, this.parent, this.b, c) as ExpressionStack<N>;
  }

  public abs(): ExpressionStack<N>;
  public abs(b: Term): ExpressionStack<ExpressionStack<N>>;
  public abs(
    b?: Term
  ): ExpressionStack<N> | ExpressionStack<ExpressionStack<N>> {
    if (b !== undefined) {
      return this.push(b).abs();
    }
    return new ExpressionStack<N>(this.parent, abs(this.b));
  }

  public sin(): ExpressionStack<N>;
  public sin(b: Term): ExpressionStack<ExpressionStack<N>>;
  public sin(
    b?: Term
  ): ExpressionStack<N> | ExpressionStack<ExpressionStack<N>> {
    if (b !== undefined) {
      return this.push(b).sin();
    }
    return new ExpressionStack<N>(this.parent, sin(this.b));
  }

  public cos(): ExpressionStack<N>;
  public cos(b: Term): ExpressionStack<ExpressionStack<N>>;
  public cos(
    b?: Term
  ): ExpressionStack<N> | ExpressionStack<ExpressionStack<N>> {
    if (b !== undefined) {
      return this.push(b).cos();
    }
    return new ExpressionStack<N>(this.parent, cos(this.b));
  }

  public tan(): ExpressionStack<N>;
  public tan(b: Term): ExpressionStack<ExpressionStack<N>>;
  public tan(
    b?: Term
  ): ExpressionStack<N> | ExpressionStack<ExpressionStack<N>> {
    if (b !== undefined) {
      return this.push(b).tan();
    }
    return new ExpressionStack<N>(this.parent, tan(this.b));
  }

  public push(b: Term): ExpressionStack<ExpressionStack<N>> {
    return new ExpressionStack<ExpressionStack<N>>(this, toNode(b));
  }

  public toString(indent = "", inline = true) {
    const pStr = this.parent.toString(indent, inline);
    const fmt = inline ? new InlineFormat() : new TreeFormat();
    const bStr = this.b.toString(indent, fmt);
    return pStr + " | " + bStr;
  }
}
