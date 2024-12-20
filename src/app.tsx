import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import init, { eval_script } from "../rscript/pkg";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export function App() {
  const [code, setCode] = useState("let x = 1; x + 3");
  const [result, setResult] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    // init of wasm
    init();

    // init of code editor
    if (editorRef.current === null) return;
    monacoRef.current = monaco.editor.create(editorRef.current, {
      value: "let x = 1;\nx + 3",
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
      <div ref={editorRef} style={{ width: "80%", height: "500px" }}></div>
      <div class="card">
        <button onClick={() => setResult(eval_script(code))}>evaluate</button>
      </div>
      <div>{result}</div>
    </>
  );
}
