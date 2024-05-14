import { SettingsForm } from "./components/SettingsForm";
import { Graph } from "./components/Graph";
import { useState } from "react";

export type GraphData = {
  nC: number;
  nB: number;
  nD: number;
  nR: number;
};

export type EdgeData = Record<
  string,
  { c: string; z: string; r: string; alpha: number }
>;
export type NodeData = Record<
  string,
  {
    "lambda+": string;
    "lambda-": string;
    P_min: string;
    P_max: string;
  }
>;
function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [edgeData, setEdgeData] = useState<EdgeData>({});
  const [nodeData, setNodeData] = useState<NodeData>({});

  return (
    <main className="flex flex-col items-center space-y-10 py-10">
      <SettingsForm setGraphData={setGraphData} isUpdate={!!graphData} />
      {graphData && (
        <Graph
          graphData={graphData}
          setEdgeData={setEdgeData}
          edgeData={edgeData}
          nodeData={nodeData}
          setNodeData={setNodeData}
        />
      )}
    </main>
  );
}

export default App;
