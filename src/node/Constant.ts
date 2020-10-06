import { Assignments, Substitutions } from "../Expression";
import { degreeSum, INode, value, Identifier } from "./index";

export class Constant implements INode {
  constructor(readonly n: number) { }

  public eval(assign: Assignments): number {
    return this.n;
  }

  public apply(subs: Substitutions): INode {
    return this;
  }

  public derivative(withRespectTo: Identifier): INode {
    return value(0);
  }

  public degree(): Map<INode, number> {
    return new Map([[degreeSum, 0]]);
  }

  public coefficient(): [number, INode] {
    return [this.n, value(1)];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(indent = ""): string {
    return this.n.toString();
  }
}
