import { Assignments, Substitutions } from "../Expression";
import { degreeSum, Identifier, INode, value } from "./index";

export class Variable implements INode {
  private static idSequence = 1;
  private description: string;

  constructor(readonly a: Identifier) {
    if (typeof a === "symbol")
      this.description =
        (this.a as symbol)["description"] || "x" + Variable.idSequence++;
    else this.description = a;
  }

  public op(): string {
    return undefined;
  }

  public eval(assign: Assignments): number {
    const r = assign.get(this.a);
    if (r !== undefined) {
      return r;
    }
    throw new Error(
      "variable " + this + " not defined in " + JSON.stringify(assign)
    );
  }

  public apply(subs: Substitutions): INode {
    const r = subs.get(this.a);
    if (r !== undefined) {
      return r.a;
    }
    return this;
  }

  public derivative(withRespectTo: Identifier): INode {
    return withRespectTo === this.a ? value(1) : value(0);
  }

  public degree(): [INode, number][] {
    return [
      [this, 1],
      [degreeSum, 1],
    ];
  }

  public coefficient(): [number, INode] {
    return [1, this];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(): string {
    return this.description;
  }

  public equals(that: INode): boolean {
    if (this === that) return true;
    if (!(that instanceof Variable)) return false;
    return this.a === that.a && this.description === that.description;
  }
}
