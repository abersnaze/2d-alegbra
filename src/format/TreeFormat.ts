import { Format } from ".";
import { INode } from "../node";

export class TreeFormat implements Format {
    binary(indent: string, op: string, a: INode, b: INode): string {
        return op +
            "\n" + indent + "├ " + a.toString(indent + "│ ", this) +
            "\n" + indent + "└ " + b.toString(indent + "  ", this);
    }

    func(indent: string, func: string, arg: INode): string {
        return func + "\n" + indent + "└ " + arg.toString(indent + "  ", this);
    }
}