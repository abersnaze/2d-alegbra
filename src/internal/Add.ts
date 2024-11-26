import { Applications, Identifier, INode, Interval } from "../interface"
import { Const, value } from "./Const"
import { iadd } from "./Internval"
import { mult } from "./Mult"

export function add(...terms: INode[]): INode {
  const flat = []
  let accum = [0, 0] as Interval
  for (const term of terms) {
    if (term instanceof Const) {
      accum = iadd(accum, term.value)
    } else if (term instanceof Add) {
      accum = iadd(accum, term.value)
      term.terms.forEach(t => flat.push(t))
    } else {
      flat.push(term)
    }
  }
  if (flat.length === 0) {
    return value(accum)
  }
  if (accum === 0 && flat.length === 1) {
    return flat[0]
  }
  return new Add(accum, flat)
}

export function sub(a: INode, b: INode): INode {
  return add(a, mult(value(-1), b))
}

export class Add implements INode {
  constructor(readonly value: Interval, readonly terms: INode[]) {
    if (terms === undefined)
      throw new Error()
  }

  apply(subs: Applications): INode {
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
    if (this.value !== 0) {
      terms.push(value(this.value))
    }
    return add(...terms)
  }

  derivative(withRespectTo: Identifier): INode {
    return add(...this.terms.map(term => term.derivative(withRespectTo)))
  }

  toString(): string {
    const terms = this.terms.map(t => t.toString())
    if (this.value !== 0)
      terms.push(this.value.toString())
    return terms.join(" + ")
  }
}