import { Assignments, Substitutions } from "../Expression";
import { InlineFormat } from "../format/InlineFormat";
import { Identifier, INode, mult, pow, value } from "./index";

export class Power implements INode {
  constructor(readonly a: INode, readonly b: number) { }

  public op(): string {
    return "^";
  }

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

  public degree(): Array<[INode, number]> | undefined {
    const degrees = this.a.degree();
    if (degrees === undefined) {
      return undefined;
    }
    return degrees.map(([exp, degree]) => [exp, degree * this.b]);
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [this.b, this.a];
  }

  public toString(indent = "", fmt = new InlineFormat()): string {
    return fmt.binary(indent, this.op(), this.a, value(this.b));
  }

  public equals(that: INode): boolean {
    if (this === that)
      return true;
    if (!(that instanceof Power))
      return false;
    return this.a.equals(that.a) && this.b === that.b;
  }
}
