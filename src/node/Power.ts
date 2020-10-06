import { Assignments, Substitutions } from "../Expression";
import { INode, mult, pow, value, Identifier } from "./index";

export class Pow implements INode {
  constructor(readonly a: INode, readonly b: number) { }

  public eval(assign: Assignments): number {
    return Math.pow(this.a.eval(assign), this.b);
  }

  public apply(subs: Substitutions): INode {
    return pow(this.a.apply(subs), this.b);
  }

  public derivative(withRespectTo: Identifier): INode {
    const da = this.a.derivative(withRespectTo);
    const x = pow(this.a, this.b - 1);
    const out = mult(mult(value(this.b), x), da);
    return out;
  }

  public degree(): Map<INode, number> | undefined {
    const degrees = this.a.degree();
    if (degrees === undefined) {
      return undefined;
    }
    degrees.forEach((degree, exp) => degrees.set(exp, degree * this.b));
    return degrees;
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [this.b, this.a];
  }

  public toString(indent = ""): string {
    return "^" +
      "\n" + indent + "├ " + this.a.toString(indent + "│ ") +
      "\n" + indent + "└ " + this.b;
  }
}
