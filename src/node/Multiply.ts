import { Assignments, Substitutions } from "../Expression";
import { Format } from "../format";
import { InlineFormat } from "../format/InlineFormat";
import { Constant } from "./Constant";
import { add, INode, mult, Identifier } from "./index";

export class Multiply implements INode {
  constructor(readonly a: INode, readonly b: INode) { }

  public op(): string {
    return "*"
  }

  public eval(assign: Assignments): number {
    return this.a.eval(assign) * this.b.eval(assign);
  }

  public apply(subs: Substitutions): INode {
    return mult(this.a.apply(subs), this.b.apply(subs));
  }

  public derivative(withRespectTo: Identifier): INode {
    // apply the power rule a*b... => a'*b + a*b'
    const da = this.a.derivative(withRespectTo);
    const db = this.b.derivative(withRespectTo);
    return add(mult(da, this.b), mult(this.a, db));
  }

  public degree(): Map<INode, number> | undefined {
    const aDegrees = this.a.degree();
    const bDegrees = this.b.degree();
    if (aDegrees === undefined || bDegrees === undefined) {
      return undefined;
    }
    const degrees = new Map(aDegrees);
    bDegrees.forEach((bDegree, bExp) => {
      return degrees.set(bExp, (aDegrees.get(bExp) || 0) + bDegree);
    });
    return degrees;
  }

  public coefficient(): [number, INode] {
    if (this.a instanceof Constant) {
      return [this.a.n, this.b];
    }
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(indent = "", fmt = new InlineFormat()): string {
    return fmt.binary(indent, this.op(), this.a, this.b);
  }
}
