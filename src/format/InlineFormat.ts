import { Format } from ".";
import { INode } from "../node";

export class InlineFormat implements Format {
    precedence = ['^', '*', '+']

    binary(indent: string, op: string, a: INode, b: INode): string {
        const opPrec = this.precedence.indexOf(op);
        let aStr = a.toString("", this);
        if (this.precedence.indexOf(a.op()) > opPrec) {
            aStr = "(" + aStr + ")";
        }
        let bStr = b.toString("", this);
        if (this.precedence.indexOf(b.op()) > opPrec) {
            bStr = "(" + bStr + ")";
        }
        // because it looks better with spaces between terms
        if (op === "+") {
            op = " + ";
        }
        return aStr + op + bStr;
    }

    func(indent: string, func: string, arg: INode): string {
        return func + "(" + arg.toString("", this) + ")";
    }
}