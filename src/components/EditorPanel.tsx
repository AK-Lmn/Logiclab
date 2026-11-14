import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { pythonLanguage } from '@codemirror/lang-python';
import { Decoration, drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers } from '@codemirror/view';
import { Annotation, Compartment, EditorState } from '@codemirror/state';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  readOnly: boolean;
  currentLine?: number;
  errorLine?: number;
}

const customTheme = EditorView.theme({
  '&': { backgroundColor: 'var(--color-surface-editor)', color: 'var(--color-editor-text)', height: '100%', width: '100%', maxWidth: '100%', minWidth: '0', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)', lineHeight: 'var(--line-code)' },
  '.cm-content': { paddingBlock: 'var(--space-4)', caretColor: 'var(--color-editor-caret)' },
  '.cm-gutters': { backgroundColor: 'var(--color-surface-editor)', color: 'var(--color-editor-muted)', border: 'none', paddingInline: 'var(--space-2)' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--color-surface-editor-raised)' },
  '.cm-execution-line': { backgroundColor: 'var(--color-editor-execution)' },
  '.cm-error-line': { backgroundColor: 'var(--color-editor-error)' },
  '&.cm-focused': { outline: 'var(--size-focus-ring) solid var(--color-border-inverse)', outlineOffset: 'calc(-1 * var(--size-focus-ring))' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--color-editor-selection)' },
  '.cm-cursor': { borderLeftColor: 'var(--color-editor-caret)' },
}, { dark: true });

const syntaxColors = HighlightStyle.define([
  { tag: [tags.keyword, tags.bool, tags.null], color: 'var(--color-editor-keyword)' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--color-editor-string)' },
  { tag: tags.number, color: 'var(--color-editor-number)' },
  { tag: tags.comment, color: 'var(--color-editor-comment)' },
  { tag: [tags.variableName, tags.function(tags.variableName), tags.operator, tags.punctuation], color: 'var(--color-editor-text)' },
]);

const externalChange = Annotation.define<boolean>();
const baseExtensions = [
  pythonLanguage, customTheme, syntaxHighlighting(syntaxColors), lineNumbers(),
  highlightSpecialChars(), history(), drawSelection(), indentOnInput(), bracketMatching(),
  closeBrackets(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
  EditorState.allowMultipleSelections.of(false),
];

export function EditorPanel({ code, setCode, readOnly, currentLine, errorLine }: EditorPanelProps) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const pointer = useRef<HTMLSpanElement>(null);
  const activeLine = useRef(readOnly ? currentLine : undefined);
  const onChange = useRef(setCode);
  const [configuration] = useState(() => new Compartment());
  const extensions = useMemo(() => [
    EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly),
    readOnly ? [] : [highlightActiveLine(), highlightActiveLineGutter()],
    EditorView.contentAttributes.of({ role: 'textbox', 'aria-label': 'Python source code', 'aria-describedby': 'code-position', 'aria-multiline': 'true', 'aria-readonly': String(readOnly), tabindex: '0' }),
    EditorView.decorations.of(view => {
      const lines = [...new Set([currentLine, errorLine])].filter((line): line is number => !!line && line <= view.state.doc.lines);
      return Decoration.set(lines.map(line => Decoration.line({ class: line === errorLine ? 'cm-error-line' : 'cm-execution-line' }).range(view.state.doc.line(line).from)), true);
    }),
  ], [currentLine, errorLine, readOnly]);
  const initial = useRef({ code, extensions });

  const positionPointer = useCallback((view: EditorView) => {
    view.requestMeasure({
      key: pointer.current,
      read(currentView) {
        const line = activeLine.current;
        if (!line || line > currentView.state.doc.lines || !host.current || !pointer.current) return null;
        const coordinates = currentView.coordsAtPos(currentView.state.doc.line(line).from);
        if (!coordinates) return null;
        const bounds = host.current.getBoundingClientRect();
        const height = pointer.current.getBoundingClientRect().height;
        const y = (coordinates.top + coordinates.bottom) / 2 - bounds.top - height / 2;
        return y >= 0 && y + height <= bounds.height ? y : null;
      },
      write(y) {
        const marker = pointer.current;
        if (!marker) return;
        marker.style.visibility = y === null ? 'hidden' : 'visible';
        if (y !== null) marker.style.transform = `translateY(${y}px)`;
      },
    });
  }, []);

  useEffect(() => { onChange.current = setCode; }, [setCode]);

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: initial.current.code, extensions: [
        baseExtensions, configuration.of(initial.current.extensions),
        EditorView.updateListener.of(update => {
          if (update.docChanged && !update.state.readOnly && !update.transactions.some(transaction => transaction.annotation(externalChange))) {
            onChange.current(update.state.doc.toString());
          }
          if (update.geometryChanged || update.viewportChanged || update.transactions.length) positionPointer(update.view);
        }),
      ] }),
    });
    editor.current = view;
    const onScroll = () => {
      if (pointer.current) pointer.current.dataset.scrolling = 'true';
      positionPointer(view);
    };
    view.scrollDOM.addEventListener('scroll', onScroll, { passive: true });
    return () => { view.scrollDOM.removeEventListener('scroll', onScroll); view.destroy(); editor.current = null; };
  }, [configuration, positionPointer]);

  useEffect(() => {
    const view = editor.current;
    if (!view) return;
    activeLine.current = readOnly ? currentLine : undefined;
    if (pointer.current) delete pointer.current.dataset.scrolling;
    if (view.state.doc.toString() !== code) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code }, annotations: externalChange.of(true) });
    view.dispatch({ effects: configuration.reconfigure(extensions) });
    const line = currentLine || errorLine;
    if (line && line <= view.state.doc.lines) view.dispatch({ effects: EditorView.scrollIntoView(view.state.doc.line(line).from, { y: 'center' }) });
    positionPointer(view);
  }, [code, configuration, currentLine, errorLine, extensions, positionPointer, readOnly]);

  return (
    <div className="editor-panel">
      <div ref={host} className="code-editor-view" />
      <span ref={pointer} className="execution-pointer" aria-hidden="true"><ArrowRight /></span>
      <p id="code-position" className="sr-only">{currentLine ? `Execution is at line ${currentLine}.` : 'Python source editor.'}{errorLine ? ` An error occurred at line ${errorLine}.` : ''}</p>
    </div>
  );
}
