import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import { GraphData } from "@/App";

interface NodeData {
  id: string;
}

interface Position {
  x: number;
  y: number;
}

interface Element {
  data: NodeData;
  position: Position;
}

function buildGraph(data: GraphData): Element[] {
  const { nC, nB, nD, nR } = data;
  const nP = nB;
  const nS = nB;
  // Assuming P and S have the same counts as B
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
    const nodes = levels[level];
    let x = (-100 * (nodes.length - 1)) / 2;
    nodes.forEach((node) => {
      elements.push({ data: { id: node }, position: { x: x, y: y } });
      x += 100;
    });
    y += 100;
  });

  // Connect '1' to each 'C_i'
  levels["C"].forEach((cNode) => {
    elements.push({
      data: {
        id: `edge-1-${cNode}`,
        source: "1",
        target: cNode,
      },
    });
  });

  // Connect each 'C_i' to each 'B_j'
  levels["C"].forEach((cNode) => {
    levels["B"].forEach((bNode) => {
      elements.push({
        data: {
          id: `edge-${cNode}-${bNode}`,
          source: cNode,
          target: bNode,
        },
      });
    });
  });

  // Connect each 'B_j' to 'P_j', and 'P_j' to 'S_j'
  levels["B"].forEach((bNode, index) => {
    const pNode = levels["P"][index];
    const sNode = levels["S"][index];
    elements.push({
      data: {
        id: `edge-${bNode}-${pNode}`,
        source: bNode,
        target: pNode,
      },
    });
    elements.push({
      data: {
        id: `edge-${pNode}-${sNode}`,
        source: pNode,
        target: sNode,
      },
    });
  });

  // Connect each 'S_j' to every 'D_k'
  levels["S"].forEach((sNode) => {
    levels["D"].forEach((dNode) => {
      elements.push({
        data: {
          id: `edge-${sNode}-${dNode}`,
          source: sNode,
          target: dNode,
        },
      });
    });
  });

  // Connect each 'D_k' to every 'R_m'
  levels["D"].forEach((dNode) => {
    levels["R"].forEach((rNode) => {
      elements.push({
        data: {
          id: `edge-${dNode}-${rNode}`,
          source: dNode,
          target: rNode,
        },
      });
    });
  });

  return elements;
}

type Props = {
  graphData: GraphData;
};

export const Graph: React.FC<Props> = ({ graphData }) => {
  const cyRef = useRef(null);

  useEffect(() => {
    const cy = cytoscape({
      container: cyRef.current,
      layout: {
        name: "preset",
      },

      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "data(id)",
            "text-valign": "center",
            color: "white",
            "text-outline-width": 2,
            "text-outline-color": "#666",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#ccc",
          },
        },
        {
          selector: 'node[id ^= "R"]',
          style: {
            "background-color": "#0074D9",
          },
        },
      ],

      elements: buildGraph(graphData),
    });

    return () => {
      cy.destroy();
    };
  }, [graphData]);

  return (
    <div className="flex justify-center">
      <div ref={cyRef} className="w-[600px] h-[600px] block border" />
    </div>
  );
};
