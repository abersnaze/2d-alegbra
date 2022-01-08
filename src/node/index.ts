import { Assignments, Expression, Substitutions } from "../Expression";
import { Format } from "../format";
import { InlineFormat } from "../format/InlineFormat";
import { Add } from "./Add";
import { Constant } from "./Constant";
import { Cosine } from "./Cosine";
import { Multiply } from "./Multiply";
import { Pow } from "./Power";
import { Sine } from "./Sine";
import { Variable } from "./Variable";

export type Identifier = symbol | string;
export type Term = number | Identifier | Expression;

export interface INode {
  op(): string;
  eval(assign: Assignments): number;
  apply(subs: Substitutions): INode;
  derivative(withRespectTo: Identifier): INode;
  degree(): Map<INode, number> | undefined;
  coefficient(): [number, INode];
  exponent(): [number, INode];
  toString(indent?: string, fmt?: Format): string;
}

export function toNode(x: Term): INode {
  const typeofX = typeof x;
  if (typeofX === "symbol" || typeofX === "string") {
    return variable(x as Identifier);
  } else if (typeofX === "number") {
    return value(x as number);
  } else if (x instanceof Expression) {
    return x.a;
  } else {
    throw new Error("term is not number, symbol, string, or Expression");
  }
}

const vars = new Map<Identifier, Variable>();
export function variable(a: Identifier = Symbol()): Variable {
  let v = vars.get(a);
  if (v !== undefined) {
    return v;
  }
  v = new Variable(a);
  vars.set(a, v);
  return v;
}

export function value(a: number): Constant {
  if (a === 0) {
    return zero;
  }
  if (a === -1) {
    return negOne;
  }
  if (a === 1) {
    return one;
  }
  return new Constant(a);
}

export function add(a: INode, b: INode): INode {
  // make right precedent. (a+b)+c => a+(b+c)
  if (a instanceof Add) {
    return add(a.a, add(a.b, b));
  }

  // bubble sort the terms
  if (b instanceof Add) {
    const cmp = degreeComparator(a, b.a);
    if (cmp > 0) {
      return add(b.a, add(a, b.b));
    }
    if (cmp === 0) {
      const [aCoe, aTerm] = a.coefficient();
      const [bCoe] = b.a.coefficient();
      return add(mult(value(aCoe + bCoe), aTerm), b.b);
    }
  } else {
    const cmp = degreeComparator(a, b);
    if (cmp > 0) {
      return add(b, a);
    }
    if (cmp === 0) {
      const [aCoe, aTerm] = a.coefficient();
      const [bCoe] = b.coefficient();
      return mult(value(aCoe + bCoe), aTerm);
    }
  }

  if (a === zero) {
    return b;
  }

  return new Add(a, b);
}

export function sub(a: INode, b: INode): INode {
  return add(a, mult(value(-1), b));
}

const zero = new Constant(0);
const one = new Constant(1);
const negOne = new Constant(-1);
// marker used in computing the sort order of terms.
export const degreeSum = new Constant(NaN);

export function mult(a: INode, b: INode): INode {
  // distribute 2*(x+y) => 2x+2y
  if (a instanceof Add) {
    return add(mult(a.a, b), mult(a.b, b));
  }
  if (b instanceof Add) {
    return add(mult(a, b.a), mult(a, b.b));
  }
  if (a instanceof Multiply) {
    return mult(a.a, mult(a.b, b));
  }

  // bubble sort the terms
  if (b instanceof Multiply) {
    const cmp = degreeComparator(a, b.a);
    if (cmp > 0) {
      return mult(b.a, mult(a, b.b));
    }
    if (cmp === 0) {
      const [aExp, aTerm] = a.exponent();
      const [bExp] = b.a.exponent();
      if (a instanceof Constant) {
        return mult(value(a.n * (b.a as Constant).n), b.b);
      }
      return mult(pow(aTerm, aExp + bExp), b.b);
    }
  } else {
    const cmp = degreeComparator(a, b);
    if (cmp > 0) {
      return mult(b, a);
    }
    if (cmp === 0) {
      const [aExp, aTerm] = a.exponent();
      const [bExp] = b.exponent();
      if (a instanceof Constant) {
        return value(a.n * (b as Constant).n);
      }
      return pow(aTerm, aExp + bExp);
    }
  }

  if (a === zero) {
    return zero;
  }
  if (a === one) {
    return b;
  }
  return new Multiply(a, b);
}

export function pow(a: INode, b: number): INode {
  if (b === 0) {
    return one;
  }
  if (b === 1) {
    return a;
  }
  // unroll (x + y)^N => (x + y) * (x + y)....
  // unroll (x * y)^N => (x * y) * (x * y)....
  // so that the distribution rule can be applied
  if (Number.isInteger(b) && (a instanceof Add || a instanceof Multiply)) {
    const mag = Math.abs(b);
    let base = one as INode;
    for (let i = 0; i < mag; i++) {
      base = mult(base, a);
    }
    if (b < 0) {
      a = base;
      b = -1;
    } else {
      return base;
    }
  }
  if (a instanceof Constant) {
    return value(Math.pow(a.n, b));
  }
  if (a instanceof Pow) {
    return pow(a.a, Math.pow(a.b, b));
  }
  return new Pow(a, b);
}

export function div(a: INode, b: INode): INode {
  if (a === zero) {
    return zero;
  }
  if (b === one) {
    return a;
  }
  if (b === negOne) {
    return mult(negOne, a);
  }
  return mult(a, pow(b, -1));
}

export function sin(a: INode) {
  if (a instanceof Constant) {
    return value(Math.sin(a.n));
  }
  return new Sine(a);
}

export function cos(a: INode) {
  if (a instanceof Constant) {
    return value(Math.cos(a.n));
  }
  return new Cosine(a);
}

export function tan(a: INode) {
  if (a instanceof Constant) {
    return value(Math.tan(a.n));
  }
  return div(sin(a), cos(a));
}

export function eq(a: INode, b: INode): INode {
  const eqZero = sub(a, b);
  return pow(eqZero, 2);
}

/**
 * Compare the degree (power of exponents) for each variable in the product
 * @param a INode
 * @param b INode
 */
export function degreeComparator(a: INode, b: INode): number {
  console.log("############");
  const aDegrees = a.degree();
  const bDegrees = b.degree();

  console.log("\ta:", a.toString(), aDegrees)
  console.log("\tb:", b.toString(), bDegrees);
  if (aDegrees === undefined) {
    console.log("\tau A < B");
    return 0 - 1;
  }
  if (bDegrees === undefined) {
    console.log("\tbu A > B");
    return 1 - 0;
  }

  const aTotal = aDegrees.get(degreeSum)!;
  const bTotal = bDegrees.get(degreeSum)!;
  // Math.abs allow x and 1/x to sort to the same place to be canceled out
  if (Math.abs(aTotal) !== Math.abs(bTotal)) {
    console.log("\ttot", aTotal - bTotal < 0 ? "A < B" : "A > B");
    return aTotal - bTotal;
  }

  const keys = [...aDegrees.keys(), ...bDegrees.keys()];
  for (const v of Array.from(keys).sort()) {
    const aDegree = aDegrees.get(v) || 0;
    const bDegree = bDegrees.get(v) || 0;
    console.log("\t", v, '----', aDegree, '----', bDegree);
    // Math.abs allow x and 1/x to sort to the same place to be canceled out
    if (Math.abs(aDegree) !== Math.abs(bDegree)) {
      console.log("\tpart", aDegree - bDegree < 0 ? "A < B" : "A > B");
      return aDegree - bDegree;
    }
  }

  console.log("\tA = B");
  return 0;
}
