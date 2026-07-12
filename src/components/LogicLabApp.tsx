'use client';

import React from 'react';
import { useLogicLab } from '../hooks/useLogicLab';
import { EditorPanel } from './EditorPanel';
import { InspectorPanel } from './InspectorPanel';
import { PlaybackControls } from './PlaybackControls';
import { Terminal, Activity, Play, FileCode2 } from 'lucide-react';
import { EXAMPLES } from '../lib/examples';

export function LogicLabApp() {
  const lab = useLogicLab();

  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-slate-200 selection:bg-violet-500/30">
      {/* Header */}
      <header className="border-b border-charcoal-700 bg-ink-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Activity className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-baseline gap-2">
              LogicLab
              <span className="text-xs font-normal text-slate-400 tracking-normal">Python execution visualizer</span>
            </h1>
          </div>
        </div>
        
        {/* Controls in Header when not in visualize mode, or Example selector */}
        {lab.phase === 'editing' && (
          <div className="flex items-center gap-4">
            <select 
              className="bg-charcoal-800 border border-charcoal-700 text-sm rounded px-3 py-1.5 outline-none focus:border-violet-500 transition-colors"
              onChange={(e) => {
                const ex = EXAMPLES.find(x => x.id === e.target.value);
                if (ex) {
                  if (confirm('Replace current code with example?')) {
                    lab.setCode(ex.code);
                  }
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Example...</option>
              {EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
            <button
              onClick={lab.handleRun}
              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shadow-sm shadow-violet-900/50"
            >
              <Play className="w-4 h-4" />
              Visualize Execution
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Loading Overlay */}
        {lab.phase === 'loading-runtime' && (
          <div className="absolute inset-0 z-50 bg-ink-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-charcoal-700 border-t-violet-500 mb-4"></div>
            <p className="text-violet-400 font-medium animate-pulse">Initializing Python Sandbox...</p>
          </div>
        )}

        {/* Left Column: Editor */}
        <div className={"flex flex-col border-r border-charcoal-700 bg-charcoal-900 transition-all duration-300 " + (lab.phase === 'editing' ? 'w-full lg:w-full max-w-4xl mx-auto border-r-0' : 'w-full lg:w-1/2')}>
          
          {(lab.phase === 'visualizing' || lab.phase === 'error') && (
            <div className="border-b border-charcoal-700 p-2 bg-charcoal-800 flex justify-center">
              <PlaybackControls lab={lab} />
            </div>
          )}
          
          <div className="flex-1 relative min-h-[400px]">
            <EditorPanel 
              code={lab.code} 
              setCode={lab.setCode} 
              readOnly={lab.phase !== 'editing'}
              currentLine={lab.currentStep?.line}
              errorLine={lab.result?.error?.line}
            />
          </div>
          
          {lab.phase === 'editing' && (
            <div className="p-4 text-center border-t border-charcoal-700 bg-ink-800 text-sm text-slate-400 flex flex-col items-center gap-2">
              <p>“See your Python code think.”</p>
              <p className="text-xs max-w-lg">
                Write safe Python code. The environment restricts file access, network, and arbitrary execution. Max 1500 steps, 4s timeout.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Inspector */}
        {(lab.phase === 'visualizing' || lab.phase === 'error') && (
          <div className="w-full lg:w-1/2 flex flex-col overflow-hidden bg-ink-900">
            <InspectorPanel lab={lab} />
          </div>
        )}
      </main>
    </div>
  );
}
