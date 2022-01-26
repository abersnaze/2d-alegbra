import { Assignments, Substitutions } from "../Expression";
import { InlineFormat } from "../format/InlineFormat";
import { abs, div, INode } from "./index";

export class Absolute implements INode {
  constructor(readonly a: INode) {}

  public op(): string {
    return undefined;
  }

  public eval(assign: Assignments): number {
    return Math.abs(this.a.eval(assign));
  }

  public apply(subs: Substitutions): INode {
    return abs(this.a.apply(subs));
  }

  public derivative(): INode {
    return div(this.a, abs(this.a));
  }

  public degree(): [INode, number][] | undefined {
    return this.a.degree();
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(indent = "", fmt = new InlineFormat()): string {
    return fmt.func(indent, "abs", this.a);
  }

  public equals(that: INode): boolean {
    if (this === that) return true;
    if (!(that instanceof Absolute)) return false;
    return this.a.equals(that.a);
  }
}
