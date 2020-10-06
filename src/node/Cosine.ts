import { Assignments, Substitutions } from "../Expression";
import { cos, degreeSum, Identifier, INode, mult, sin, value } from "./index";

export class Cosine implements INode {
  constructor(readonly a: INode) { }

  public eval(assign: Assignments): number {
    return Math.cos(this.a.eval(assign));
  }

  public apply(subs: Substitutions): INode {
    return cos(this.a.apply(subs));
  }

  public derivative(withRespectTo: Identifier): INode {
    return mult(value(-1), mult(sin(this.a), this.a.derivative(withRespectTo)));
  }

  public degree(): Map<INode, number> {
    return new Map<INode, number>([[this, 1], [degreeSum, 1]]);
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(indent = ""): string {
    return "cosine" +
      "\n" + indent + "└ " + this.a.toString(indent + "  ");
  }
}
