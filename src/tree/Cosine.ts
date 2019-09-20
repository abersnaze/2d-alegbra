import { Assignments } from "..";
import { INode, mult, sin, value } from "./INode";

export class Cosine implements INode {
  constructor(readonly a: INode) { }
  public eval(assign: Assignments): number {
    return Math.cos(this.a.eval(assign));
  }

  public derivative(withRespectTo: symbol): INode {
    return mult(value(-1), mult(sin(this.a), this.a.derivative(withRespectTo)));
  }

  public degree(): Map<INode, number> {
    return new Map<INode, number>([[this, 1], [value(0), 1]]);
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
