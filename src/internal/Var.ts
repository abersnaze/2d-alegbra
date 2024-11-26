import { Applications, Identifier, INode } from "../interface"
import { value } from "./Const"

/** square root of -1. i^2 = -1, ij = k, ik = j, kj = i */
export const I = Symbol("𝑖")
/** square root of -1. j^2 = -1, ij = k, ik = j, kj = i */
export const J = Symbol("𝑗")
/** square root of -1. k^2 = -1, ij = k, ik = j, kj = i */
export const K = Symbol("𝑘")

/** Euler's number, automatically substituted in for Const.E */
export const E = Symbol("𝑒")
/** Circle constant, automatically substituted in for Const.PI */
export const PI = Symbol("π")

export function variable(id: Identifier): INode {
  return new Var(id)
}

export class Var implements INode {
  private static idSequence = 1
  private description: string

  constructor(readonly id: Identifier) {
    if (typeof id === "symbol")
      this.description = id.description || "x" + Var.idSequence++
    else this.description = id.toString()
  }

  apply(subs: Applications): INode {
    const _a = subs[this.id]
    if (_a === undefined)
      return this;
    new Error("subs:" + subs + ", id:" + this.id.toString() + " not found")
    return _a
  }

  derivative(withRespectTo: Identifier): INode {
    return withRespectTo === this.id ? value(1) : value(0)
  }

  toString(): string {
    return this.description
  }
}
