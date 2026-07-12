import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, Edit2 } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';

interface PlaybackControlsProps {
  lab: ReturnType<typeof useLogicLab>;
}

export function PlaybackControls({ lab }: PlaybackControlsProps) {
  const isError = lab.phase === 'error';

  return (
    <div className="flex items-center gap-4 bg-charcoal-800 rounded-lg p-2 border border-charcoal-700 shadow-sm shadow-ink-900/50">
      
      <button 
        onClick={lab.handleEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-charcoal-700 rounded transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit Code
      </button>

      <div className="w-px h-6 bg-charcoal-700 mx-1"></div>

      <div className="flex items-center gap-1">
        <button 
          onClick={lab.jumpToFirst}
          disabled={lab.currentStepIndex === 0 || isError}
          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          title="Jump to Start"
        >
          <Rewind className="w-4 h-4" />
        </button>
        
        <button 
          onClick={lab.prevStep}
          disabled={lab.currentStepIndex === 0 || isError}
          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          title="Previous Step (Left Arrow)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button 
          onClick={lab.togglePlay}
          disabled={isError}
          className={"w-10 h-10 flex items-center justify-center rounded-full transition-colors mx-1 " + (isError ? 'bg-charcoal-700 text-slate-500' : 'bg-violet-500 text-white hover:bg-violet-400 shadow-sm shadow-violet-900/50')}
          title={lab.isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {lab.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button 
          onClick={lab.nextStep}
          disabled={lab.currentStepIndex >= lab.totalSteps - 1 || isError}
          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          title="Next Step (Right Arrow)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button 
          onClick={lab.jumpToLast}
          disabled={lab.currentStepIndex >= lab.totalSteps - 1 || isError}
          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-charcoal-700 rounded disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          title="Jump to End"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-charcoal-700 mx-1"></div>

      <div className="flex items-center gap-2">
        <select
          value={lab.playbackSpeed}
          onChange={(e) => lab.setPlaybackSpeed(Number(e.target.value))}
          disabled={isError}
          className="bg-charcoal-900 border border-charcoal-700 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
          <option value={4}>4.0x</option>
        </select>
        
        <div className="text-xs text-slate-500 font-medium min-w-[70px] text-right">
          Step {lab.totalSteps > 0 ? lab.currentStepIndex + 1 : 0} / {lab.totalSteps}
        </div>
      </div>
      
    </div>
  );
}
