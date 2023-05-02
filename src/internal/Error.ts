import { Identifier, INode } from "../interface"

export class Error implements INode {
  constructor(readonly message: string, readonly components: INode[]) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_subs: Map<Identifier, INode>): INode {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  derivative(_withRespectTo: Identifier): INode {
    return this
  }

  print(): string {
    return "[ERROR:" + this.message + ":" + this.components.map(c => c.print()).join(",") + "]"
  }
}

export function error(message: string, ...components: INode[]): Error {
  return new Error(message, components)
}
