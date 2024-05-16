// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { create, all } from "mathjs";
import { Parser } from "expr-eval";

const math = create(all);
const parser = new Parser();

export default class Solver {
  constructor(nC, nS, nB, nD, nR, nP, theta, graphData, edges, nodes) {
    this.nC = nC;
    this.nS = nS;
    this.nB = nB;
    this.nD = nD;
    this.nP = nP;
    this.nR = nR;

    this.nodes = {};
    this.edges = {};
    this.theta = theta;

    // Translating Python dict comprehension to JavaScript
    for (let node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        this.nodes[node] = {};
        for (let key in nodes[node]) {
          if (nodes[node].hasOwnProperty(key) && nodes[node][key]) {
            this.nodes[node][key] = parseFloat(nodes[node][key]);
          }
        }
      }
    }

    // add derivative of c,z,r to edges as dc, dz, dr
    for (let edge in edges) {
      if (edges.hasOwnProperty(edge)) {
        this.edges[edge] = {};
        for (let key in edges[edge]) {
          if (edges[edge].hasOwnProperty(key) && edges[edge][key]) {
            if (key === "c" || key === "z" || key === "r") {
              this.edges[edge][key] = edges[edge][key];
            }
            if (key === "alpha") {
              this.edges[edge][key] = parseFloat(edges[edge][key]);
            }
          }
          try {
            let derivative = math
              .derivative(this.edges[edge]["c"], "f")
              .toString();
            derivative = derivative.replace("f", this.fA(edge));
            derivative = math.simplify(derivative).toString();
            this.edges[edge]["dc"] = derivative;
          } catch (e) {
            this.edges[edge]["dc"] = "0";
          }
          try {
            let derivative = math
              .derivative(this.edges[edge]["z"], "f")
              .toString();
            derivative = derivative.replace("f", this.fA(edge));
            derivative = math.simplify(derivative).toString();
            this.edges[edge]["dz"] = derivative;
          } catch (e) {
            this.edges[edge]["dz"] = "0";
          }
          try {
            let derivative = math
              .derivative(this.edges[edge]["r"], "f")
              .toString();
            derivative = derivative.replace("f", this.fA(edge));
            derivative = math.simplify(derivative).toString();
            this.edges[edge]["dr"] = derivative;
          } catch (e) {
            this.edges[edge]["dr"] = "0";
          }
        }
      }
    }
  }

  allPaths() {
    let paths = {};
    let ind = 0;
    for (let i = 0; i < this.nC; i++) {
      for (let j = 0; j < this.nB; j++) {
        for (let k = 0; k < this.nD; k++) {
          for (let l = 0; l < this.nR; l++) {
            paths[`p${ind}`] = [
              `1-C${i + 1}`,
              `C${i + 1}-B${j + 1}`,
              `B${j + 1}-P${j + 1}`,
              `P${j + 1}-S${j + 1}`,
              `S${j + 1}-D${k + 1}`,
              `D${k + 1}-R${l + 1}`,
            ];
            ind += 1;
          }
        }
      }
    }
    return paths;
  }

  allPathsToRk(k) {
    let paths = this.allPaths();
    let result = {};
    for (let p in paths) {
      if (paths[p][paths[p].length - 1].includes(`R${k}`)) {
        result[p] = paths[p];
      }
    }
    return result;
  }

  deltaAP(a, p) {
    let paths = this.allPaths();
    let path = paths[p];
    return path.includes(a) ? 1 : 0;
  }

  alphaAP(a, p) {
    let result = this.deltaAP(a, p);
    let paths = this.allPaths();
    let path = paths[p];
    for (let link of path) {
      if (link === a) {
        break;
      }
      result *= this.edges[link]["alpha"];
    }
    return result;
  }
  fA(link) {
    let result = ``;
    let i = 0;
    let paths = this.allPaths();
    for (let path in paths) {
      let x = `x${i}`;
      if (i === 0) {
        result += `${this.alphaAP(link, path)}*${x}`;
      } else {
        result += `+${this.alphaAP(link, path)}*${x}`;
      }
      i += 1;
    }
    return result;
  }
  muP(p) {
    let result = 1;
    let paths = this.allPaths();
    let path = paths[p];
    for (let link of path) {
      result *= this.edges[link]["alpha"];
    }
    return result;
  }

  nPaths() {
    return Object.keys(this.allPaths()).length;
  }

  F() {
    let result = "";
    let links = Object.keys(this.edges);
    for (let k = 1; k <= this.nR; k++) {
      let allPathssToRk = this.allPathsToRk(k);
      for (let p in allPathssToRk) {
        for (let l in links) {
          result += ` +${this.alphaAP(links[l], p)}*(${
            this.edges[links[l]]["dc"]
          } + ${this.edges[links[l]]["dz"]} + ${this.theta} * ${
            this.edges[links[l]]["dr"]
          })`;
        }
        let lambdaPlus = this.nodes[`R${k}`]["lambda+"];
        let lambdaMinus = this.nodes[`R${k}`]["lambda-"];
        let PMax = this.nodes[`R${k}`]["P_max"];
        let PMin = this.nodes[`R${k}`]["P_min"];
        result += ` +${lambdaPlus}*${this.muP(p)}*(${this.muP(p)}*x${p.slice(
          1
        )})/(${PMax} - ${PMin}) - ${lambdaMinus}*${this.muP(
          p
        )} + ${lambdaMinus}*${this.muP(p)}*(${this.muP(p)}*x${p.slice(
          1
        )})/(${PMax} - ${PMin})`;
      }
    }
    let np = this.nPaths();
    let x = "";
    for (let i = 0; i < np; i++) {
      x += `x${i}`;
      if (i < np - 1) {
        x += ", ";
      }
    }
    return parser.parse(math.simplify(result).toString()).toJSFunction(x);
  }

  korpelevichMethod(
    F,
    C,
    n,
    initial_x,
    lambda_k,
    epsilon = 1e-6,
    max_iter = 1000
  ) {
    let tic = performance.now();
    let x_values = Array(n).fill(initial_x);
    let i = 0;
    for (i = 0; i < max_iter; i++) {
      let x_n = x_values.slice(-n);
      let y_n = this.projectionC(
        math.subtract(x_n, math.multiply(lambda_k, F(...x_n))),
        C
      );
      if (math.norm(math.subtract(y_n, x_n)) < epsilon) {
        break;
      }
      let x_next = this.projectionC(
        math.subtract(x_n, math.multiply(lambda_k, F(...y_n))),
        C
      );
      x_values = x_next;
    }
    let toc = performance.now();
    return [x_values, i + 1, toc - tic];
  }

  popovMethod(F, C, n, initial_x, lambda_k, epsilon = 1e-6, max_iter = 10000) {
    let tic = performance.now();
    let x_values = Array(n).fill(initial_x);
    let y_values = Array(n).fill(initial_x);
    let i = 0;
    for (i = 0; i < max_iter; i++) {
      let x_n = x_values.slice(-n);
      let y_n = y_values.slice(-n);

      let x_next = this.projectionC(
        math.subtract(x_n, math.multiply(lambda_k, F(...y_n))),
        C
      );
      x_values = x_next;

      let y_next = this.projectionC(
        math.subtract(x_next, math.multiply(lambda_k, F(...y_n))),
        C
      );
      y_values = y_next;

      if (
        math.norm(math.subtract(x_n, y_n)) < epsilon &&
        math.norm(math.subtract(x_n, x_next)) < epsilon &&
        math.norm(math.subtract(y_n, x_next)) < epsilon
      ) {
        break;
      }
    }
    let toc = performance.now();
    return [x_values, i + 1, toc - tic];
  }

  reflectionMethod(
    F,
    C,
    n,
    initial_x,
    lambda_k,
    epsilon = 1e-6,
    max_iter = 1000
  ) {
    let tic = performance.now();
    let x_values = Array(n).fill(initial_x);
    let y_values = Array(n).fill(initial_x);
    let i = 0;
    for (i = 0; i < max_iter; i++) {
      let x_n = x_values.slice(-n);
      let y_n = y_values.slice(-n);
      let x_next = this.projectionC(
        math.subtract(x_n, math.multiply(lambda_k, F(...x_n))),
        C
      );
      if (
        math.norm(math.subtract(y_n, x_n)) < epsilon &&
        math.norm(math.subtract(x_next, x_n)) < epsilon
      ) {
        break;
      }
      let y_next = this.projectionC(
        math.subtract(math.multiply(2, x_next), x_n),
        C
      );
      x_values = x_next;
      y_values = y_next;
    }
    let toc = performance.now();
    return [x_values, i + 1, toc - tic];
  }

  projectionC(x, C) {
    return x.map((v) => math.max(C[0], math.min(C[1], v)));
  }

  solve(method, C, initial_x, lambda_k, epsilon = 1e-6, max_iter = 1000) {
    let F = this.F();
    let n = this.nPaths();
    switch (method) {
      case "korpelevich":
        return this.korpelevichMethod(
          F,
          C,
          n,
          initial_x,
          lambda_k,
          epsilon,
          max_iter
        );
      case "popov":
        return this.popovMethod(
          F,
          C,
          n,
          initial_x,
          lambda_k,
          epsilon,
          max_iter
        );
      case "reflection":
        return this.reflectionMethod(
          F,
          C,
          n,
          initial_x,
          lambda_k,
          epsilon,
          max_iter
        );
      case "all":
        return {
          korpelevich: this.korpelevichMethod(
            F,
            C,
            n,
            initial_x,
            lambda_k,
            epsilon,
            max_iter
          ),
          popov: this.popovMethod(
            F,
            C,
            n,
            initial_x,
            lambda_k,
            epsilon,
            max_iter
          ),
          reflection: this.reflectionMethod(
            F,
            C,
            n,
            initial_x,
            lambda_k,
            epsilon,
            max_iter
          ),
        };
    }
  }
}

