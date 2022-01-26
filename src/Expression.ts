import { ExpressionStack } from "./ExpressionStack";
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
  Term,
  toNode,
} from "./node/index";

export type Assignments = Map<Identifier, number>;
export type Substitutions = Map<Identifier, Term>;

export class Expression {
  constructor(readonly a: INode) {}

  public plus(b: Term): Expression {
    return new Expression(add(this.a, toNode(b)));
  }

  public minus(b: Term): Expression {
    return new Expression(sub(this.a, toNode(b)));
  }

  public times(b: Term): Expression {
    return new Expression(mult(this.a, toNode(b)));
  }

  public dividedBy(b: Term): Expression {
    return new Expression(div(this.a, toNode(b)));
  }

  public squared() {
    return this.toThe(2);
  }

  public toThe(n: number): Expression {
    return new Expression(pow(this.a, n));
  }

  public abs(): Expression;
  public abs(b: Term): ExpressionStack<Expression>;
  public abs(b?: Term): Expression | ExpressionStack<Expression> {
    if (b !== undefined) {
      return this.push(b).abs();
    }
    return new Expression(abs(this.a));
  }

  public sin(): Expression;
  public sin(b: Term): ExpressionStack<Expression>;
  public sin(b?: Term): Expression | ExpressionStack<Expression> {
    if (b !== undefined) {
      return this.push(b).sin();
    }
    return new Expression(sin(this.a));
  }

  public cos(): Expression;
  public cos(b: Term): ExpressionStack<Expression>;
  public cos(b?: Term): Expression | ExpressionStack<Expression> {
    if (b !== undefined) {
      return this.push(b).cos();
    }
    return new Expression(cos(this.a));
  }

  public tan(): Expression;
  public tan(b: Term): ExpressionStack<Expression>;
  public tan(b?: Term): Expression | ExpressionStack<Expression> {
    if (b !== undefined) {
      return this.push(b).tan();
    }
    return new Expression(tan(this.a));
  }

  public eq(b: Term): Expression {
    return new Expression(eq(this.a, toNode(b)));
  }

  public push(b: Term): ExpressionStack<Expression> {
    return new ExpressionStack<Expression>(this, toNode(b));
  }

  public toString(indent = "", inline = true) {
    return this.a.toString(
      indent,
      inline ? new InlineFormat() : new TreeFormat()
    );
  }

  public derivative(withRespectTo: Identifier): Expression {
    return new Expression(this.a.derivative(withRespectTo));
  }

  public eval(assign: Assignments): number {
    return this.a.eval(assign);
  }

  public apply(subs: Substitutions): Expression {
    return new Expression(this.a.apply(subs));
  }
}
