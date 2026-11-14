import React from 'react';
import { Terminal, ListTree, Layers, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';
import { SerializedValue, TraceStep } from '../types/execution';

interface InspectorPanelProps {
  lab: ReturnType<typeof useLogicLab>;
}

export function InspectorPanel({ lab }: InspectorPanelProps) {
  const step = lab.currentStep;
  const isError = lab.phase === 'error';
  const error = lab.result?.error;

  const formatFrameLocals = (locals: Record<string, SerializedValue>) => {
    const entries = Object.entries(locals);
    if (entries.length === 0) return '';
    
    const formatted = entries.map(([k, v]) => {
      let valStr = '';
      if (!v) valStr = 'None';
      else if (v.type === 'null') valStr = 'None';
      else if (v.type === 'bool') valStr = v.value ? 'True' : 'False';
      else if (v.type === 'str') valStr = `"${v.value}"`;
      else if (v.type === 'list') valStr = `[${v.value.length > 0 ? '...' : ''}]`;
      else if (v.type === 'tuple') valStr = `(${v.value.length > 0 ? '...' : ''})`;
      else if (v.type === 'set') valStr = `{${v.value.length > 0 ? '...' : ''}}`;
      else if (v.type === 'dict') valStr = `{${Object.keys(v.value).length > 0 ? '...' : ''}}`;
      else valStr = String(v.value);
      
      return `${k} = ${valStr}`;
    }).join(', ');

    return ` — ${formatted}`;
  };

  const getFrameLabel = (frame: { functionName: string; locals: Record<string, SerializedValue> }) => {
    const name = frame.functionName || '<caller>';
    if (name === '<module>') {
      return '<module>';
    }
    const localsString = formatFrameLocals(frame.locals);
    return `${name}${localsString}`;
  };

  const getStackFrames = (currentStep: TraceStep | null) => {
    if (!currentStep) return [];
    if (currentStep.stack) {
      return currentStep.stack;
    }
    // Fallback for backward compatibility or when stack is not populated
    const frames = [];
    for (let i = 0; i < currentStep.callDepth; i++) {
      if (i === currentStep.callDepth - 1) {
        frames.push({
          functionName: currentStep.functionName,
          locals: currentStep.locals,
          line: currentStep.line
        });
      } else {
        frames.push({
          functionName: '<caller>',
          locals: {},
          line: 0
        });
      }
    }
    return frames;
  };

  const renderValue = (val: SerializedValue): React.ReactNode => {
    if (!val) return <span className="text-slate-500">undefined</span>;
    switch (val.type) {
      case 'null': return <span className="text-slate-500 italic">None</span>;
      case 'bool': return <span className="text-violet-400 font-mono">{val.value ? 'True' : 'False'}</span>;
      case 'int':
      case 'float': return <span className="text-amber-400 font-mono">{val.value}</span>;
      case 'str': return <span className="text-green-400 font-mono">&quot;{val.value}&quot;</span>;
      case 'list': return <span className="text-slate-300 font-mono">[{val.value.map((v: SerializedValue, i: number) => <React.Fragment key={i}>{i > 0 && ', '}{renderValue(v)}</React.Fragment>)}]</span>;
      case 'tuple': return <span className="text-slate-300 font-mono">({val.value.map((v: SerializedValue, i: number) => <React.Fragment key={i}>{i > 0 && ', '}{renderValue(v)}</React.Fragment>)})</span>;
      case 'set': return <span className="text-slate-300 font-mono">{"{"}{val.value.map((v: SerializedValue, i: number) => <React.Fragment key={i}>{i > 0 && ', '}{renderValue(v)}</React.Fragment>)}{"}"}</span>;
      case 'dict': 
        return (
          <span className="text-slate-300 font-mono">
            {"{"}
            {Object.entries(val.value).map(([k, v]: [string, SerializedValue], i) => (
              <React.Fragment key={k}>
                {i > 0 && ', '}
                <span className="text-green-400">&quot;{k}&quot;</span>: {renderValue(v)}
              </React.Fragment>
            ))}
            {"}"}
          </span>
        );
      case 'truncated': return <span className="text-slate-500 italic">{val.value}</span>;
      case 'unsupported': return <span className="text-slate-400 italic">{val.value}</span>;
      default: return <span className="text-slate-400">{JSON.stringify(val)}</span>;
    }
  };

  const currentStdout = isError ? lab.result?.stdout : step?.stdout || '';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Current Event Summary */}
      <div className="bg-charcoal-900 border-b border-charcoal-700 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : lab.currentStepIndex >= lab.totalSteps - 1 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Activity className="w-5 h-5 text-violet-400" />
          )}
          <span className="text-sm font-medium">
            {isError ? 'Execution Failed' : 
             lab.currentStepIndex >= lab.totalSteps - 1 && lab.totalSteps > 0 ? 'Execution Complete' : 
             step ? (step.event === 'call' ? 'Calling' : step.event === 'return' ? 'Returning from' : 'Executing line') + " " + step.line + " in " + (step.functionName || '<module>') : 'Ready'}
          </span>
        </div>
        {lab.result?.truncated && (
          <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            Truncated: {lab.result.truncationReason}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Error Display */}
        {isError && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error.name} (Line {error.line})
            </h3>
            <p className="text-red-300 text-sm font-mono whitespace-pre-wrap">{error.message}</p>
          </div>
        )}

        {/* Locals & Call Stack Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0 max-w-full">
          
          {/* Variables */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-lg overflow-hidden flex flex-col min-h-[200px]">
            <div className="bg-charcoal-900 px-3 py-2 border-b border-charcoal-700 flex items-center gap-2">
              <ListTree className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Variables</h3>
            </div>
            <div className="p-3 overflow-auto flex-1">
              {!step || Object.keys(step.locals || {}).length === 0 ? (
                <div className="text-slate-500 text-sm italic h-full flex items-center justify-center">No variables in current scope</div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(step.locals).map(([name, val]: [string, SerializedValue]) => {
                      // Check if changed
                      const prevStep = lab.currentStepIndex > 0 ? lab.result?.steps[lab.currentStepIndex - 1] : null;
                      const isChanged = prevStep && JSON.stringify(prevStep.locals[name]) !== JSON.stringify(val);
                      
                      return (
                        <tr key={name} className={"border-b border-charcoal-700/50 last:border-0 " + (isChanged ? 'bg-violet-500/10' : '')}>
                          <td className="py-1.5 pr-4 align-top font-mono text-slate-300 break-words min-w-[80px]">{name}</td>
                          <td className="py-1.5 break-all">{renderValue(val)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Call Stack */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-lg overflow-hidden flex flex-col min-h-[200px]">
            <div className="bg-charcoal-900 px-3 py-2 border-b border-charcoal-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Call Stack</h3>
            </div>
            <div className="p-3 overflow-auto flex-1 flex flex-col gap-2">
              {!step ? (
                 <div className="text-slate-500 text-sm italic h-full flex items-center justify-center">Empty stack</div>
              ) : (() => {
                const stack = getStackFrames(step);
                return [...stack].reverse().map((frame, idx) => {
                  const originalIdx = stack.length - 1 - idx;
                  const isCurrent = originalIdx === stack.length - 1;
                  const cardClass = "px-3 py-1.5 rounded text-sm font-mono border break-words transition-colors flex items-center justify-between gap-2 min-w-0 w-full max-w-full " + 
                    (isCurrent 
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-200 font-semibold shadow-sm shadow-violet-900/10' 
                      : 'bg-charcoal-900 border-charcoal-700 text-slate-400');
                  
                  return (
                    <div 
                      key={originalIdx} 
                      className={cardClass}
                      style={{ paddingLeft: `${Math.min(originalIdx, 6) * 6 + 12}px` }}
                    >
                      <span className="break-words min-w-0">{getFrameLabel(frame)}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider font-bold shrink-0">
                          Current
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          
        </div>

        {/* Output Panel */}
        <div className="bg-ink-900 border border-charcoal-700 rounded-lg overflow-hidden flex flex-col min-h-[150px]">
          <div className="bg-charcoal-900 px-3 py-2 border-b border-charcoal-700 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Output</h3>
          </div>
          <div className="p-3 font-mono text-sm text-slate-300 overflow-auto flex-1 whitespace-pre-wrap break-words">
            {currentStdout || <span className="text-slate-600 italic">No output yet...</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
