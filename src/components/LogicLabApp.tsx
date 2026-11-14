'use client';

import React from 'react';
import { useLogicLab } from '../hooks/useLogicLab';
import { EditorPanel } from './EditorPanel';
import { InspectorPanel } from './InspectorPanel';
import { PlaybackControls } from './PlaybackControls';
import { Play } from 'lucide-react';
import { LogicLabMark } from './LogicLabMark';
import { EXAMPLES } from '../lib/examples';

export function LogicLabApp() {
  const lab = useLogicLab();

  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-slate-200 selection:bg-violet-500/30 max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-charcoal-700 bg-ink-800 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between min-w-0 max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shrink-0">
            <LogicLabMark size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 truncate">
              LogicLab
              <span className="text-[10px] sm:text-xs font-normal text-slate-400 tracking-normal truncate">Python execution visualizer</span>
            </h1>
          </div>
        </div>
        
        {/* Controls in Header only on screen sizes >= sm (tablet/desktop) */}
        {lab.phase === 'editing' && (
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <select 
              className="bg-charcoal-800 border border-charcoal-700 text-sm rounded px-3 py-1.5 outline-none focus:border-violet-500 transition-colors cursor-pointer"
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
              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shadow-sm shadow-violet-900/50 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Visualize Execution
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative min-w-0 max-w-full">
        {/* Loading Overlay */}
        {lab.phase === 'loading-runtime' && (
          <div className="absolute inset-0 z-50 bg-ink-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-charcoal-700 border-t-violet-500 mb-4"></div>
            <p className="text-violet-400 font-medium animate-pulse">Initializing Python Sandbox...</p>
          </div>
        )}

        {/* Left Column: Editor */}
        <div className={"flex flex-col border-b border-charcoal-700 lg:border-b-0 lg:border-r border-charcoal-700 bg-charcoal-900 transition-all duration-300 min-w-0 max-w-full " + (lab.phase === 'editing' ? 'w-full lg:w-full max-w-4xl mx-auto border-r-0 border-b-0' : 'w-full lg:w-1/2')}>
          
          {/* Mobile Editing controls (Select and Run) stacked vertically at top */}
          {lab.phase === 'editing' && (
            <div className="flex sm:hidden flex-col gap-3 p-4 border-b border-charcoal-700 bg-ink-800 w-full min-w-0">
              <select 
                className="w-full bg-charcoal-800 border border-charcoal-700 text-sm rounded px-3 py-2 outline-none focus:border-violet-500 transition-colors cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm shadow-violet-900/50 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Visualize Execution
              </button>
            </div>
          )}

          {(lab.phase === 'visualizing' || lab.phase === 'error') && (
            <div 
              data-testid="playback-controls-wrapper"
              className="border-b border-charcoal-700 p-2 bg-charcoal-800 flex justify-center order-2 lg:order-1 min-w-0 max-w-full"
            >
              <PlaybackControls lab={lab} />
            </div>
          )}
          
          <div className="flex-1 relative min-h-[400px] order-1 lg:order-2 min-w-0 max-w-full">
            <EditorPanel 
              code={lab.code} 
              setCode={lab.setCode} 
              readOnly={lab.phase !== 'editing'}
              currentLine={lab.currentStep?.line}
              errorLine={lab.result?.error?.line}
            />
          </div>
          
          {lab.phase === 'editing' && (
            <div className="p-4 text-center border-t border-charcoal-700 bg-ink-800 text-sm text-slate-400 flex flex-col items-center gap-2 shrink-0">
              <p>“See your Python code think.”</p>
              <p className="text-xs max-w-lg">
                Write safe Python code. The environment restricts file access, network, and arbitrary execution. Max 1500 steps, 4s timeout.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Inspector */}
        {(lab.phase === 'visualizing' || lab.phase === 'error') && (
          <div className="w-full lg:w-1/2 flex flex-col bg-ink-900 min-h-[500px] lg:min-h-0 lg:h-full min-w-0 max-w-full overflow-hidden">
            <InspectorPanel lab={lab} />
          </div>
        )}
      </main>
    </div>
  );
}
