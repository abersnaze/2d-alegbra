import { Assignments, Substitutions } from "../Expression";
import { InlineFormat } from "../format/InlineFormat";
import { cos, degreeSum, Identifier, INode, mult, sin } from "./index";

export class Sine implements INode {
  constructor(readonly a: INode) { }

  public op(): string {
    return undefined;
  }

  public eval(assign: Assignments): number {
    return Math.sin(this.a.eval(assign));
  }

  public apply(subs: Substitutions): INode {
    return sin(this.a.apply(subs));
  }

  public derivative(withRespectTo: Identifier): INode {
    return mult(cos(this.a), this.a.derivative(withRespectTo));
  }

  public degree(): Array<[INode, number]> {
    return [[this, 1], [degreeSum, 1]];
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(indent = "", fmt = new InlineFormat()): string {
    return fmt.func(indent, "sin", this.a);
  }

  public equals(that: INode): boolean {
    if (this === that)
      return true;
    if (!(that instanceof Sine))
      return false;
    return this.a.equals(that.a);
  }
}
