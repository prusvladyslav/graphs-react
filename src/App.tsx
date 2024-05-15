import { SettingsForm } from "./components/SettingsForm";
import { Graph } from "./components/Graph";
import { useEffect, useState } from "react";
import { SolutionForm } from "./components/SolutionForm";
import Solver from "../src/lib/solver";
import { Label } from "./components/ui/label";
import { methodOptions } from "./const";

export type GraphData = {
  nC: number;
  nB: number;
  nD: number;
  nR: number;
  theta: number;
};

export type EdgeData = Record<
  string,
  { c: string; z: string; r: string; alpha: string }
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

export type SolutionData = {
  c_min: number;
  c_max: number;
  lambda: number;
  epsilon: number;
  solutionMethod: string;
};

type Answer = {
  solution: string;
  iterations: string;
  timeTaken: string;
  solutionMethod: string;
}[];

function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [edgeData, setEdgeData] = useState<EdgeData>({});

  const [nodeData, setNodeData] = useState<NodeData>({});

  const [solutionData, setSolutionData] = useState<SolutionData | null>(null);

  const [answers, setAnswers] = useState<Answer | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function optimizeNetwork(solver: any, method: string) {
      try {
        const C = [solutionData?.c_min, solutionData?.c_max];
        const initialX = 0.1;
        const lambdaK = solutionData?.lambda;
        const epsilon = solutionData?.epsilon;
        const [solution, iterations, timeTaken] = await solver.solve(
          method,
          C,
          initialX,
          lambdaK,
          epsilon
        );
        return { solution, iterations, timeTaken };
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }

    if (graphData && edgeData && nodeData && solutionData) {
      const solver = new Solver(graphData, edgeData, nodeData);
      const solutionMethod = solutionData?.solutionMethod;
      if (
        solutionMethod ===
        methodOptions.find((method) => method.value === "all")?.value
      ) {
        optimizeNetwork(solver, "korpelevich").then((firstRes) =>
          optimizeNetwork(solver, "popov").then((secondRes) =>
            optimizeNetwork(solver, "reflection").then((thirdRes) =>
              setAnswers( firstRes && secondRes && thirdRes ? [
                { ...firstRes, solutionMethod: "korpelevich" } ,
                { ...secondRes, solutionMethod: "popov" },
                { ...thirdRes, solutionMethod: "reflection" },
              ] : null)
            )
          )
        );
        return;
      }
      optimizeNetwork(solver, solutionMethod).then((res) =>
        setAnswers(
          res ? [{ ...res, solutionMethod: solutionData.solutionMethod }] : null
        )
      );
    }
  }, [graphData, edgeData, nodeData, solutionData]);

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
      {graphData && <SolutionForm setSolutionData={setSolutionData} />}
      {answers && (
        <div className="mx-auto max-w-xl p-6 space-y-6">
          <div className="space-y-10">
            {answers.map((answer) => (
              <div key={answer.solutionMethod} className="space-y-4">
                <h1 className="text-2xl font-bold">
                  Solution for{" "}
                  {
                    methodOptions.find(
                      (method) => method.value === answer.solutionMethod
                    )?.label
                  }
                </h1>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="solutionMethod">Optimized solution</Label>
                  <span className="w-[256px]">{answer.solution}</span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="solutionMethod">Time taken</Label>
                  <span className="w-[256px]">{answer.timeTaken}</span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="solutionMethod">Iterations</Label>
                  <span className="w-[256px]">{answer.iterations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
