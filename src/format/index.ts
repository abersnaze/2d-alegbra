import { INode } from "../node";

export interface Format {
    binary(indent: string, op: string, a: INode, b: INode | string): string;
    func(indent: string, func: string, arg: INode): string;
}