import { SettingsForm } from "./components/SettingsForm";
import { Graph } from "./components/Graph";
import { useState } from "react";
export type GraphData = {
  nC: number;
  nB: number;
  nD: number;
  nR: number;
};
function App() {
  const [graphData, setGraphData] = useState<GraphData | undefined>(undefined);
  return (
    <main className="flex flex-col items-center space-y-10 py-10">
      <SettingsForm setGraphData={setGraphData} isUpdate={!!graphData} />
      {graphData && <Graph graphData={graphData} />}
    </main>
  );
}

export default App;
