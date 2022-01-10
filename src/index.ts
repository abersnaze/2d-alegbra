import { Expression } from "./Expression";
import { Identifier, toNode } from "./node";

export default function expression(a: number | Identifier): Expression {
    return new Expression(toNode(a));
}
export * from "./Expression";
export * from "./ExpressionStack";
