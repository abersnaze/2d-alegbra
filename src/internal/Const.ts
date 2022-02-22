import { Identifier, INode } from "../interface"

export class Const implements INode {
  constructor(readonly value: number) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_subs: Map<Identifier, INode>): INode {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  derivative(_withRespectTo: Identifier): INode {
    return ZERO
  }

  print(): string {
    return this.value.toString()
  }
}

const NEG_ONE = new Const(-1)
const ZERO = new Const(0)
const ONE = new Const(1)
const TWO = new Const(2)

export function value(a: number): INode {
  if (a === 0) {
    return ZERO
  }
  if (a === 1)
    return ONE
  if (a === -1)
    return NEG_ONE
  if (a === 2)
    return TWO
  return new Const(a)
}
