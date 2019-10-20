import { add, degreeComparator, mult, pow, variable } from "../src/tree";

test("cmp unnamed", () => {
    const [a, b, c] = [variable(), variable(), variable()];

    expect(degreeComparator(a, b)).toBe(1);
    expect(degreeComparator(b, c)).toBe(1);
    expect(degreeComparator(a, c)).toBe(1);
    expect(degreeComparator(c, b)).toBe(-1);
    expect(degreeComparator(b, a)).toBe(-1);
    expect(degreeComparator(c, a)).toBe(-1);
    expect(degreeComparator(c, c)).toBe(0);
    expect(degreeComparator(b, b)).toBe(0);
    expect(degreeComparator(a, a)).toBe(0);
});

test("cmp named", () => {
    const [a, b, c] = [variable(Symbol("a")), variable(Symbol("b")), variable(Symbol("c"))];

    expect(degreeComparator(a, b)).toBe(1);
    expect(degreeComparator(b, c)).toBe(1);
    expect(degreeComparator(a, c)).toBe(1);
    expect(degreeComparator(c, b)).toBe(-1);
    expect(degreeComparator(b, a)).toBe(-1);
    expect(degreeComparator(c, a)).toBe(-1);
    expect(degreeComparator(c, c)).toBe(0);
    expect(degreeComparator(b, b)).toBe(0);
    expect(degreeComparator(a, a)).toBe(0);
});

test("cmp mult", () => {
    const [a, b] = [variable(Symbol("a")), variable(Symbol("b"))];

    expect(degreeComparator(pow(a, 2), mult(a, a))).toBe(0);
    expect(degreeComparator(mult(a, b), mult(b, a))).toBe(0);
});

test("cmp add", () => {
    const [a, b] = [variable(Symbol("a")), variable(Symbol("b"))];

    expect(degreeComparator(mult(a, b), add(a, b))).toBe(1);
    expect(degreeComparator(add(a, b), add(a, b))).toBe(-1);
    expect(degreeComparator(add(a, b), add(a, b))).toBe(-1);
});
