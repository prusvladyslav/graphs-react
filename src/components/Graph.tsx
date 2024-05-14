import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cytoscape from "cytoscape";
import { EdgeData, GraphData } from "@/App";
import { EdgeDialog } from "./EdgeDialog";
import { buildGraph } from "@/lib/utils";

type Props = {
  graphData: GraphData;
  setEdgeData: Dispatch<SetStateAction<EdgeData>>;
  edgeData: EdgeData;
};

const edgeDefaultValue = {
  c: "f**2+11*f",
  z: "0",
  r: "0",
  alpha: 1,
};

type EdgeObject = {
  [key: string]: typeof edgeDefaultValue;
};

export const Graph: React.FC<Props> = ({
  graphData,
  setEdgeData,
  edgeData,
}) => {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const cyRef = useRef(null);

  const graph = useMemo(() => buildGraph(graphData), [graphData]);

  const edges: EdgeObject = graph.reduce((acc: EdgeObject, item) => {
    if (item.data.id.includes("edge")) {
      acc[item.data.id.split("edge-")[1]] = edgeDefaultValue;
    }
    return acc;
  }, {});

  useEffect(() => {
    setEdgeData(edges);

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
    </div>
  );
};
