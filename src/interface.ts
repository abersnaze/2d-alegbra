export type Identifier = symbol | string
export type Term = number | Identifier | IExpression
export type Assignments = Map<Identifier, number>
export type Substitutions = Map<Identifier, Term>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IExpressionStack<N extends IExpressionStack<any> | IExpression> {
  plus(): N
  plus(c: Term): IExpressionStack<N>
  minus(): N
  minus(c: Term): IExpressionStack<N>
  times(): N
  times(c: Term): IExpressionStack<N>
  divide(): N
  dividedBy(c: Term): IExpressionStack<N>
  eq(): N
  eq(c: Term): IExpressionStack<N>
  squared(): IExpressionStack<N>
  toThe(c: Term): IExpressionStack<N>
  abs(): IExpressionStack<N>
  abs(b: Term): IExpressionStack<IExpressionStack<N>>
  sin(): IExpressionStack<N>
  sin(b: Term): IExpressionStack<IExpressionStack<N>>
  cos(): IExpressionStack<N>
  cos(b: Term): IExpressionStack<IExpressionStack<N>>
  tan(): IExpressionStack<N>
  tan(b: Term): IExpressionStack<IExpressionStack<N>>
  push(b: Term): IExpressionStack<IExpressionStack<N>>
  toString(): string
}

export interface IExpression {
  plus(b: Term): IExpression
  minus(b: Term): IExpression
  times(b: Term): IExpression
  dividedBy(b: Term): IExpression
  squared(): IExpression
  toThe(n: Term): IExpression
  abs(): IExpression
  abs(b: Term): IExpressionStack<IExpression>
  sin(): IExpression
  sin(b: Term): IExpressionStack<IExpression>
  cos(): IExpression
  cos(b: Term): IExpressionStack<IExpression>
  tan(): IExpression
  tan(b: Term): IExpressionStack<IExpression>
  eq(b: Term): IExpression
  push(b: Term): IExpressionStack<IExpression>
  toString(): string
  derivative(withRespectTo: Identifier): IExpression
  eval(subs: Assignments): number
  apply(subs: Substitutions): IExpression
}

export interface IMatrix {
  addRow(...row: Term[]): IMatrix
  plus(b: IMatrix): IMatrix
  minus(b: IMatrix): IMatrix
  times(b: Term): IMatrix
  times(b: IMatrix): IMatrix
  inverse(): IMatrix
  dividedBy(b: Term): IMatrix
  dividedBy(b: IMatrix): IMatrix
  eq(b: IMatrix): IMatrix
  toString(): string
  eval(subs: Assignments): number[][]
  apply(subs: Substitutions): IMatrix
}

export interface INode {
  apply(subs: Map<Identifier, INode>): INode
  derivative(withRespectTo: Identifier): INode
  print(): string
}
