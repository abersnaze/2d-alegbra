import { degreeSum, INode, value } from "./index";

export class Constant implements INode {
  constructor(readonly n: number) {}

  public op(): string {
    return undefined;
  }

  public eval(): number {
    return this.n;
  }

  public apply(): INode {
    return this;
  }

  public derivative(): INode {
    return value(0);
  }

  public degree(): [INode, number][] {
    return [[degreeSum, 0]];
  }

  public coefficient(): [number, INode] {
    return [this.n, value(1)];
  }

  public exponent(): [number, INode] {
    return [1, this];
  }

  public toString(): string {
    return this.n.toString();
  }

  public equals(that: INode): boolean {
    if (this === that) return true;
    if (!(that instanceof Constant)) return false;
    return this.n === that.n;
  }
}