// let edges = {
//   "1-C1": { c: "f^2+6*f", z: "0", r: "2*f^2", alpha: "1" },
//   "C1-B1": { c: "2*f^2+7*f", z: "0", r: "0", alpha: "1" },
//   "B1-P1": { c: "f^2+11*f", z: "0", r: "0", alpha: "1" },
//   "P1-S1": { c: "3*f^2+11*f", z: "0", r: "0", alpha: "1" },
//   "S1-D1": { c: "f^2+2*f", z: "0", r: "0", alpha: "1" },
//   "D1-R1": { c: "f^2+f", z: "0", r: "0", alpha: "1" },
// };
// let nodes = {
//   R1: { "lambda+": "0", "lambda-": "100", P_min: "0", P_max: "5" },
// };
// let theta = "1";

// let solver = new Solver(1, 1, 1, 1, 1, 1, edges, nodes, theta);
// console.log(solver.edges); // Output: "f^2+6*f"
// console.log(solver.allPaths()); // Output: "{'p0': ['1-C1', 'C1-B1', 'B1-P1', 'P1-S1', 'S1-D1', 'D1-R1']}"
// console.log(solver.allPathsToRk(1)); // Output: "{'p0': ['1-C1', 'C1-B1', 'B1-P1', 'P1-S1', 'S1-D1', 'D1-R1']}"
// console.log(solver.deltaAP("C1-B1", "p0")); // Output: "1"
// console.log(solver.alphaAP("C1-B1", "p0")); // Output: "1"
// console.log(solver.fA("C1-B1")); // Output: "x0"
// console.log(solver.muP("p0"));
// let f = solver.F();
// console.log(f(1, 1));

// let C = [0, 10]; // Constraints [lower bound, upper bound]
// let initial_x = 0; // Initial value for all variables
// let lambda_k = 0.001; // Step size
// let epsilon = 0.0001; // Tolerance for convergence
// let max_iter = 1000; // Maximum number of iterations

// // Run the optimization using the Korpelevich method
// let res = solver.solve(
//   "all",
//   (C = C),
//   0,
//   (lambda_k = lambda_k),
//   (epsilon = epsilon),
//   (max_iter = max_iter)
// );

// Log the results
// console.log("Solution:", res);
