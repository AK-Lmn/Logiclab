import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, lineNumbers } from '@codemirror/view';
import { Extension } from '@codemirror/state';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  readOnly: boolean;
  currentLine?: number;
  errorLine?: number;
}

// Move static custom theme outside the component to avoid unnecessary recreations
const customTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-charcoal-900)",
    color: "#e2e8f0",
    height: "100%",
    fontSize: "14px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  ".cm-content": {
    paddingTop: "16px",
    paddingBottom: "16px",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-charcoal-800)",
    color: "#64748b",
    border: "none",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(139, 92, 246, 0.1)", // violet-500/10
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(139, 92, 246, 0.2)", // violet-500/20
    color: "#c4b5fd", // violet-300
  },
  ".cm-execution-line": {
    backgroundColor: "rgba(245, 158, 11, 0.2) !important", // amber-500/20
  },
  ".cm-error-line": {
    backgroundColor: "rgba(239, 68, 68, 0.2) !important", // red-500/20
  }
}, { dark: true });

export function EditorPanel({ code, setCode, readOnly, currentLine, errorLine }: EditorPanelProps) {
  
  const extensions = useMemo(() => {
    const exts: Extension[] = [python(), customTheme, lineNumbers()];
    
    if (readOnly) {
      const themeExt = EditorView.baseTheme({
        ".cm-execution-line": { backgroundColor: "rgba(245, 158, 11, 0.2)" },
        ".cm-error-line": { backgroundColor: "rgba(239, 68, 68, 0.2)" }
      });
      
      exts.push(themeExt);
    }
    
    return exts;
  }, [readOnly]);

  return (
    <div className="h-full w-full absolute inset-0 overflow-auto">
      <CodeMirror
        value={code}
        height="100%"
        theme="dark" // fallback base
        extensions={extensions}
        editable={!readOnly}
        onChange={(val) => {
          if (!readOnly) setCode(val);
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: !readOnly,
          highlightActiveLine: !readOnly,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false, // user requested no autocomplete
        }}
        className="h-full"
      />
      {/* Hack for MVP to highlight lines since CM6 state fields can be tricky without proper setup */}
      <style>{`
        ${currentLine ? ".cm-line:nth-child(" + currentLine + ") { background-color: rgba(245, 158, 11, 0.2) !important; border-left: 2px solid #f59e0b; }" : ""}
        ${errorLine ? ".cm-line:nth-child(" + errorLine + ") { background-color: rgba(239, 68, 68, 0.2) !important; border-left: 2px solid #ef4444; }" : ""}
      `}</style>
    </div>
  );
}
