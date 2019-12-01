import { Expression } from "./Expression";
import { toNode } from "./node";

export default function expression(a: number | symbol): Expression {
    return new Expression(toNode(a));
}
export * from "./Expression";
export * from "./ExpressionStack";
