import { INode } from "../interface";
import { Rule, rules } from "./rules";

export type Groups = { [key: Symbol]: INode }


export function* mergeMatches(
  from: INode,
  commutative: boolean,
  aNode: INode,
  aPattern: INode,
  bNode: INode,
  bPattern: INode,
  to: (a: INode) => INode
): Generator<Match> {
  if (commutative) {
    // if commutative run once with the patterns swapped
    yield* mergeMatches(from, false, aNode, bPattern, bNode, aPattern, to);
  }
  // about to cache the result of a match. guessing that
  // the complexity of the pattern means that it'll be less
  // likely to match. less matches means less caching.
  if (aPattern.complexity() < bPattern.complexity()) {
    [aNode, aPattern, bNode, bPattern] = [bNode, bPattern, aNode, aPattern];
  }
  const aMatches = [...aNode.match(aPattern)];
  let bMatches;
  for (const aMatch of aMatches) {
    if (!bMatches) {
      bMatches = [...bNode.match(bPattern)];
    }
    nextb: for (const bMatch of bMatches) {
      for (const key of Object.getOwnPropertySymbols(aMatch.groups)) {
        const aValue = aMatch.groups[key] as INode;
        const bValue = bMatch.groups[key] as INode;
        if (bValue !== undefined && !aValue.equals(bValue)) {
          continue nextb;
        }
      }
      yield new Match({ ...aMatch.groups, ...bMatch.groups }, from, to);
    }
  }
}

/**
 * min heap priority queue used for picking the best chance to
 * produce an optimal equation.
 */
class PriorityQueue<T> {
  heap: [number, T][];

  constructor(readonly score: (t: T) => number) {
    this.heap = [];
  }

  enqueue(element: T): void {
    // put the new element at the bottom
    let i = this.heap.push([this.score(element), element]) - 1;
    // bubble up
    while (i > 0) {
      const p = (i - 1) >> 1;
      // if the parent's score is greater than current's score
      if (this.heap[p][0] > this.heap[i][0]) {
        // swap
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
        continue;
      } else {
        break;
      }
    }
  }

  dequeue(): T {
    if (this.heap.length === 0) {
      return undefined;
    }
    if (this.heap.length === 1) {
      return this.heap.pop()[1];
    }
    const element = this.heap[0];
    // move the last element to the top of the heap
    this.heap[0] = this.heap.pop();

    // bubble down
    let i = 0;
    for (; ;) {
      const l = i << (1 + 1);
      const r = i << (1 + 2);
      if (l < this.heap.length && this.heap[i][0] > this.heap[l][0]) {
        // swap left
        [this.heap[l], this.heap[i]] = [this.heap[i], this.heap[l]];
        i = l;
        continue;
      } else if (r < this.heap.length && this.heap[i][0] > this.heap[r][0]) {
        // swap right
        [this.heap[r], this.heap[i]] = [this.heap[i], this.heap[r]];
        i = r;
        continue;
      } else {
        break;
      }
    }
    return element[1];
  }

  get isNotEmpty() {
    return this.heap.length > 0;
  }
}

/**
 * a hash set with one operation.
 */
class HashSet<T extends { hashcode(): number; equals(other: T): boolean }> {
  table: { [key: number]: T[] } = {};

  /**
   * @param element the element to add if it isn't already in the set
   * @returns
   */
  add(element: T): boolean {
    const hash = element.hashcode();
    if (this.table[hash] === undefined) {
      this.table[hash] = [];
    }
    for (const existing of this.table[hash]) {
      if (element.equals(existing)) return false;
    }
    this.table[hash].push(element);
    return true;
  }

  toString(): string {
    let str = "";
    for (const hash of Object.keys(this.table)) {
      let prefex = "+";
      for (const ex of this.table[hash]) {
        str += prefex + " " + ex.toString() + "\n";
        prefex = "-";
      }
    }
    return str;
  }
}

export function simplify(node: INode, timeout = 500): INode {
  return simplifyRules(node, Object.values(rules()), timeout);
}

class Step {
  readonly score: number;
  constructor(
    readonly node: INode,
    readonly parent: Step,
    readonly rule: Rule,
    readonly match: Match
  ) {
    this.score = this.node.complexity();
  }
  hashcode() {
    return this.node.hashcode();
  }
  equals(that: Step) {
    return this.node.equals(that.node);
  }
  toString(): string {
    return this.node.toString() + " " + this.score;
  }
}

export function simplifyRules(
  node: INode,
  ruleSet: Rule[],
  timeout = 2000
): INode {
  const todo = new PriorityQueue<Step>((n) => n.score);
  const seen = new HashSet<Step>();
  const start_time = new Date().getTime();

  let best: Step = new Step(node, undefined, undefined, undefined);
  seen.add(best);
  todo.enqueue(best);

  while (todo.isNotEmpty) {
    // only look for a limited amount of time
    // const curr_time = new Date().getTime();
    // if (curr_time - start_time > timeout) {
    //   throw new Error("took too long");
    // }

    const from_step = todo.dequeue();

    // keep track of the least complex equation
    if (from_step.score < best.score) {
      best = from_step;
    }

    for (const rule of ruleSet) {
      let count = 0;
      for (const match of from_step.node.search(rule.from.a)) {
        count++;

        // apply the rule
        let sub_node;
        try {
          sub_node = rule.to(match.groups);
        } catch (err) {
          // eslint-disable-next-line no-debugger
          debugger;
          continue;
        }
        let to_node = undefined;

        if (sub_node) {
          to_node = match.wrap(sub_node);
          const to_step = new Step(to_node, from_step, rule, match);

          // if we haven't seen this expression add it to the list to check
          if (seen.add(to_step)) {
            todo.enqueue(to_step);
          }
        }

        // make it easier to debug a particular rule matched.
        if (rule.debug) {
          rule.debug(from_step.node, rule.from.a, match.groups, to_node);
        }
      }

      // this enables debugging why a rule didn't match
      if (count === 0 && rule.debug) {
        rule.debug(from_step.node, rule.from.a, undefined, undefined);
      }
    }
  }

  return best.node.sorted();
}
