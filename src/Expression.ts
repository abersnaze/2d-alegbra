import { ExpressionStack } from "./ExpressionStack";
import { Constant } from "./node/Constant";
import { add, cos, div, eq, INode, mult, pow, sin, sub, tan, Term, toNode, Identifier, value } from "./node/index";

export type Assignments = Map<Identifier, number>;
export type Substitutions = Map<Identifier, Expression>;

export class Expression {
  constructor(readonly a: INode) { }

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

  public sin(): Expression {
    return new Expression(sin(this.a));
  }

  public cos(): Expression {
    return new Expression(cos(this.a));
  }

  public tan(): Expression {
    return new Expression(tan(this.a));
  }

  public eq(b: Term): Expression {
    return new Expression(eq(this.a, toNode(b)));
  }

  public push(b: Term): ExpressionStack<Expression> {
    return new ExpressionStack<Expression>(this, toNode(b));
  }

  public toString(indent = "") {
    return this.a.toString(indent);
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
