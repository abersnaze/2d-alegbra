# 2D Algebra Typescript Module

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]

A library for programatically building up systems of equations for numerical analysis.  Feature that make this different:

* It uses Symbol objects to represent variables and can be evaluated with a dictionary of values. This prevents string collisions and allows for more complex expressions.
* It also supports taking the derivative of the expression with respect to a symbol.
* The library also supports matrices of expressions and can be used to build up systems of equations for linear algebra.
* The library is written in typescript and has no external dependencies.

## Technologies

Project is created with:

* Typescript version: 3.6.2
* Node version: 12.10.0
* No external dependencies

## Setup

To use this library

`npm install @abersnaze/algebra`
`yarn add @abersnaze/algebra`

Then in your code you can import and use the `expression(...)` function to fluently build expressions.

```js
import expression from "@abersnaze/algebra";

const m = 3; // slope
const b = 4; // point
const x = Symbol("x");
const y = Symbol(); // naming your symbols is optional
const line = expression(m).times(x).plus(b).eq(y);

const solution = {
  [x]: 7483,
  [y]: 22453,
};

const err = line.eval(solution);
// err === 0

const dxLine = line.derivative(x);
const xSlope = dxLine.eval(solution);
// xSlope === 0

const dyLine = line.derivative(y);
const ySlope = dyLine.eval(solution);
// ySlope === 0

const dx2Line = dxLine.derivative(x);
const xCup = dx2Line.eval(solution);
// xCup > 0

const dy2Line = dyLine.derivative(y);
const yCup = dx2Line.eval(solution);
// yCup > 0

// https://en.wikipedia.org/wiki/Second_partial_derivative_test
const dxdyLine = dxLine.derivative(y);
const hessianDet = dx2Line.times(dy2Line).minus(dxdyLine.squared());
const xySaddle = hessianDet.eval(solution);
// xySaddle === 0
```

## API

Creating a new `Expression` is a easy as starting it off with the first `symbol` or `number`.

```js
const one = expression(1).eval({})
```

From there you can use the following methods to additional complexity. All methods do not change the existing Expression but return a new Expression (AKA immutable). The `b` argument must be either a `symbol`, `number`, `Expression` or `Matrix`.

| Method       | Description                                          |
| ------------ | ---------------------------------------------------- |
| plus(b)      | add the top term to `b` and simplifies               |
| minus(b)     | equivalent to `plus(-b)`                             |
| times(b)     | multiplies the top term with b and simplifies        |
| dividedBy(b) | equivalent to `push(b).toThe(-1).times()`            |
| toThe(n)     | raises the top term by the `number` n.               |
| squared()    | equivalent to `toThe(2)`                             |
| sin()        | replaces the top term with the sine                  |
| cos()        | replaces the top term with the cossine               |
| tan()        | equivalent to `this.sin().push(this).cos().divide()` |
| eq(b)        | equivalent to `minus(b).squared()`                   |
| abs()        | replaces the top term with the absolution value      |

Once the expression is complete you can use the following methods

| Method                    | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| eval({[key:symbol]: number}) | fully evaluate the expression. throw error if not all of the symbols are defined.   |
| apply({[key:symbol]: Term})  | substitute one or more variables with different term and return the new expression. |
| derivative(symbol)        | compute the partial derivative with respect to one symbol.                          |
| toString()                | makes a ASCII art tree diagram of the expression tree.                              |

### Why no parentheses? `(` or `)`

At this point you've probably run into an expression where you only want to apply the next `times` or `squared` to only part of what comes before. For example the unit (of radius 1) circle one might mistakenly define it as:

```js
const r = 1;
const x = Symbol();
const y = Symbol();

// EXAMPLE OF HOW TO DO IT WRONG
const circle = expression(x)
  .squared() //   x^2
  .plus(y) //   x^2 + y
  .squared() //  (x^2 + y)^2
  .eq(r) //  (x^2 + y)^2 - r)^2
  .squared(); // ((x^2 + y)^2 - r)^2)^2
```

Would produce `((x^2 + y)^2 - r)^2)^2`. When I would have expected `(x^2 + y^2 - r^2)^2`. Notice how in the wrong expression each application of the `squared()` applied to the whole of expression defined up to that point. To fix this I'll introduce the `push(b)` method that starts a new mini expression separate from what has been defined so far. When `push` is used new zero argument versions of `plus()`, `minus()`, `times()`, `divide()`, and `eq()` are available to cause the two mini expressions to be merged into one again.

The corrected code now looks like:

```js
const circle = expression(x)
  .squared() //  x^2
  .push(y) //  x^2 | y   <---- y here is separate from x^2
  .squared() //  x^2 | y^2 <---- now that y is squared on its own
  .plus() //  x^2 + y^2 <---- merge y^2 by adding it to x^2
  .push(r) //  x^2 + y^2 | r
  .squared() //  x^2 + y^2 | r^2
  .eq(); // (x^2 + y^2 - r^2)^2
```

### Matrices

Matrices of expressions are also supported. The first call to `matrix()` creates a row matrix and subsequent calls creates a new matrix with additional row.

```js
const M = matrix(1, 2, 3);
const N = M(4, 5, 6);

M !== N;
M.toString() === "[1, 2, 3]";
N.toString() === "[1, 2, 3; 4, 5, 6]";
```

Once the matrix is built to your needs you can chain following methods.

| Method       | Description                                  |
| ------------ | -------------------------------------------- |
| plus(b)      | adds `b` to all elements                     |
| minus(b)     | subtracts `b` from all elements              |
| times(b)     | multiplies `b` (scalar) to all elements      |
| times(b)     | multiplies `b` (matrix) dot product          |
| dividedBy(b) | divides all elements by `b` (scalar)         |
| dividedBy(b) | equivalent to `.times(b.inverse())` (matrix) |
| inverse()    | if possible returns the inverse matrix       |
| eq(b)        | equivalent to `minus(b).squared()` (scalar)  |

```js
const theta = Symbol("Θ");
const x = Symbol("x");
const y = Symbol("y");

// 2D translate
const translate = matrix(1, 0, x)(0, 1, y)(0, 0, 1);

// 2D rotation
const rotate = matrix(cos(theta), sin(theta).times(-1), 0)(
  sin(theta),
  cos(theta),
  0
)(0, 0, 1);

// take the inverse of the translation to get the shape to the origin
// https://en.wikipedia.org/wiki/Matrix_similarity

// 2D rotation around arbitrary point
// 1) move to origin
// 2) rotate around origin
// 3) move back
const output = translate.times(rotate).dividedBy(translate);

// output =
//   [cos(Θ), -sin(Θ),  x*cos(Θ) - y*sin(Θ) + x;
//    sin(Θ),  cos(Θ), -x*sin(Θ) - y*cos(Θ) + y;
//         0,       0,                        1]
```

## Contributing

To submit changes to the project

1. fork and clone the git repository
2. make changes to the tests and source.
   * If making changes to the `Expression` class make sure matching changes are made to `ExpressionStack`.
   * Changes to simplification logic can be quite tricky with all the symbiotic recursion.
3. run `yarn test`. if they fail goto step 2
4. push changes to your fork
5. submit pull request

### Other ussful commands

* `yarn compile`: compile the typescript code to POJS
* `yarn test`: run unit tests once.
* `yarn watch`: continuously run unit tests.

<!-- Markdown link & img dfn's -->

[npm-image]: https://img.shields.io/npm/v/2d-algebra.svg?style=flat-square
[npm-url]: https://npmjs.org/package/2d-algebra
[npm-downloads]: https://img.shields.io/npm/dm/2d-algebra.svg?style=flat-square
