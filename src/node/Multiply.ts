import { Assignments } from "../Expression";
import { Constant } from "./Constant";
import { add, INode, mult } from "./index";

export class Multiply implements INode {
  constructor(readonly a: INode, readonly b: INode) { }

  public eval(assign: Assignments): number {
    return this.a.eval(assign) * this.b.eval(assign);
  }

  public derivative(withRespectTo: symbol): INode {
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

  public toString(indent = ""): string {
    return "*" +
      "\n" + indent + "├ " + this.a.toString(indent + "│ ") +
      "\n" + indent + "└ " + this.b.toString(indent + "  ");
  }
}
