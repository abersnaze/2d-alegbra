import { Assignments } from "../Expression";
import { degreeSum, INode, value, Identifier } from "./index";

export class Variable implements INode {
  private static idSequence = 1;
  private description: string;

  constructor(readonly a: Identifier) {
    this.description = (this.a as any).description || ("x" + Variable.idSequence++);
  }

  public eval(assign: Assignments): number {
    const r = assign.get(this.a);
    if (r !== undefined) {
      return r;
    }
    throw new Error("variable " + this + " not defined in " + JSON.stringify(assign));
  }

  public derivative(withRespectTo: Identifier): INode {
    return (withRespectTo === this.a) ? value(1) : value(0);
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

  public toString(): string {
    return this.description;
  }
}
