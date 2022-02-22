export type Identifier = symbol | string
export type Term = number | Identifier | IExpression
export type Assignments = Map<Identifier, number>
export type Substitutions = Map<Identifier, Term>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IStack<N extends IStack<any> | IExpression> {
  plus(): N
  plus(c: Term): IStack<N>
  minus(): N
  minus(c: Term): IStack<N>
  times(): N
  times(c: Term): IStack<N>
  divide(): N
  dividedBy(c: Term): IStack<N>
  eq(): N
  eq(c: Term): IStack<N>
  squared(): IStack<N>
  toThe(c: Term): IStack<N>
  abs(): IStack<N>
  abs(b: Term): IStack<IStack<N>>
  sin(): IStack<N>
  sin(b: Term): IStack<IStack<N>>
  cos(): IStack<N>
  cos(b: Term): IStack<IStack<N>>
  tan(): IStack<N>
  tan(b: Term): IStack<IStack<N>>
  push(b: Term): IStack<IStack<N>>
  toString(): string
}

export interface IExpression {
  plus(b: Term): IExpression
  minus(b: Term): IExpression
  times(b: Term): IExpression
  dividedBy(b: Term): IExpression
  squared(): IExpression
  toThe(n: Term): IExpression
  log(): IExpression
  abs(): IExpression
  abs(b: Term): IStack<IExpression>
  sin(): IExpression
  sin(b: Term): IStack<IExpression>
  cos(): IExpression
  cos(b: Term): IStack<IExpression>
  tan(): IExpression
  tan(b: Term): IStack<IExpression>
  eq(b: Term): IExpression
  push(b: Term): IStack<IExpression>
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
