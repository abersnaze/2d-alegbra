import { Groups } from ".";
import { IExpression, INode } from "../interface";
import { abs } from "../internal/Abs";
import { add } from "../internal/Add";
import { value } from "../internal/Const";
import { expression, I } from "../internal/Expression";
import { log } from "../internal/Log";
import { mult } from "../internal/Mult";
import { pow } from "../internal/Pow";
import { cos, sin } from "../internal/Trig";
import { variable } from "../internal/Var";

function consoledebug(
  from: INode,
  pattern: INode,
  groups?: Groups,
  to?: INode,
) {
  const gs = [];
  if (groups) {
    for (const g of Object.getOwnPropertySymbols(groups)) {
      gs.push(g.description + ":" + groups[g].toString());
    }
  }
  console.log({
    from: from.toString(),
    pattern: pattern.toString(),
    groups: gs.length > 0 ? gs.join(", ") : undefined,
    to: to?.toString(),
  });
}

const CONSTANTS = Symbol('ℝ')

export interface Rule {
  from: IExpression;
  /**
   *
   */
  to: (groups: Groups) => INode;
  /**
   * with the matched variables mapped to segments of `from` the expression
   * this function returns the tree of `nodes` that represent the equivalent
   * expression. Invoked once for each time a pattern has matched or once if
   * the pattern doesn't match (with `groups` and `to` undefined).
   * @param from - the original expression the pattern matched on.
   * @param pattern - the pattern passed in as a parameter
   * @param groups - for each variable in the pattern there is a on tree node.
   * @param to - the result of appling the `to` function.
   */
  debug?: (
    from: INode,
    pattern: INode,
    groups?: Groups,
    to?: INode
  ) => void;
}

// symbols with the description of "const" are only
// match()'d with Constant nodes
const a = Symbol("numA");
const b = Symbol("numB");
const w = Symbol("varW");
const x = Symbol("varX");
const y = Symbol("varY");
const z = Symbol("varZ");

