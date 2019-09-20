import { Assignments } from "..";
import { INode, value } from "./INode";

export class Constant implements INode {
  constructor(readonly n: number) { }

  public eval(assign: Assignments): number {
    return this.n;
  }

  public derivative(withRespectTo: symbol): INode {
    return value(0);
  }

  public degree(): Map<INode, number> {
    return new Map([[value(0), 0]]);
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
