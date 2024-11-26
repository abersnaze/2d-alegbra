import { Applications, Identifier, INode } from "../interface"
import { Add } from "./Add"
import { Const, value } from "./Const"
import { pow } from "./Pow"

export function mult(...prods: INode[]): INode {
  const flat = []
  let accum = 1
  for (const prod of prods) {
    if (prod instanceof Const) {
      accum *= prod.value
    } else if (prod instanceof Mult) {
      accum *= prod.value
      prod.prods.forEach(p => flat.push(p))
    } else {
      flat.push(prod)
    }
  }
  if (accum === 0) {
    return value(0)
  }
  if (flat.length === 0) {
    return value(accum)
  }
  if (accum === 1 && flat.length === 1) {
    return flat[0]
  }
  return new Mult(accum, flat)
}

export function div(a: INode, b: INode): INode {
  if (a === value(0))
    return value(0)
  if (b === value(1))
    return a
  return mult(a, pow(b, value(-1)))
}


class Mult implements INode {
  constructor(readonly value: number, readonly prods: INode[]) {
    if (prods === null) {
      throw new Error("wtf")
    }
    if (!prods.every(p => p !== undefined)) {
      throw new Error("wtf")
    }
  }

  apply(subs: Applications): INode {
    let changed = false
    const prods = this.prods.map(prod => {
      const t = prod.apply(subs)
      if (t !== prod) {
        changed = true
      }
      return t
    })
    if (!changed)
      return this
    if (this.value !== 0) {
      prods.push(value(this.value))
    }
    return mult(...prods)
  }

  derivative(withRespectTo: Identifier): INode {
    return mult(...this.prods.map(prod => prod.derivative(withRespectTo)))
  }

  toString(): string {
    const prods = this.prods.map(t => {
      if (t instanceof Add) {
        return "(" + t.toString() + ")"
      }
      return t.toString()
    })
    let value = this.value
    let prefix = ""
    if (this.value < 0) {
      value = -value
      prefix = "-"
    }
    if (value !== 1)
      prods.push(this.value.toString())
    return prefix + prods.join("*")
  }
}

