import { Expression } from "./Expression";
import { toNode, Term } from "./node";

export function expression(a: Term): Expression {
  return new Expression(toNode(a));
}
export * from "./Expression";
export * from "./ExpressionStack";
export { Term } from "./node";
