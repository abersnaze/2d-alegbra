import 'mocha';
import { expect } from 'chai';
import { add, degreeComparator, mult, pow, variable } from "../src/node";

describe("Degree Comparator", () => {
    it("cmp unnamed", () => {
        const [a, b, c] = [variable(), variable(), variable()];

        expect(degreeComparator(a, b)).to.equal(1);
        expect(degreeComparator(b, c)).to.equal(1);
        expect(degreeComparator(a, c)).to.equal(1);
        expect(degreeComparator(c, b)).to.equal(-1);
        expect(degreeComparator(b, a)).to.equal(-1);
        expect(degreeComparator(c, a)).to.equal(-1);
        expect(degreeComparator(c, c)).to.equal(0);
        expect(degreeComparator(b, b)).to.equal(0);
        expect(degreeComparator(a, a)).to.equal(0);
    });

    it("cmp named", () => {
        const [a, b, c] = [variable(Symbol("a")), variable(Symbol("b")), variable(Symbol("c"))];

        expect(degreeComparator(a, b)).to.equal(1);
        expect(degreeComparator(b, c)).to.equal(1);
        expect(degreeComparator(a, c)).to.equal(1);
        expect(degreeComparator(c, b)).to.equal(-1);
        expect(degreeComparator(b, a)).to.equal(-1);
        expect(degreeComparator(c, a)).to.equal(-1);
        expect(degreeComparator(c, c)).to.equal(0);
        expect(degreeComparator(b, b)).to.equal(0);
        expect(degreeComparator(a, a)).to.equal(0);
    });

    it("cmp mult", () => {
        const [a, b] = [variable(Symbol("a")), variable(Symbol("b"))];

        expect(degreeComparator(pow(a, 2), mult(a, a))).to.equal(0);
        expect(degreeComparator(mult(a, b), mult(b, a))).to.equal(0);
    });

    it("cmp add", () => {
        const [a, b] = [variable(Symbol("a")), variable(Symbol("b"))];

        expect(degreeComparator(mult(a, b), add(a, b))).to.equal(1);
        expect(degreeComparator(add(a, b), add(a, b))).to.equal(-1);
        expect(degreeComparator(add(a, b), add(a, b))).to.equal(-1);
    });
});