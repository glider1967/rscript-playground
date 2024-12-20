import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import init, { eval_script } from "../pkg";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const FUNCTIONS = `let twice = lambda(f, x) {
    f(f(x))
};
let multFour = twice(lambda(x) {x*2});
multFour(7)`;

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
        i
    } else {
        i + 2
    };
    q / 2
};
f(8, i)`;

export function App() {
  const [code, setCode] = useState(FUNCTIONS);
  const [result, setResult] = useState("evaluate to see result");
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
      </div>
      <div ref={editorRef} style={{ width: "100%", height: "500px" }}></div>
      <button onClick={() => setResult(eval_script(code))} class="buttons">
        evaluate
      </button>
      <div class="output">{result}</div>
    </>
  );
}
