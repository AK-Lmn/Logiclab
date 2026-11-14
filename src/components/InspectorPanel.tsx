import React from 'react';
import { Terminal, ListTree, Layers, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';
import { SerializedValue, TraceStep } from '../types/execution';

interface InspectorPanelProps {
  lab: ReturnType<typeof useLogicLab>;
}

function renderValue(value: SerializedValue): React.ReactNode {
  if (!value) return 'None';
  switch (value.type) {
    case 'null': return 'None';
    case 'bool': return value.value ? 'True' : 'False';
    case 'str': return <span className="value-string">&quot;{value.value}&quot;</span>;
    case 'list':
    case 'tuple':
    case 'set': {
      const brackets = value.type === 'list' ? ['[', ']'] : value.type === 'tuple' ? ['(', ')'] : ['{', '}'];
      return <>{brackets[0]}{value.value.map((item, index) => <React.Fragment key={index}>{index > 0 && ', '}{renderValue(item)}</React.Fragment>)}{brackets[1]}</>;
    }
    case 'dict': return <>{'{'}{Object.entries(value.value).map(([key, item], index) => <React.Fragment key={key}>{index > 0 && ', '}&quot;{key}&quot;: {renderValue(item)}</React.Fragment>)}{'}'}</>;
    default: return String(value.value);
  }
}

function getStackFrames(step: TraceStep | null) {
  if (!step) return [];
  if (step.stack) return step.stack;
  return Array.from({ length: step.callDepth }, (_, index) => index === step.callDepth - 1
    ? { functionName: step.functionName, locals: step.locals, line: step.line }
    : { functionName: '<caller>', locals: {}, line: 0 });
}

function getPreviousScopeStep(steps: TraceStep[], index: number) {
  const current = steps[index];
  if (!current || current.event === 'call') return null;
  for (let previous = index - 1; previous >= 0; previous--) {
    const candidate = steps[previous];
    if (candidate.functionName === current.functionName && candidate.callDepth === current.callDepth) {
      return candidate.event === 'return' ? null : candidate;
    }
  }
  return null;
}

export function InspectorPanel({ lab }: InspectorPanelProps) {
  const step = lab.currentStep;
  const error = lab.result?.error;
  const loadingRuntime = lab.phase === 'loading-runtime';
  const executing = lab.phase === 'executing';
  const finished = lab.totalSteps > 0 && lab.currentStepIndex >= lab.totalSteps - 1;
  const previous = getPreviousScopeStep(lab.result?.steps || [], lab.currentStepIndex);
  const variables = Object.entries(step?.locals || {});
  const stack = getStackFrames(step);
  const currentStdout = step ? step.stdout : lab.result?.stdout || '';
  const outputDelta = step?.stdoutDelta || '';
  const hasNewOutput = !!outputDelta && currentStdout.endsWith(outputDelta);
  const retainedOutput = hasNewOutput ? currentStdout.slice(0, -outputDelta.length) : currentStdout;
  const title = loadingRuntime ? 'Preparing Python'
    : executing ? 'Code is running'
    : error ? 'Execution stopped'
    : lab.result?.truncated ? 'Trace limit reached'
    : lab.isPlaying ? 'Playing execution'
    : finished ? 'Execution complete'
    : step ? 'Execution paused'
    : 'Ready when you are';

  return (
    <aside className="inspector" id="execution-inspector" aria-label="Execution inspector" aria-busy={loadingRuntime || executing} data-has-trace={lab.totalSteps > 0}>
      <div className="inspector-heading">
        <h2 id="execution-summary" tabIndex={-1}>{title}</h2>
        <p>{loadingRuntime ? 'Loading the Python environment. Your program will run when it is ready.' : executing ? 'Your program is running. Values and output will appear when the trace is ready.' : step ? <>Line <strong>{step.line}</strong> in <code>{step.functionName || '<module>'}</code></> : 'Run a program to see its values and follow its calls.'}</p>
        {finished && !error && !lab.result?.truncated && <span className="outcome-label"><CheckCircle2 aria-hidden="true" />All steps recorded</span>}
      </div>

      {error && (
        <div className="execution-error" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div><h3>{error.name}</h3><p>{error.message}</p><p className="error-help">{error.name === 'InternalError' ? 'Try Run again. Your code is preserved.' : error.name === 'TimeoutError' ? 'Edit your program to reduce its work, then run again.' : `Line ${error.line}. Review this line, then edit your code and run again.`}</p></div>
        </div>
      )}
      {lab.result?.truncated && <p className="trace-warning">Trace limited: {lab.result.truncationReason || 'execution limit reached'}. Recorded steps remain available.</p>}

      <div className="inspector-sections">
        <section className="inspector-section" aria-labelledby="variables-heading">
          <div className="panel-heading"><h3 id="variables-heading"><ListTree aria-hidden="true" />Variables</h3><span className="panel-count">{variables.length}</span></div>
          {variables.length ? (
            <div className="variable-table-wrap" tabIndex={0} role="region" aria-label="Variable values">
              <table className="variable-table">
                <thead><tr><th scope="col">Variable</th><th scope="col">Value</th></tr></thead>
                <tbody>{variables.map(([name, value]) => {
                  const valueKey = JSON.stringify(value);
                  const isChanged = previous && JSON.stringify(previous.locals[name]) !== valueKey;
                  return <tr key={name} className={isChanged ? 'variable-changed' : undefined}>
                    <th scope="row"><code>{name}</code>{isChanged && <span className="changed-label">Changed</span>}</th>
                    <td><span className="value-slot"><code key={valueKey} className={`trace-value${isChanged ? ' is-updated' : ''}`}>{renderValue(value)}</code></span><span className="value-type">{value.type}</span></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          ) : <p className="empty-state">{step ? 'No variables in this scope yet.' : 'Your variables will appear here.'}</p>}
        </section>

        <section className="inspector-section" aria-labelledby="stack-heading">
          <div className="panel-heading"><h3 id="stack-heading"><Layers aria-hidden="true" />Call stack</h3><span className="panel-count">{stack.length}</span></div>
          {stack.length ? <ol className="stack-list" tabIndex={0} aria-label="Stack frames">{[...stack].reverse().map((frame, index) => {
            const originalIndex = stack.length - 1 - index;
            const isCurrent = index === 0;
            return <li key={originalIndex} className={isCurrent ? 'stack-frame is-current' : 'stack-frame'} aria-current={isCurrent ? 'step' : undefined}>
              <span className="stack-depth">{String(originalIndex + 1).padStart(2, '0')}</span>
              <div className="stack-frame-content"><code>{frame.functionName || '<module>'}</code><span>{Object.entries(frame.locals).map(([name, value], index) => <React.Fragment key={name}>{index > 0 && ', '}{name} = {renderValue(value)}</React.Fragment>)}</span></div>
              {isCurrent && <span className="current-label"><ArrowUpRight aria-hidden="true" /><span className="sr-only">Current</span></span>}
            </li>;
          })}</ol> : <p className="empty-state">Function calls will build a stack here.</p>}
        </section>

        <section className="output-panel" aria-labelledby="output-heading">
          <div className="panel-heading"><h3 id="output-heading"><Terminal aria-hidden="true" />Output</h3><span>Printed text</span></div>
          <pre tabIndex={0} aria-label="Printed output">{currentStdout ? <>{retainedOutput}{hasNewOutput && <span key={step?.id} className="output-addition">{outputDelta}</span>}</> : <span className="output-empty">{lab.result ? 'No output at this step.' : 'Printed output appears here.'}</span>}</pre>
        </section>
      </div>
    </aside>
  );
}
