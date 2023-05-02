import { Identifier, INode } from "../interface"
import { Const, MIN, NEG_MIN, NEG_ONE, value, ZERO } from "./Const"
import { Error, error } from "./Error"
import { mult } from "./Mult"

export function add(...terms: INode[]): INode {
  const flat = []
  const values: Const[] = []
  for (const term of terms) {
    if (term instanceof Const) {
      values.push(term)
    } else if (term instanceof Add) {
      terms.push(...term.terms)
    } else {
      flat.push(term)
    }
  }
  const sum = values.reduce((a: Const | Error, b) => {
    if (a instanceof Error)
      return a
    if (a === ZERO)
      return b
    if (a === MIN)
      if (b === NEG_MIN)
        return error("indeterminate", new Add([a, b]));
    if (b === ZERO || b === MIN || b === NEG_MIN)
      return a
    return value(a.value + b.value)
  }, ZERO)
  if (sum !== ZERO && sum !== MIN && sum !== NEG_MIN) {
    flat.push(sum)
  }
  if (flat.length === 1) {
    return flat[0]
  }
  return new Add(flat)
}

export function sub(a: INode, b: INode): INode {
  return add(a, mult(NEG_ONE, b))
}

export class Add implements INode {
  constructor(readonly terms: INode[]) { }

  apply(subs: Map<Identifier, INode>): INode {
    let changed = false
    const terms = this.terms.map(term => {
      const t = term.apply(subs)
      if (t !== term) {
        changed = true
      }
      return t
    })
    if (!changed)
      return this
    return add(...terms)
  }

  derivative(withRespectTo: Identifier): INode {
    return add(...this.terms.map(term => term.derivative(withRespectTo)))
  }

  print(): string {
    const terms = this.terms.map(t => t.print())
    terms.sort()
    return terms.join(" + ")
  }
}