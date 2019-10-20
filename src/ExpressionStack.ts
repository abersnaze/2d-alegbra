import { Expression } from "./Expression";
import { add, cos, div, eq, INode, mult, pow, sin, sub, tan, toNode } from "./tree/index";

type Term = number | symbol | Expression;

function stack<N extends ExpressionStack<any> | Expression>(op, parent: N, b: INode, c?: Term) {
    if (c !== undefined) {
        return new ExpressionStack<N>(parent, op(b, toNode(c)));
    }
    if (parent instanceof ExpressionStack) {
        return new ExpressionStack<N>(parent.parent, op(parent.b, b)) as N;
    } else {
        return new Expression(op((parent as Expression).a, b)) as N;
    }
}

export class ExpressionStack<N extends ExpressionStack<any> | Expression> {
    constructor(readonly parent: N, readonly b: INode) { }

    public plus(): N;
    public plus(c: Term): ExpressionStack<N>;
    public plus(c?: Term): N | ExpressionStack<N> {
        return stack(add, this.parent, this.b, c);
    }

    public minus(): N;
    public minus(c: Term): ExpressionStack<N>;
    public minus(c?: Term): N | ExpressionStack<N> {
        return stack(sub, this.parent, this.b, c);
    }

    public times(): N;
    public times(c: Term): ExpressionStack<N>;
    public times(c?: Term): N | ExpressionStack<N> {
        return stack(mult, this.parent, this.b, c);
    }

    public divide(): N {
        return stack(div, this.parent, this.b, undefined) as N;
    }

    public dividedBy(c: Term): ExpressionStack<N> {
        return stack(div, this.parent, this.b, c) as ExpressionStack<N>;
    }

    public eq(): N;
    public eq(c: Term): ExpressionStack<N>;
    public eq(c?: Term): N | ExpressionStack<N> {
        return stack(eq, this.parent, this.b, c);
    }

    public squared(): ExpressionStack<N> {
        return this.toThe(2);
    }

    public toThe(c: number): ExpressionStack<N> {
        return stack(pow, this.parent, this.b, c) as ExpressionStack<N>;
    }

    public sin(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.parent, sin(this.b));
    }

    public cos(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.parent, cos(this.b));
    }

    public tan(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.parent, tan(this.b));
    }

    public push(b: Term): ExpressionStack<ExpressionStack<N>> {
        return new ExpressionStack<ExpressionStack<N>>(this, toNode(b));
    }
}
