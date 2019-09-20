import { Expression, Term, toNode } from "./Expression";
import { add, cos, eq, INode, mult, pow, sin, sub, tan } from "./tree/INode";

export class ExpressionStack<N extends ExpressionStack<any> | Expression> {
    constructor(readonly a: N, readonly b: INode) { }

    public plus(): N;
    public plus(c: Term): ExpressionStack<N>;
    public plus(c?: Term): N | ExpressionStack<N> {
        if (c !== undefined) {
            return new ExpressionStack<N>(this.a, add(this.b, toNode(c)));
        }
        if (this.a instanceof ExpressionStack) {
            return new ExpressionStack<N>(this.a.a, add(this.a.b, this.b)) as N;
        }
        return new Expression(add(this.a.a, this.b)) as N;
    }

    public minus(): N;
    public minus(c: Term): ExpressionStack<N>;
    public minus(c?: Term): N | ExpressionStack<N> {
        if (c !== undefined) {
            return new ExpressionStack<N>(this.a, sub(this.b, toNode(c)));
        }
        if (this.a instanceof ExpressionStack) {
            return new ExpressionStack<N>(this.a.a, sub(this.a.b, this.b)) as N;
        }
        return new Expression(sub(this.a.a, this.b)) as N;
    }

    public times(): N;
    public times(c: Term): ExpressionStack<N>;
    public times(c?: Term): N | ExpressionStack<N> {
        if (c !== undefined) {
            return new ExpressionStack<N>(this.a, mult(this.b, toNode(c)));
        }
        if (this.a instanceof ExpressionStack) {
            return new ExpressionStack<N>(this.a.a, mult(this.a.b, this.b)) as N;
        }
        return new Expression(mult(this.a.a, this.b)) as N;
    }

    public divide(): N {
        if (this.a instanceof ExpressionStack) {
            return new ExpressionStack<N>(this.a.a, mult(this.a.b, this.b)) as N;
        }
        return new Expression(mult(this.a.a, this.b)) as N;
    }

    public dividedBy(c: Term): ExpressionStack<N> {
        return new ExpressionStack<N>(this.a, mult(this.b, toNode(c)));
    }

    public eq(): N;
    public eq(c: Term): ExpressionStack<N>;
    public eq(c?: Term): N | ExpressionStack<N> {
        if (c !== undefined) {
            return new ExpressionStack<N>(this.a, eq(this.b, toNode(c)));
        }
        if (this.a instanceof ExpressionStack) {
            return new ExpressionStack<N>(this.a.a, eq(this.a.b, this.b)) as N;
        }
        return new Expression(eq(this.a.a, this.b)) as N;
    }

    public squared(): ExpressionStack<N> {
        return this.toThe(2);
    }

    public toThe(c: number): ExpressionStack<N> {
        return new ExpressionStack<N>(this.a, pow(this.b, c));
    }

    public sin(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.a, sin(this.b));
    }

    public cos(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.a, cos(this.b));
    }

    public tan(): ExpressionStack<N> {
        return new ExpressionStack<N>(this.a, tan(this.b));
    }

    public push(b: Term): ExpressionStack<ExpressionStack<N>> {
        return new ExpressionStack<ExpressionStack<N>>(this, toNode(b));
    }
}
