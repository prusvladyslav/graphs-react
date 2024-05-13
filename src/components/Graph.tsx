import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
export const Graph = () => {
  const cyRef = useRef(null);

  useEffect(() => {
    const cy = cytoscape({
      container: cyRef.current,
      elements: [
        {
          data: { id: "a" },
        },
        {
          data: { id: "b" },
        },
        {
          data: { id: "ab", source: "a", target: "b" },
        },
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "data(id)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
          },
        },
      ],
      layout: {
        name: "grid",
        rows: 1,
      },
    });

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div
      ref={cyRef}
     className="w-[600px] h-[600px] block"
    />
  );
};
