import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { EdgeData, GraphData } from "@/App";
import { EdgeDialog } from "./EdgeDialog";
import { buildGraph } from "@/lib/utils";

type Props = {
  graphData: GraphData;
  setEdgeData: Dispatch<SetStateAction<EdgeData>>;
};

export const Graph: React.FC<Props> = ({ graphData, setEdgeData }) => {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
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

    cy.on("tap", "edge", function (evt) {
      const edge = evt.target;
      setSelectedEdge(edge.id());
    });

    return () => {
      cy.destroy();
    };
  }, [graphData]);

  return (
    <div className="flex justify-center">
      <div ref={cyRef} className="w-[600px] h-[600px] block border" />
      {!!selectedEdge && (
        <EdgeDialog
          selectedEdge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          setEdgeData={setEdgeData}
        />
      )}
    </div>
  );
};
