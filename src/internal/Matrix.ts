import CallableInstance from "callable-instance"
import { Applications, Assignments, IMatrix, INode, Substitutions, Term } from "../interface"
import { add, sub } from "./Add"
import { Const, value } from "./Const"
import { eq, toNode, toNodes } from "./Expression"
import { div, mult } from "./Mult"
import { pow } from "./Pow"

export function matrix(...row: Term[]): Matrix {
  return new Matrix(row.length, row.map(toNode))
}

export class Matrix extends CallableInstance<[...Term[]], Matrix> implements IMatrix {
  constructor(readonly width: number, readonly exps: INode[]) {
    super("addRow")
    if (exps === undefined)
      throw new Error("wtf")
  }

  addRow(...row: Term[]): Matrix {
    if (this.width != row.length)
      throw new Error(`new rows must match in length to existing rows ${row.length}`)
    const _row = row.map(toNode)
    const exps = this.exps.concat(_row)
    return new Matrix(this.width, exps)
  }

  plus(b: Matrix): Matrix {
    return mmap((i, j, expA, expB) => add(expA, expB), this, b)
  }

  minus(b: Matrix): Matrix {
    return mmap((i, j, expA, expB) => sub(expA, expB), this, b)
  }

  times(b: Term): Matrix
  times(b: Matrix): Matrix
  times(b: Term | Matrix): Matrix {
    if (b instanceof Matrix) {
      return dotProducts(this, b)
    } else {
      return scalarProduct(this, toNode(b))
    }
  }

  inverse(): Matrix {
    return inverse(this)
  }

  dividedBy(b: Term): Matrix
  dividedBy(b: Matrix): Matrix
  dividedBy(b: Term | Matrix): Matrix {
    if (b instanceof Matrix) {
      return dotProducts(this, inverse(b))
    } else {
      return scalarProduct(this, pow(toNode(b), value(-1)))
    }
  }

  eq(b: Matrix): Matrix {
    return mmap((i, j, expA, expB) => eq(expA, expB), this, b)
  }

  toString(): string {
    let out = "["
    for (let k = 0, i = 0; k < this.exps.length; k++) {
      out += this.exps[k].toString()
      if (k + 1 === this.exps.length) {
        break
      }
      if (++i === this.width) {
        i = 0
        out += "; "
      } else {
        out += ", "
      }
    }
    return out + "]"
  }

  eval(subs: Assignments): number[][] {
    const result = this.apply(subs)
    if (!result.exps.every(e => e instanceof Const)) {
      throw new Error()
    }
    return []
  }

  apply(subs: Substitutions) {
    return new Matrix(this.width, this.exps.map(e => e.apply(toNodes(subs))))
  }
}

export function scalarProduct(A: Matrix, b: INode) {
  return mmap((i, j, exp) => mult(exp, b), A)
}

export function dotProducts(a: Matrix, b: Matrix) {
  const aW = a.width
  const aH = a.exps.length / a.width
  const bW = b.width
  const bH = b.exps.length / b.width

  if (aW !== bH)
    throw new Error(`number of columns ${aW} should be ${bH}`)

  const cW = bW
  const cExps = []

  for (let j = 0; j < aH; j++) {
    for (let i = 0; i < bW; i++) {
      let cExp = value(0)
      for (let k = 0; k < bH; k++) {
        const aExp = a.exps[j * aW + k]
        const bExp = b.exps[k * bW + i]
        const tmp = mult(aExp, bExp)
        cExp = add(cExp, tmp)
      }
      cExps.push(cExp)
    }
  }

  return new Matrix(cW, cExps)
}

export function inverse(m: Matrix): Matrix {
  // produce the matrix of minor determinants
  const out = []
  let i = 0, j = 0
  for (let k = 0; k < m.exps.length; k++) {
    const tmp = minor(j, i, m)
    const det = determinant(tmp)
    if ((i + j) % 2 === 0) {
      out.push(det)
    } else {
      out.push(mult(det, value(-1)))
    }
    if (++i === m.width) {
      i = 0
      j++
    }
  }
  const one_over_det = div(value(1), determinant(m))
  return new Matrix(m.width, out.map(exp => mult(one_over_det, exp)))
}

export function determinant(a: Matrix): INode {
  if (a.exps.length !== a.width * a.width) {
    throw new Error(`can only take determinant of square matrices. given ${a.exps.length / a.width}x${a.width}`)
  }
  if (a.exps.length === 1) return a.exps[0]
  const j = 0
  let sum = value(0)
  for (let i = 0; i < a.width; i++) {
    let minor_det = determinant(minor(i, j, a))
    if ((i + j) % 2 === 1) {
      minor_det = mult(minor_det, value(-1))
    }
    sum = add(sum, mult(a.exps[i], minor_det))
  }
  return sum
}

export function minor(i: number, j: number, m: Matrix): Matrix {
  const out = []
  let t = 0, u = 0
  for (let k = 0; k < m.exps.length; k++) {
    if (t !== i && u !== j) {
      out.push(m.exps[k])
    }
    if (++t === m.width) {
      t = 0
      u++
    }
  }
  return new Matrix(m.width - 1, out)
}

/** mapping multiple 2d array */
export function mmap(
  func: (i: number, j: number, ...t: INode[]) => INode,
  m: Matrix,
  ...ms: Matrix[]
): Matrix {
  const out = []
  let i = 0, j = 0
  for (let k = 0; k < m.exps.length; k++) {
    const exp = func(i, j, ...ms.map((m) => m.exps[k]))
    out.push(exp)
    if (++i === m.width) {
      i = 0
      j++
    }
  }
  return new Matrix(m.width, out)
}
