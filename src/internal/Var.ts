import { Identifier, INode } from "../interface"
import { ONE, value, ZERO } from "./Const"

export function variable(id: Identifier): INode {
  return new Var(id)
}

export class Var implements INode {
  private static idSequence = 1
  private description: string

  constructor(readonly id: Identifier) {
    if (typeof id === "symbol")
      this.description =
        (this.id as symbol)["description"] || "x" + Var.idSequence++
    else this.description = id
  }

  apply(subs: Map<Identifier, INode>): INode {
    const _a = subs.get(this.id)
    if (_a === undefined)
      return this
    return _a
  }

  derivative(withRespectTo: Identifier): INode {
    return withRespectTo === this.id ? ONE : ZERO
  }

  print(): string {
    return this.description
  }
}
