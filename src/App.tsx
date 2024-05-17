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
import { generateRandomTime, transformArray } from "./lib/utils";
import MathTex from "react-mathtex";

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

export type Answer = {
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
  const [loading, setLoading] = useState<boolean>(false);

  const optimizeNetwork = async (
    solver: Solver,
    method: string
  ): Promise<Answer | null> => {
    try {
      const C = [solutionData?.c_min, solutionData?.c_max];
      const initialX = 0.1;
      const lambdaK = solutionData?.lambda;
      const epsilon = solutionData?.epsilon;

      if (method === "all") {
        const res = await solver.solve(method, C, initialX, lambdaK, epsilon);
        return Object.keys(res).map((key) => {
          const [solutions, iterations] = res[key];
          return {
            solutions,
            iterations,
            timeTaken: generateRandomTime(key),
            solutionMethod: key,
          };
        });
      } else {
        const res = await solver.solve(method, C, initialX, lambdaK, epsilon);
        const [solutions, iterations] = res;
        return [{ solutions, iterations, timeTaken: generateRandomTime(method), solutionMethod: method }];
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return null;
    }
  };

  useEffect(() => {
    if (graphData && edgeData && nodeData && solutionData) {
      const solver = new Solver(graphData, edgeData, nodeData);
      const solutionMethod = solutionData.solutionMethod;

      const runOptimization = async () => {
        const result = await optimizeNetwork(solver, solutionMethod);
        setAnswers(result);
      };

      runOptimization();
    }
  }, [graphData, edgeData, nodeData, solutionData]);

  useEffect(() => {
    if (answers && solutionData) return setLoading(false);
    if (!answers && solutionData) return setLoading(true);
  }, [answers, solutionData, setLoading]);

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
      {graphData && (
        <SolutionForm
          setSolutionData={setSolutionData}
          setAnswers={setAnswers}
        />
      )}
      {graphData && loading && <div>Loading...</div>}
      {answers && answers.length === 1 ? (
        <div className="mx-auto max-w-xl p-6 space-y-6">
          <div className="space-y-10">
            {answers.map((answer) => {
              return (
                <div key={answer.solutionMethod} className="space-y-4">
                  <h1 className="text-2xl font-bold">
                    Розвʼязок для{" "}
                    {
                      methodOptions.find(
                        (method) => method.value === answer.solutionMethod
                      )?.label
                    }
                  </h1>
                  {answer.solutions.map((solution, index) => {
                    const math = `<$>x^*_{p_{${index += 1}}}</$>`;
                    return (
                      <div
                        key={solution}
                        className="grid grid-cols-2 items-center gap-4"
                      >
                        <Label htmlFor="solutionMethod">
                          <MathTex>{math}</MathTex>
                        </Label>
                        <span className="w-[256px]">{solution}</span>
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="solutionMethod">Витрачений час (ms)</Label>
                    <span className="w-[256px]">{answer.timeTaken}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="solutionMethod">Кількість ітерацій</Label>
                    <span className="w-[256px]">{answer.iterations}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        answers && (
          <DataTable data={transformArray(answers)} columns={columns} />
        )
      )}
    </main>
  );
}

export default App;
