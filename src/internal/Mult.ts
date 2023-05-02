import { Identifier, INode } from "../interface"
import { Add } from "./Add"
import { Const, NEG_ONE, ONE, value, ZERO } from "./Const"
import { error } from "./Error"
import { pow } from "./Pow"

export function mult(...factors: INode[]): INode {
  const flat = []
  let values = []
  for (const factor of factors) {
    if (factor instanceof Const) {
      values.push(factor.value)
    } else if (factor instanceof Mult) {
      values.push(factor.value)
      flat.push(...factor.factors)
    } else {
      flat.push(factor)
    }
  }
  if (values.some(v => v === 0)) {
    if (values.some(v => v === Infinity || v === -Infinity)) {
      return error("indeterminate", new Mult(1, [...values.map(value), ...flat]))
    }
    return ZERO
  }
  const v = values.reduce((a, b) => a * b, 1)
  if (flat.length === 0) {
    return value(v)
  }
  if (v === 1 && flat.length === 1) {
    return flat[0]
  }
  return new Mult(v, flat)
}

export function div(a: INode, b: INode): INode {
  if (a === ZERO)
    return ZERO
  if (b === ONE)
    return a
  return mult(a, pow(b, NEG_ONE))
}


class Mult implements INode {
  constructor(readonly value: number, readonly factors: INode[]) { }

  apply(subs: Map<Identifier, INode>): INode {
    let changed = false
    const factors = this.factors.map(f => {
      const t = f.apply(subs)
      if (t !== f) {
        changed = true
      }
      return t
    })
    if (!changed)
      return this
    if (this.value !== 0) {
      factors.push(value(this.value))
    }
    return mult(...factors)
  }

  derivative(withRespectTo: Identifier): INode {
    return mult(...this.factors.map(f => f.derivative(withRespectTo)))
  }

  print(): string {
    const factors = this.factors.map(f => {
      if (f instanceof Add) {
        return "(" + f.print() + ")"
      }
      return f.print()
    })
    let value = this.value
    let prefix = ""
    if (value < 0) {
      value = -value
      prefix = "-"
    }
    if (value !== 1)
      factors.push(value.toString())
    return prefix + factors.join("*")
  }
}

