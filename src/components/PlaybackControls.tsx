import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, Edit2, RotateCcw } from 'lucide-react';
import { useLogicLab } from '../hooks/useLogicLab';
import { Select } from './Select';

interface PlaybackControlsProps {
  lab: ReturnType<typeof useLogicLab>;
  onEdit?: () => void;
}

export function PlaybackControls({ lab, onEdit }: PlaybackControlsProps) {
  const empty = lab.totalSteps === 0;
  const controls = [
    { label: 'Jump to start', icon: Rewind, action: lab.jumpToFirst, disabled: empty || lab.currentStepIndex === 0 },
    { label: 'Previous step', icon: SkipBack, action: lab.prevStep, disabled: empty || lab.currentStepIndex === 0 },
    { label: lab.isPlaying ? 'Pause' : 'Play', icon: lab.isPlaying ? Pause : Play, action: lab.togglePlay, disabled: empty },
    { label: 'Next step', icon: SkipForward, action: lab.nextStep, disabled: empty || lab.currentStepIndex >= lab.totalSteps - 1 },
    { label: 'Jump to end', icon: FastForward, action: lab.jumpToLast, disabled: empty || lab.currentStepIndex >= lab.totalSteps - 1 },
    { label: 'Reset', icon: RotateCcw, action: lab.reset, disabled: empty },
  ];

  return (
    <div className="playback-controls" aria-label="Execution playback">
      <div className="playback-navigation">
        <button type="button" className="btn btn--secondary edit-button" onClick={onEdit || lab.handleEdit}>
          <Edit2 aria-hidden="true" /> Edit code
        </button>
        <div className="step-buttons" role="group" aria-label="Trace navigation">
          {controls.map(({ label, icon: Icon, action, disabled }) => (
            <button key={label === 'Pause' ? 'Play' : label} type="button" className={`btn btn--secondary icon-button${label === 'Play' || label === 'Pause' ? ' playback-toggle' : ''}`} onClick={action} disabled={disabled} aria-label={label} title={label} aria-controls="execution-inspector code-editor">
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div className="playback-meta">
        <span className="step-count">Step <strong>{empty ? 0 : lab.currentStepIndex + 1}</strong> of {lab.totalSteps}</span>
        <Select label="Playback speed" compact value={String(lab.playbackSpeed)} onChange={value => lab.setPlaybackSpeed(Number(value))} disabled={empty} options={[0.5, 1, 1.5, 2, 4].map(speed => ({ value: String(speed), label: `${speed}x` }))} />
      </div>
    </div>
  );
}
