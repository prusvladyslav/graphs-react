// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { SettingsForm } from "./components/SettingsForm";
import { Graph } from "./components/Graph";
import { useEffect, useState } from "react";
import { SolutionForm } from "./components/SolutionForm";
import Solver from "../src/lib/solver";
import { Label } from "./components/ui/label";
import { methodOptions } from "./const";
import { DataTable } from "./components/Table/data-table";
import { columns } from "./components/Table/columns";
import { transformArray } from "./lib/utils";

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
  solutions: string[];
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
        if (method === "all") {
          const res = await solver.solve(method, C, initialX, lambdaK, epsilon);
          return Object.keys(res).map((key) => {
            const [solutions, iterations, timeTaken] = res[key];
            return {
              solutions: solutions,
              iterations: iterations,
              timeTaken: timeTaken,
              solutionMethod: key,
            };
          });
        }
        const res = await solver.solve(method, C, initialX, lambdaK, epsilon);

        const [solutions, iterations, timeTaken] = res;
        return { solutions, iterations, timeTaken };
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }

    if (graphData && edgeData && nodeData && solutionData) {
      const solver = new Solver(graphData, edgeData, nodeData);
      const solutionMethod = solutionData?.solutionMethod;

      if (solutionMethod === "all") {
        optimizeNetwork(solver, solutionMethod).then((res) => setAnswers(res));
        return;
      }
      optimizeNetwork(solver, solutionMethod).then((res) =>
        setAnswers(
          res ? [{ ...res, solutionMethod: solutionData.solutionMethod }] : null
        )
      );
    }
  }, [graphData, edgeData, nodeData, solutionData]);
  // console.log();

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
      {answers && answers.length === 1 ? (
        <div className="mx-auto max-w-xl p-6 space-y-6">
          <div className="space-y-10">
            {answers.map((answer) => (
              <div key={answer.solutionMethod} className="space-y-4">
                <h1 className="text-2xl font-bold">
                  Розвʼязок для{" "}
                  {
                    methodOptions.find(
                      (method) => method.value === answer.solutionMethod
                    )?.label
                  }
                </h1>
                {answer.solutions.map((solution, index) => (
                  <div
                    key={solution}
                    className="grid grid-cols-2 items-center gap-4"
                  >
                    <Label htmlFor="solutionMethod">
                      Розвʼязок {(index += 1)}.
                    </Label>
                    <span className="w-[256px]">{solution}</span>
                  </div>
                ))}
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="solutionMethod">Витрачений час</Label>
                  <span className="w-[256px]">{answer.timeTaken}</span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="solutionMethod">Ітерації</Label>
                  <span className="w-[256px]">{answer.iterations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        answers && <DataTable data={transformArray(answers)} columns={columns} />
      )}
    </main>
  );
}

export default App;
