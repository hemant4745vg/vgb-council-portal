"use client";

import { useEffect, useMemo, useState } from "react";

type AngleMode = "DEG" | "RAD";

type HistoryItem = {
  expression: string;
  result: string;
};

type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: string }
  | { type: "func"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma"; value: "," };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sqrt",
  "cbrt",
  "log",
  "ln",
  "abs",
  "exp",
]);

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "Error";
  if (Math.abs(value) < 1e-12) value = 0;
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 1e-12) return String(rounded);
  return Number(value.toPrecision(12)).toString();
}

function factorial(n: number) {
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n || n > 170) {
    throw new Error("Factorial needs a whole number from 0 to 170.");
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function combination(n: number, r: number) {
  if (
    !Number.isFinite(n) ||
    !Number.isFinite(r) ||
    n < 0 ||
    r < 0 ||
    n < r ||
    Math.floor(n) !== n ||
    Math.floor(r) !== r
  ) {
    throw new Error("nCr needs whole numbers with n ≥ r ≥ 0.");
  }
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

function permutation(n: number, r: number) {
  if (
    !Number.isFinite(n) ||
    !Number.isFinite(r) ||
    n < 0 ||
    r < 0 ||
    n < r ||
    Math.floor(n) !== n ||
    Math.floor(r) !== r
  ) {
    throw new Error("nPr needs whole numbers with n ≥ r ≥ 0.");
  }
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const previousCanEndValue = () => {
    const previous = tokens[tokens.length - 1];
    return (
      previous?.type === "number" ||
      previous?.type === "paren" && previous.value === ")" 
    );
  };

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      const match = input.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
      if (!match) throw new Error("Invalid number.");
      tokens.push({ type: "number", value: Number(match[0]) });
      i += match[0].length;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      const match = input.slice(i).match(/^[a-zA-Z]+/);
      if (!match) throw new Error("Invalid name.");
      const name = match[0].toLowerCase();

      if (name === "pi" || name === "e") {
        tokens.push({ type: "number", value: CONSTANTS[name] });
      } else if (FUNCTIONS.has(name)) {
        tokens.push({ type: "func", value: name });
      } else if (name === "ncr" || name === "npr") {
        tokens.push({ type: "op", value: name });
      } else {
        throw new Error(`Unknown function or constant: ${name}`);
      }
      i += match[0].length;
      continue;
    }

    if ("+-*/^!".includes(ch)) {
      if (ch === "-" && !previousCanEndValue()) {
        tokens.push({ type: "op", value: "u-" });
      } else if (ch === "+" && !previousCanEndValue()) {
        tokens.push({ type: "op", value: "u+" });
      } else {
        tokens.push({ type: "op", value: ch });
      }
      i++;
      continue;
    }

    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }

    if (ch === ",") {
      tokens.push({ type: "comma", value: "," });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

const precedence: Record<string, number> = {
  "u-": 5,
  "u+": 5,
  "!": 6,
  "^": 4,
  "*": 3,
  "/": 3,
  "+": 2,
  "-": 2,
  ncr: 2,
  npr: 2,
};

function evaluateExpression(input: string, angleMode: AngleMode): number {
  const tokens = tokenize(input);
  const output: Token[] = [];
  const stack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "number") {
      output.push(token);
      continue;
    }

    if (token.type === "func") {
      stack.push(token);
      continue;
    }

    if (token.type === "comma") {
      while (
        stack.length &&
        !(stack[stack.length - 1].type === "paren" &&
          stack[stack.length - 1].value === "(")
      ) {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error("Unexpected comma.");
      continue;
    }

    if (token.type === "paren" && token.value === "(") {
      stack.push(token);
      continue;
    }

    if (token.type === "paren" && token.value === ")") {
      while (
        stack.length &&
        !(stack[stack.length - 1].type === "paren" &&
          stack[stack.length - 1].value === "(")
      ) {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error("Mismatched parentheses.");
      stack.pop();
      if (stack[stack.length - 1]?.type === "func") {
        output.push(stack.pop()!);
      }
      continue;
    }

    if (token.type === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === "func") {
          output.push(stack.pop()!);
          continue;
        }
        if (top.type !== "op") break;

        const p1 = precedence[token.value];
        const p2 = precedence[top.value];
        const rightAssociative = token.value === "^" || token.value === "u-" || token.value === "u+";

        if ((!rightAssociative && p1 <= p2) || (rightAssociative && p1 < p2)) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(token);
    }
  }

  while (stack.length) {
    const top = stack.pop()!;
    if (top.type === "paren") throw new Error("Mismatched parentheses.");
    output.push(top);
  }

  const values: number[] = [];

  const toAngle = (x: number) => angleMode === "DEG" ? (x * Math.PI) / 180 : x;
  const fromAngle = (x: number) => angleMode === "DEG" ? (x * 180) / Math.PI : x;

  for (const token of output) {
    if (token.type === "number") {
      values.push(token.value);
      continue;
    }

    if (token.type === "op") {
      if (token.value === "u-" || token.value === "u+") {
        const a = values.pop();
        if (a === undefined) throw new Error("Missing value.");
        values.push(token.value === "u-" ? -a : a);
        continue;
      }

      if (token.value === "!") {
        const a = values.pop();
        if (a === undefined) throw new Error("Missing value.");
        values.push(factorial(a));
        continue;
      }

      const b = values.pop();
      const a = values.pop();
      if (a === undefined || b === undefined) throw new Error("Incomplete expression.");

      if (token.value === "+") values.push(a + b);
      else if (token.value === "-") values.push(a - b);
      else if (token.value === "*") values.push(a * b);
      else if (token.value === "/") {
        if (Math.abs(b) < Number.EPSILON) throw new Error("Cannot divide by zero.");
        values.push(a / b);
      } else if (token.value === "^") values.push(Math.pow(a, b));
      else if (token.value === "ncr") values.push(combination(a, b));
      else if (token.value === "npr") values.push(permutation(a, b));
      continue;
    }

    if (token.type === "func") {
      const a = values.pop();
      if (a === undefined) throw new Error("Missing function argument.");

      let result: number;
      switch (token.value) {
        case "sin": result = Math.sin(toAngle(a)); break;
        case "cos": result = Math.cos(toAngle(a)); break;
        case "tan":
          if (Math.abs(Math.cos(toAngle(a))) < 1e-12) throw new Error("tan is undefined at this angle.");
          result = Math.tan(toAngle(a));
          break;
        case "asin": result = fromAngle(Math.asin(a)); break;
        case "acos": result = fromAngle(Math.acos(a)); break;
        case "atan": result = fromAngle(Math.atan(a)); break;
        case "sqrt":
          if (a < 0) throw new Error("Square root needs a non-negative number.");
          result = Math.sqrt(a);
          break;
        case "cbrt": result = Math.cbrt(a); break;
        case "log":
          if (a <= 0) throw new Error("log needs a positive number.");
          result = Math.log10(a);
          break;
        case "ln":
          if (a <= 0) throw new Error("ln needs a positive number.");
          result = Math.log(a);
          break;
        case "abs": result = Math.abs(a); break;
        case "exp": result = Math.exp(a); break;
        default: throw new Error("Unknown function.");
      }
      if (!Number.isFinite(result)) throw new Error("Result is outside the calculator's range.");
      values.push(result);
    }
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) {
    throw new Error("Invalid expression.");
  }

  return values[0];
}

function prettyExpression(expression: string) {
  return expression
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ")
    .replace(/\^/g, " ^ ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CalculatorPage() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [scientific, setScientific] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memory, setMemory] = useState(0);
  const [error, setError] = useState("");

  const working = useMemo(() => {
    if (!expression.trim()) return "";
    return prettyExpression(expression);
  }, [expression]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (/^[0-9.]$/.test(key)) append(key);
      else if ("+-*/^()!,.".includes(key)) append(key);
      else if (key === "Enter" || key === "=") calculate();
      else if (key === "Backspace") backspace();
      else if (key === "Escape") clearAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function append(value: string) {
    setError("");
    setExpression((current) => current + value);
    setDisplay((current) => current === "0" && /[0-9.]/.test(value) ? value : current);
  }

  function clearAll() {
    setExpression("");
    setDisplay("0");
    setError("");
  }

  function backspace() {
    setError("");
    setExpression((current) => current.slice(0, -1));
  }

  function calculate() {
    if (!expression.trim()) return;
    try {
      const value = evaluateExpression(expression, angleMode);
      const result = formatNumber(value);
      setDisplay(result);
      setHistory((current) => [
        { expression: prettyExpression(expression), result },
        ...current.filter((item) => !(item.expression === prettyExpression(expression) && item.result === result)),
      ].slice(0, 20));
      setExpression(result === "Error" ? "" : result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid expression.");
    }
  }

  function applyUnary(fn: string) {
    if (!expression.trim()) return;
    setExpression(`${fn}(${expression})`);
    setError("");
  }

  function memoryValue() {
    try {
      return expression.trim() ? evaluateExpression(expression, angleMode) : Number(display);
    } catch {
      return Number(display) || 0;
    }
  }

  const basicRows = [
    ["(", ")", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["±", "0", ".", "="],
  ];

  const scientificRows = [
    ["sin", "cos", "tan", "π", "e"],
    ["asin", "acos", "atan", "√", "∛"],
    ["log", "ln", "x²", "xʸ", "1/x"],
    ["n!", "nCr", "nPr", "abs", "exp"],
  ];

  function handleKey(key: string) {
    setError("");

    if (/^[0-9.]$/.test(key)) return append(key);
    if (key === "÷") return append("/");
    if (key === "×") return append("*");
    if (key === "−") return append("-");
    if (key === "√") return applyUnary("sqrt");
    if (key === "∛") return applyUnary("cbrt");
    if (key === "x²") return applyUnary("square");
    if (key === "1/x") {
      if (expression.trim()) setExpression(`1/(${expression})`);
      return;
    }
    if (key === "n!") {
      if (expression.trim()) setExpression(`(${expression})!`);
      return;
    }
    if (key === "π") return append("pi");
    if (key === "e") return append("e");
    if (["sin","cos","tan","asin","acos","atan","log","ln","abs","exp"].includes(key)) {
      return applyUnary(key);
    }
    if (key === "xʸ") return append("^");
    if (key === "nCr") return append(" ncr ");
    if (key === "nPr") return append(" npr ");
    if (key === "±") {
      if (expression.trim()) setExpression(`-(${expression})`);
      return;
    }
    if (key === "%") {
      if (expression.trim()) setExpression(`(${expression})/100`);
      return;
    }
    if (key === "=") return calculate();
    return append(key);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#101828]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tools · Mathematics
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Calculator</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                A school-ready calculator for Classes 6–12, from everyday arithmetic to scientific functions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScientific((v) => !v)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-slate-300"
              >
                {scientific ? "Basic mode" : "Scientific mode"}
              </button>
              <button
                type="button"
                onClick={() => setAngleMode((v) => v === "DEG" ? "RAD" : "DEG")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-slate-300"
              >
                {angleMode}
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="rounded-2xl bg-[#111827] p-5 text-white sm:p-6">
              <div className="min-h-7 overflow-hidden text-right text-sm text-slate-400">
                {working || "Ready"}
              </div>
              <div className="mt-2 min-h-14 overflow-x-auto text-right text-4xl font-semibold tracking-tight">
                {display}
              </div>
              {error && (
                <p className="mt-3 text-right text-xs font-medium text-red-300" aria-live="polite">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {["MC", "MR", "M+", "M−"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "MC") setMemory(0);
                    if (key === "MR") append(formatNumber(memory));
                    if (key === "M+") setMemory((m) => m + memoryValue());
                    if (key === "M−") setMemory((m) => m - memoryValue());
                  }}
                  className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {key}
                </button>
              ))}
            </div>

            {scientific && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {scientificRows.flat().map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKey(key)}
                    className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 grid grid-cols-4 gap-2">
              {basicRows.flat().map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={[
                    "min-h-14 rounded-2xl border text-lg font-semibold transition",
                    key === "="
                      ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      : ["+", "−", "×", "÷", "%"].includes(key)
                        ? "border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={backspace}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Backspace
              </button>
              <button
                type="button"
                onClick={() => {
                  if (history[0]) {
                    setExpression(history[0].expression.replaceAll("×", "*").replaceAll("÷", "/"));
                    setDisplay(history[0].result);
                  }
                }}
                disabled={!history.length}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reuse last
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Keyboard: numbers, + − × /, parentheses, ^, !, Enter, Backspace and Escape.
            </p>
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Memory</h2>
                <span className="text-xs text-slate-500">{formatNumber(memory)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                M+ and M− add or subtract the current value. MR recalls it; MC clears it.
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">History</h2>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  disabled={!history.length}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {history.length ? history.map((item, index) => (
                  <button
                    key={`${item.expression}-${index}`}
                    type="button"
                    onClick={() => {
                      setExpression(item.expression.replaceAll("×", "*").replaceAll("÷", "/"));
                      setDisplay(item.result);
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-slate-200"
                  >
                    <div className="truncate text-xs text-slate-500">{item.expression}</div>
                    <div className="mt-1 text-sm font-semibold">{item.result}</div>
                  </button>
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Your calculations will appear here during this session.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Useful examples</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><code>2 × (15 + 8)</code></li>
                <li><code>25%</code> of a value via <code>/100</code></li>
                <li><code>sin(30)</code> in DEG mode</li>
                <li><code>5 nCr 2</code></li>
                <li><code>3^4</code> for powers</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
