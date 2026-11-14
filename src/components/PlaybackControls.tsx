import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, Edit2, RotateCcw } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';

interface PlaybackControlsProps {
  lab: ReturnType<typeof useLogicLab>;
}

export function PlaybackControls({ lab }: PlaybackControlsProps) {
  const isError = lab.phase === 'error';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-charcoal-800 rounded-lg p-2 border border-charcoal-700 shadow-sm shadow-ink-900/50 w-full sm:w-auto">
      
      {/* Edit and Navigation Controls */}
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto border-b border-charcoal-700/50 pb-2 sm:pb-0 sm:border-b-0">
        <button 
          onClick={lab.handleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-charcoal-700 rounded transition-colors shrink-0 cursor-pointer"
          title="Return to Editing"
          aria-label="Return to Editing"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Code</span>
          <span className="inline sm:hidden">Edit</span>
        </button>

        <div className="w-px h-6 bg-charcoal-700 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button 
            onClick={lab.jumpToFirst}
            disabled={lab.currentStepIndex === 0 || isError}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Jump to Start"
            aria-label="Jump to Start"
          >
            <Rewind className="w-4 h-4" />
          </button>
          
          <button 
            onClick={lab.prevStep}
            disabled={lab.currentStepIndex === 0 || isError}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Previous Step"
            aria-label="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button 
            onClick={lab.togglePlay}
            disabled={isError}
            className={"w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors mx-1 shrink-0 cursor-pointer " + (isError ? 'bg-charcoal-700 text-slate-500' : 'bg-violet-500 text-white hover:bg-violet-400 shadow-sm shadow-violet-900/50')}
            title={lab.isPlaying ? "Pause" : "Play"}
            aria-label={lab.isPlaying ? "Pause" : "Play"}
          >
            {lab.isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
          </button>

          <button 
            onClick={lab.nextStep}
            disabled={lab.currentStepIndex >= lab.totalSteps - 1 || isError}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Next Step"
            aria-label="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button 
            onClick={lab.jumpToLast}
            disabled={lab.currentStepIndex >= lab.totalSteps - 1 || isError}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Jump to End"
            aria-label="Jump to End"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button 
            onClick={lab.reset}
            disabled={isError}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Reset"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-px h-6 bg-charcoal-700 mx-1 hidden sm:block"></div>

      {/* Speed and Step Info */}
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-1 sm:px-0">
        <select
          value={lab.playbackSpeed}
          onChange={(e) => lab.setPlaybackSpeed(Number(e.target.value))}
          disabled={isError}
          className="bg-charcoal-900 border border-charcoal-700 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-violet-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Playback Speed"
          aria-label="Playback Speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
          <option value={4}>4.0x</option>
        </select>
        
        <div className="text-xs text-slate-500 font-medium min-w-[70px] text-right sm:text-left font-mono">
          Step {lab.totalSteps > 0 ? lab.currentStepIndex + 1 : 0} / {lab.totalSteps}
        </div>
      </div>
      
    </div>
  );
}
