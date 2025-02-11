import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import init, { eval_script } from "../pkg";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const FUNCTIONS = `let twice = lambda(f, x) {
    f(f(x))
};
let multFour = twice(lambda(x) {x*2}); // 部分適用
multFour(7) // 最後の式を評価した値が出力される`;

const FIBONACCI = `let fib = lambda(n) {
    if(n == 0 || n == 1) {
        1
    } else {
        fib(n-1) + fib(n-2)
    }
};
fib(10)`;

const VAR_AND_SCOPE = `let i = false;
let f = lambda(i, j) {
    let q = if(!j) {
        i // このiは2行目のi
    } else {
        i + 2
    };
    q / 2
};
f(8, i) // このiは1行目のi`;

const CONS_LIST = `enum List {
    Cons(int, List),
    Nil
};
let sum = lambda(l: List) {
    match (l) {
        Cons(x, xs) => x + sum(xs),
        Nil => 0
    }
};
let map = lambda(l: List, f: int -> int) {
    match(l) {
        Cons(x, xs) => Cons(f(x), map(xs, f)),
        Nil => Nil
    }
};
let l = Cons(1, Cons(2, Cons(3, Nil)));
sum(map(l, lambda(x){x*x})) // 1*1 + 2*2 + 3*3`;

const FIZZBUZZ = `let fizzbuzz = lambda(n: int) {
    if (n == 0) {
        ""
    } else if (24 <= n < 30) { // 24 <= n && n < 30 と同値
        fizzbuzz(n - 1) ++ "YAY\\n"
    } else if (n % 15 == 0) { 
        fizzbuzz(n - 1) ++ "FizzBuzz\\n"
    } else if (n % 5 == 0) {
        fizzbuzz(n - 1) ++ "Buzz\\n"
    } else if (n % 3 == 0) {
        fizzbuzz(n - 1) ++ "Fizz\\n"
    } else {
        fizzbuzz(n - 1) ++ ~n ++ "\\n" // ~nで整数から文字列へ変換
    }
};
fizzbuzz(99)`;

export function App() {
  const [code, setCode] = useState(FUNCTIONS);
  const [result, setResult] = useState("evaluate to see result");
  const [types, setTypes] = useState("");
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    // init of wasm
    init();

    // init of code editor
    if (editorRef.current === null) return;
    monacoRef.current = monaco.editor.create(editorRef.current, {
      value: FUNCTIONS,
      language: "plaintext",
      theme: "vs",
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      contextmenu: false,
      automaticLayout: true,
    });
    monacoRef.current.onDidChangeModelContent(() => {
      setCode(monacoRef.current?.getValue() ?? "");
    });

    return () => {
      monacoRef.current?.dispose();
    };
  }, []);

  function on_eval(code: string) {
    const result = eval_script(code);
    if ("Ok" in result) {
      setResult(result.Ok.evaluated);
      setTypes(result.Ok.types);
      setError("");
    } else if ("ParseError" in result) {
      setError(result.ParseError);
    } else if ("TypeInferError" in result) {
      setError(result.TypeInferError);
    } else if ("EvaluationError" in result) {
      setError(result.EvaluationError);
    } else {
      console.error("Unknown result type");
    }
  }

  return (
    <>
      <h1>tiny script language written in rust</h1>
      <div>
        Examples:
        <button
          onClick={() => monacoRef.current?.setValue(FUNCTIONS)}
          class="buttons"
        >
          functions
        </button>
        <button
          onClick={() => monacoRef.current?.setValue(FIBONACCI)}
          class="buttons"
        >
          fibonacci
        </button>
        <button
          onClick={() => monacoRef.current?.setValue(VAR_AND_SCOPE)}
          class="buttons"
        >
          variables and scopes
        </button>
        <button
          onClick={() => monacoRef.current?.setValue(CONS_LIST)}
          class="buttons"
        >
          cons list
        </button>
        <button
          onClick={() => monacoRef.current?.setValue(FIZZBUZZ)}
          class="buttons"
        >
          FizzBuzz
        </button>
      </div>
      <div ref={editorRef} style={{ width: "100%", height: "500px" }}></div>
      <button onClick={() => on_eval(code)} class="buttons">
        evaluate
      </button>
      {error !== "" && <div class="error">{error}</div>}
      <div class="output">{result}</div>
      <div class="types">{types}</div>
    </>
  );
}
