'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, FileCode2, ArrowRight, ShieldCheck, ChevronDown, LoaderCircle, ArrowUpRight } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';
import { EditorPanel } from './EditorPanel';
import { InspectorPanel } from './InspectorPanel';
import { PlaybackControls } from './PlaybackControls';
import { LogicLabMark, LogicLabWordmark } from './LogicLabMark';
import { Select } from './Select';
import { EXAMPLES, Example } from '../lib/examples';

export function LogicLabApp() {
  const lab = useLogicLab();
  const [pendingExample, setPendingExample] = useState<Example | null>(null);
  const [runFeedback, setRunFeedback] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousPhase = useRef(lab.phase);
  const editing = lab.phase === 'editing';
  const busy = lab.phase === 'loading-runtime' || lab.phase === 'executing';
  const runActive = busy || lab.isPlaying;
  const finished = lab.totalSteps > 0 && lab.currentStepIndex >= lab.totalSteps - 1;
  const runState = lab.phase === 'loading-runtime' ? 'Preparing Python'
    : busy ? 'Code is running'
    : lab.isPlaying ? 'Playing execution'
    : lab.result?.error ? 'Execution stopped'
    : lab.result?.truncated ? 'Trace limit reached'
    : lab.result ? (finished ? 'Execution complete' : 'Execution paused')
    : 'Ready to run';
  const selectedExample = EXAMPLES.find(example => example.code === lab.code);
  const empty = !lab.code.trim();
  const errorLine = ['InternalError', 'TimeoutError'].includes(lab.result?.error?.name || '') ? undefined : lab.result?.error?.line;
  const status = lab.phase === 'loading-runtime' ? 'Preparing Python. Please wait.' : busy ? 'Running your Python program. Please wait.' : lab.result?.error
    ? `Execution stopped: ${lab.result.error.name}. ${lab.totalSteps ? 'Recorded steps are available to explore.' : 'Review the error and edit your code.'}`
    : lab.result?.truncated ? 'The trace reached an execution limit. Recorded steps are available.'
    : lab.result ? `Trace ready. ${lab.totalSteps} recorded steps. ${lab.isPlaying ? 'Follow the highlighted line as values change.' : finished ? 'Run again to replay, or edit your code.' : 'Use Play or Next step.'}` : 'Write some Python or choose an example.';

  useEffect(() => {
    if (previousPhase.current !== lab.phase && (previousPhase.current === 'loading-runtime' || previousPhase.current === 'executing') && !busy) {
      document.getElementById('execution-summary')?.focus();
    }
    previousPhase.current = lab.phase;
  }, [busy, lab.phase]);

  useEffect(() => {
    const element = dialog.current;
    if (!pendingExample || !element) return;
    const returnFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    return () => { element.close(); returnFocus?.focus(); };
  }, [pendingExample]);

  function editCode() {
    lab.handleEdit();
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#code-editor [role="textbox"]')?.focus());
  }

  function runCode() {
    if (runActive || empty) return;
    setRunFeedback(count => count + 1);
    void lab.handleRun();
  }

  function loadExample(value: string) {
    const example = EXAMPLES.find(item => item.id === value);
    if (!example || example.code === lab.code) return;
    if (empty) lab.setCode(example.code);
    else setPendingExample(example);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="skip-link" href="#workspace">Skip to workspace</a>
        <a href="#workspace" className="brand" aria-label="LogicLab workspace"><span className="brand-symbol"><LogicLabMark variant="reverse" /></span><LogicLabWordmark className="brand-wordmark" /></a>
        <span className="header-description">Python execution visualizer</span>
        <span className="privacy-note"><ShieldCheck aria-hidden="true" /><span>Runs in your browser</span></span>
      </header>

      <main className="workbench" id="workspace" aria-label="Python workspace" tabIndex={-1}>
        <aside className="lesson-rail" aria-labelledby="workspace-title">
          <div className="lesson-intro">
            <h1 id="workspace-title">Python,<br className="intro-break" />{' '}step by step.</h1>
            <p>Write a program. Run it. Follow each line as its values change.</p>
          </div>
          <div className="example-library">
            <Select label="Example program" value={selectedExample?.id || ''} placeholder="Your own program" onChange={loadExample} disabled={!editing || busy} options={EXAMPLES.map(example => ({ value: example.id, label: example.title }))} />
            <p className="example-description">{selectedExample?.description || 'A little code. A clearer understanding.'}</p>
          </div>
          <div className="rail-guide">
            <h2>From code to clarity</h2>
            <ol>
              <li><span>01</span><strong>Write a program</strong></li>
              <li><span>02</span><strong>Run your code</strong></li>
              <li><span>03</span><strong>Explore each step</strong></li>
            </ol>
          </div>
          <details className="runtime-details"><summary>About this environment<ChevronDown aria-hidden="true" /></summary><p>Python runs locally in your browser. Imports, file access, and interactive input are not supported.</p><p>Up to 1,500 execution steps, a four-second execution limit, and 10,000 source characters. This educational playground is not a hardened security sandbox.</p></details>
        </aside>

        <section className="program-workspace" aria-labelledby="program-heading">
          <div className="workspace-toolbar">
            <h2 id="program-heading">Your program</h2>
            <button type="button" className="btn btn--primary run-button" onClick={runCode} disabled={runActive || empty} aria-describedby="run-help" aria-busy={runActive}>
              <span key={runFeedback} className="run-button-content" data-activated={runFeedback > 0}>
                <span className="run-icon" aria-hidden="true">{runActive ? <LoaderCircle className="loading-icon" /> : <Play />}</span>
                {runActive ? 'Running…' : lab.result && !editing ? 'Run again' : 'Run code'}
              </span>
            </button>
          </div>
          <div className="execution-status" data-active={runActive} role="status" aria-live="polite" aria-atomic="true">
            <span className="status-mark" aria-hidden="true">{busy ? <LoaderCircle className="loading-icon" /> : lab.isPlaying ? <Play /> : <ArrowUpRight />}</span>
            <div><strong>{runState}</strong><p>{status}</p></div>
          </div>
          <div className="editor-surface" role="group" aria-label="Python editor" aria-busy={busy}>
            <div className="editor-heading"><span><FileCode2 aria-hidden="true" />main.py</span><span className="editor-language">Python</span></div>
            <div className="editor-content" id="code-editor">
              <EditorPanel code={lab.code} setCode={lab.setCode} readOnly={!editing || busy} currentLine={lab.currentStep?.line} errorLine={errorLine} />
            </div>
            <div className="editor-statusbar"><span>{busy ? 'Recording execution' : editing ? 'Ready to edit' : 'Read only, exploring trace'}</span><span>{lab.code.split('\n').length} lines</span></div>
          </div>

          {(lab.phase === 'visualizing' || lab.phase === 'error') ? (
            <div data-testid="playback-controls-wrapper" className="playback-slot"><PlaybackControls lab={lab} onEdit={editCode} /></div>
          ) : <div className="workspace-guidance"><ArrowRight aria-hidden="true" /><p id="run-help">{empty ? 'Add Python code to enable Run code.' : 'Run your code, then use the controls to explore each step.'}</p></div>}
          {(lab.phase === 'visualizing' || lab.phase === 'error') && <p className="sr-only" id="run-help">{lab.isPlaying ? 'Wait for playback to finish, or pause it before running again.' : 'Run the same program again, or choose Edit code to make changes.'}</p>}
        </section>

        <InspectorPanel lab={lab} />
      </main>

      <footer className="app-footer"><span>LogicLab / Python execution, made visible.</span><span>Your code stays in this browser.</span></footer>

      <dialog ref={dialog} className="confirm-dialog" aria-labelledby="replace-heading" aria-describedby="replace-description" onCancel={() => setPendingExample(null)} onClose={() => setPendingExample(null)}>
        <h2 id="replace-heading">Replace your current code?</h2>
        <p id="replace-description">Loading {pendingExample?.title} will replace the program in your editor.</p>
        <div className="dialog-actions"><button type="button" className="btn btn--secondary" autoFocus onClick={() => setPendingExample(null)}>Keep my code</button><button type="button" className="btn btn--danger" onClick={() => { if (pendingExample) lab.setCode(pendingExample.code); setPendingExample(null); }}>Replace code</button></div>
      </dialog>
    </div>
  );
}
