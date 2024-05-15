import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cytoscape from "cytoscape";
import { EdgeData, GraphData, NodeData } from "@/App";
import { EdgeDialog, NodeDialog } from "./dialogs";
import { buildGraph } from "@/lib/utils";

const edgeDefaultValue = { alpha: "0.8", c: "f^2", z: "f^3", r: "log(f+1)" };
const nodeDefaultValue = {
  "lambda+": "0",
  "lambda-": "100",
  P_min: "0",
  P_max: "5",
};

type EdgeObject = {
  [key: string]: typeof edgeDefaultValue;
};

type NodeObject = {
  [key: string]: typeof nodeDefaultValue;
};

type Props = {
  graphData: GraphData;
  setEdgeData: Dispatch<SetStateAction<EdgeData>>;
  edgeData: EdgeData;
  nodeData: NodeData;
  setNodeData: Dispatch<SetStateAction<NodeData>>;
};

export const Graph: React.FC<Props> = ({
  graphData,
  setEdgeData,
  edgeData,
  nodeData,
  setNodeData,
}) => {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const cyRef = useRef(null);

  const graph = useMemo(() => buildGraph(graphData), [graphData]);

  const edges: EdgeObject = useMemo(
    () =>
      graph.reduce((acc: EdgeObject, item) => {
        if (item.data.id.includes("edge")) {
          acc[item.data.id.split("edge-")[1]] = edgeDefaultValue;
        }
        return acc;
      }, {}),
    [graph]
  );

  const nodes: NodeObject = useMemo(
    () =>
      graph.reduce((acc: NodeObject, item) => {
        if (item.data.id.includes("R") && !item.data.id.includes("edge")) {
          acc[item.data.id] = nodeDefaultValue;
        }
        return acc;
      }, {}),
    [graph]
  );

  useEffect(() => {
    setEdgeData(edges);

    setNodeData(nodes);

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
      elements: graph,
    });

    cy.on("tap", "edge", function (evt) {
      const edge = evt.target;
      setSelectedEdge(edge.id().split("edge-")[1]);
    });

    cy.on("tap", "node", function (evt) {
      const node = evt.target;
      if (node.id().startsWith("R")) {
        setSelectedNode(node.id());
      }
    });

    return () => {
      cy.destroy();
    };
  }, [graph]);

  return (
    <div className="flex justify-center">
      <div ref={cyRef} className="w-[600px] h-[600px] block border" />
      {!!selectedEdge && (
        <EdgeDialog
          selectedEdge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          setEdgeData={setEdgeData}
          defaultValue={edgeData[selectedEdge]}
        />
      )}
      {!!selectedNode && (
        <NodeDialog
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          setNodeData={setNodeData}
          defaultValue={nodeData[selectedNode]}
        />
      )}
    </div>
  );
};