/** dictionary of algebraic identities that can be applied to simplify expressions */
export const rules = (): { [key: string]: Rule } => ({
  // identities that elementate nodes
  "x+0 => x": {
    from: expression(x).plus(0),
    to: (m) => m[x],
  },
  "1*x => x": {
    from: expression(1).times(x),
    to: (m) => m[x],
  },
  "0*x => 0": {
    from: expression(0).times(x),
    to: () => value(0),
  },
  "x-x => 0": {
    from: expression(x).minus(x),
    to: () => value(0),
  },
  "x^0 => 1": {
    from: expression(x).toThe(0),
    to: () => value(1),
  },
  "x^1 => x": {
    from: expression(x).toThe(1),
    to: (m) => m[x],
  },
  "1^x => 1": {
    from: expression(1).toThe(x),
    to: () => value(1),
  },
  "0^x => 0": {
    from: expression(0).toThe(x),
    to: () => value(0),
  },
  "sin^2(x) + cos^2(x) => 1": {
    from: expression(x).sin().squared().push(x).cos().squared().plus(),
    to: () => value(1),
  },
  "i*i => -1": {
    from: expression(I).times(I),
    to: () => value(-1),
  },
  "abs(abs(x) => abs(x)": {
    from: expression(x).abs().abs(),
    to: (m) => abs(m[x]),
  },
  "abs(-x) => abs(x)": {
    from: expression(x).times(-1).abs(),
    to: (m) => abs(m[x]),
  },
  "log(e^x) => x": {
    from: expression(Math.E).toThe(x).log(),
    to: (m) => m[x],
  },

  // identities that solve to value
  "a+b => solve": {
    from: expression(a).plus(b),
    to: (m) => value(m[a].eval(CONSTANTS) + m[b].eval(CONSTANTS)),
  },
  "a*b => solve": {
    from: expression(a).times(b),
    to: (m) => value(m[a].eval(CONSTANTS) * m[b].eval(CONSTANTS)),
  },
  "a^b => solve": {
    from: expression(a).toThe(b),
    to: (m) => value(Math.pow(m[a].eval(CONSTANTS), m[b].eval(CONSTANTS))),
  },
  "log(a) => solve": {
    from: expression(a).log(),
    to: (m) => value(Math.log(m[a].eval(CONSTANTS))),
  },
  "abs(a) => solve": {
    from: expression(a).abs(),
    to: (m) => value(Math.abs(m[a].eval(CONSTANTS))),
  },
  "sin(π) => 0": {
    // Math.sin(π) isn't zero
    from: expression(Math.PI).sin(),
    to: () => value(0),
  },
  "cos(π/2) => 0": {
    from: expression(Math.PI).dividedBy(2).cos(),
    to: () => value(0),
  },
  "sin(a) => solve": {
    from: expression(a).sin(),
    to: (m) => value(Math.sin(m[a].eval(CONSTANTS))),
  },
  "cos(a) => solve": {
    from: expression(a).cos(),
    to: (m) => value(Math.cos(m[a].eval(CONSTANTS))),
  },

  // identities that shift parts around
  "x + x => 2*x": {
    from: expression(x).plus(x),
    to: (m) => mult(value(2), m[x]),
  },
  "x + y*x => (y+1)*x": {
    from: expression(x).push(y).times(x).plus(),
    to: (m) => mult(add(m[y], value(1)), m[x]),
  },
  "y*x + z*x => (y + z)*x": {
    from: expression(y).times(x).push(z).times(x).plus(),
    to: (m) => mult(add(m[y], m[z]), m[x]),
  },

  "x * x => x^2": {
    from: expression(x).times(x),
    to: (m) => pow(m[x], value(2)),
  },
  "x * x^y => x^(y + 1)": {
    from: expression(x).push(x).toThe(y).times(),
    to: (m) => pow(m[x], add(m[y], value(1))),
  },
  "x^y * x^z => x^(y + z)": {
    from: expression(x).toThe(y).push(x).toThe(z).times(),
    to: (m) => pow(m[x], add(m[y], m[z])),
  },
  "x^(y + z) => x^y * x^z": {
    from: expression(x).push(y).times(z).toThe(),
    to: (m) => mult(pow(m[x], m[y]), pow(m[x], m[z])),
  },
  "(x*y)^z => x^z * y^z": {
    from: expression(x).times(y).toThe(z),
    to: (m) => mult(pow(m[x], m[z]), pow(m[y], m[z])),
  },
  "x^y^z => x^(y*z)": {
    from: expression(x).toThe(y).toThe(z),
    to: (m) => pow(m[x], mult(m[y], m[z])),
  },
  "abs(x)*abs(y) => abs(x*y)": {
    from: expression(x).abs().push(y).abs().times(),
    to: (m) => abs(mult(m[x], m[y])),
  },
  "abs(x*y) => abs(x)*abs(y)": {
    from: expression(x).times(y).abs(),
    to: (m) => mult(abs(m[x]), abs(m[y])),
  },
  "sin(-x) => -sin(x)": {
    from: expression(x).times(-1).sin(),
    to: (m) => mult(value(-1), sin(m[x])),
  },
  "cos(-x) => -cos(x)": {
    from: expression(x).times(-1).cos(),
    to: (m) => mult(value(-1), cos(m[x])),
  },
  "sin(x + y) => sin(x)*cos(y) + cos(x)*sin(y)": {
    from: expression(x).plus(y).sin(),
    to: (m) => add(mult(sin(m[x]), cos(m[y])), mult(cos(m[x]), sin(m[y]))),
  },
  "cos(x + y) => cos(x)*cos(y) - sin(x)*sin(y)": {
    from: expression(x).plus(y).cos(),
    to: (m) => add(mult(cos(m[x]), cos(m[y])), mult(sin(m[x]), sin(m[y]))),
  },
  "e^(x*i) => cos(x) + i*sin(x)": {
    from: expression(Math.E).push(x).times(I).toThe(),
    to: (m) => add(cos(m[x]), mult(variable(I), sin(m[x]))),
  },

  "log(x*y) => log(x) + log(x)": {
    from: expression(x).times(y).log(),
    to: (m) => add(log(m[x]), log(m[y])),
  },
  "log(x^y) => y*log(x)": {
    from: expression(x).toThe(y).log(),
    to: (m) => mult(m[y], log(m[x])),
  },

  "y*x + z*x => (y+z)*x": {
    from: expression(y).times(x).push(z).times(x).plus(),
    to: (m) => mult(add(m[y], m[z]), m[x]),
    debug: consoledebug,
  },
});
