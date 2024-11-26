import { Interval } from "../interface";


export enum UpDown {
    UP,
    DOWN
}

export function toInterval(a: number, direction: UpDown = UpDown.UP): Interval {
    if (a === 0) {
        return [0, Number.MIN_VALUE];
    }
    if (a === -0) {
        return [-Number.MIN_VALUE, 0];
    }
    if (a === Number.POSITIVE_INFINITY) {
        return [Number.MAX_VALUE, Number.POSITIVE_INFINITY];
    }
    if (a === Number.NEGATIVE_INFINITY) {
        return [Number.NEGATIVE_INFINITY, -Number.MAX_VALUE];
    }
    if (Number.isNaN(a)) {
        return [Number.NaN, Number.NaN];
    }
    if (Number.isSafeInteger(a)) {
        return [a, a];
    }
    if (direction === UpDown.UP) {
        return [a, next(a, Number.POSITIVE_INFINITY)];
    } else {
        return [next(a, Number.NEGATIVE_INFINITY), a];
    }
}

const BUFFER = new ArrayBuffer(8);
const FBUF = new Float64Array(BUFFER);
const IBUF = new BigUint64Array(BUFFER);

export function next(start: number, direction: number): number {
    // compute the next representable number
    if (start > direction) {
        // descending
        if (start !== 0) {
            FBUF[0] = start;
            const transducer = IBUF[0];
            IBUF[0] = transducer + (transducer > 0n ? -1n : 1n);
            return FBUF[0];
        } else {
            // start == 0.0d && direction < 0.0d
            return -Number.MIN_VALUE;
        }
    } else if (start < direction) {
        // ascending
        // Add +0.0 to get rid of a -0.0 (+0.0 + -0.0 => +0.0)
        // then bitwise convert start to integer.
        FBUF[0] = start + 0;
        const transducer = IBUF[0];
        IBUF[0] = transducer + (transducer >= 0n ? 1n : -1n);
        return FBUF[0];
    } else if (start == direction) {
        return direction;
    } else {
        // isNaN(start) || isNaN(direction)
        return start + direction;
    }
}

export function iadd(a: Interval, b: Interval): Interval {
    return [
        a[0] + b[0],
        a[1] + b[1]
    ];
}

export function isub(a: Interval, b: Interval): Interval {
    return [
        a[0] - b[1],
        a[1] - b[0]
    ];
}

export function imult(a: Interval, b: Interval): Interval {
    const p = [
        a[0] * b[0],
        a[0] * b[1],
        a[1] * b[0],
        a[1] * b[1]
    ];
    return [
        Math.min(...p),
        Math.max(...p)
    ];
}

export function idiv(a: Interval, b: Interval): Interval {
    if (b[0] <= 0 && b[1] >= 0) {
        return [-Infinity, Infinity];
    }
    return imult(a, [1 / b[1], 1 / b[0]]);
}
