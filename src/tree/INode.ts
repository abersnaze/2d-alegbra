import { Assignments } from "..";
import { Add } from "./Add";
import { Constant } from "./Constant";
import { Cosine } from "./Cosine";
import { Multiply } from "./Multiply";
import { Pow } from "./Power";
import { Sine } from "./Sine";
import { Variable } from "./Variable";

export interface INode {
  eval(assign: Assignments): number;
  derivative(withRespectTo: symbol): INode;
  degree(): Map<INode, number> | undefined;
  coefficient(): [number, INode];
  exponent(): [number, INode];
  toString(indent?: string): string;
}

const vars = new Map<symbol, Variable>();
export function variable(a: symbol = Symbol()): Variable {
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
  if (b > 1 && (a instanceof Add || a instanceof Multiply)) {
    return mult(a, pow(a, b - 1));
  }
  if (a instanceof Constant) {
    return value(Math.pow(a.n, b));
  }
  if (a instanceof Pow) {
    return pow(a.a, a.b + b);
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
  const aDegrees = a.degree();
  const bDegrees = b.degree();

  if (aDegrees === undefined) {
    return 0 - 1;
  }
  if (bDegrees === undefined) {
    return 1 - 0;
  }

  const aTotal = aDegrees.get(value(0))!;
  const bTotal = bDegrees.get(value(0))!;
  if (aTotal !== bTotal) {
    return aTotal - bTotal;
  }

  for (const v of Array.from([...aDegrees.keys(), ...bDegrees.keys()]).sort()) {
    const aDegree = aDegrees.get(v) || 0;
    const bDegree = bDegrees.get(v) || 0;
    const diff = aDegree - bDegree;
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}
