import { GraphData } from "@/App";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface NodeData {
  id: string;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
}

interface NodeElement {
  data: NodeData;
  position: Position;
}

interface EdgeElement {
  data: EdgeData;
}

type Element = NodeElement | EdgeElement; // Use a union type to distinguish nodes from edges.

interface Position {
  x: number;
  y: number;
}


export function buildGraph(data: GraphData): Element[] {
  const { nC, nB, nD, nR } = data;
  const nP = nB;
  const nS = nB;
  const elements: Element[] = [];
  let y = 0;
  const levels = {
    "1": ["1"],
    C: Array.from({ length: nC }, (_, i) => `C${i + 1}`),
    B: Array.from({ length: nB }, (_, i) => `B${i + 1}`),
    P: Array.from({ length: nP }, (_, i) => `P${i + 1}`),
    S: Array.from({ length: nS }, (_, i) => `S${i + 1}`),
    D: Array.from({ length: nD }, (_, i) => `D${i + 1}`),
    R: Array.from({ length: nR }, (_, i) => `R${i + 1}`),
  };

  // Add nodes
  Object.keys(levels).forEach((level) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const nodes = levels[level];
    let x = (-100 * (nodes.length - 1)) / 2;
    nodes.forEach((node: unknown) => {
      elements.push({ data: { id: node }, position: { x, y } } as NodeElement);
      x += 100;
    });
    y += 100;
  });

  // Add edges
  addEdges(elements, levels);

  return elements;
}

function addEdges(elements: Element[], levels: Record<string, string[]>): void {
  // Connect '1' to each 'C_i'
  levels["C"].forEach((cNode) => {
    elements.push({
      data: {
        id: `edge-1-${cNode}`,
        source: "1",
        target: cNode,
      },
    } as EdgeElement);
  });

  // Connect each 'C_i' to each 'B_j', etc.
  connectNodes(elements, levels["C"], levels["B"]);
  connectPairwise(elements, levels["B"], levels["P"], levels["S"]);
  connectEveryToEvery(elements, levels["S"], levels["D"]);
  connectEveryToEvery(elements, levels["D"], levels["R"]);
}

function connectNodes(elements: Element[], sources: string[], targets: string[]): void {
  sources.forEach(source => {
    targets.forEach(target => {
      elements.push({
        data: {
          id: `edge-${source}-${target}`,
          source: source,
          target: target,
        },
      } as EdgeElement);
    });
  });
}

function connectPairwise(elements: Element[], sources: string[], midTargets: string[], finalTargets: string[]): void {
  sources.forEach((source, index) => {
    const midTarget = midTargets[index];
    const finalTarget = finalTargets[index];
    elements.push({
      data: {
        id: `edge-${source}-${midTarget}`,
        source: source,
        target: midTarget,
      },
    } as EdgeElement);
    elements.push({
      data: {
        id: `edge-${midTarget}-${finalTarget}`,
        source: midTarget,
        target: finalTarget,
      },
    } as EdgeElement);
  });
}

function connectEveryToEvery(elements: Element[], sources: string[], targets: string[]): void {
  sources.forEach(source => {
    targets.forEach(target => {
      elements.push({
        data: {
          id: `edge-${source}-${target}`,
          source: source,
          target: target,
        },
      } as EdgeElement);
    });
  });
}
