import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { InspectorPanel } from '../components/InspectorPanel';
import { PlaybackControls } from '../components/PlaybackControls';
import { useLogicLab } from '../hooks/useLogicLab';
import type { ExecutionResult, TraceStep } from '../types/execution';

const first: TraceStep = { id: 0, event: 'line', line: 1, functionName: '<module>', callDepth: 1, locals: { count: { type: 'int', value: 1 } }, stdout: '', stdoutDelta: '' };
const last: TraceStep = { ...first, id: 1, line: 2, locals: { count: { type: 'int', value: 2 } }, stdout: 'hello\n' };

function makeLab(overrides: Partial<ReturnType<typeof useLogicLab>> = {}) {
  const result: ExecutionResult = { steps: [first, last], stdout: 'hello\n', durationMs: 10, truncated: false };
  return { phase: 'visualizing', code: 'count = 1', setCode: vi.fn(), result, currentStepIndex: 1, currentStep: last, totalSteps: 2, isPlaying: false, playbackSpeed: 1, setPlaybackSpeed: vi.fn(), handleRun: vi.fn(), handleEdit: vi.fn(), nextStep: vi.fn(), prevStep: vi.fn(), jumpToFirst: vi.fn(), jumpToLast: vi.fn(), togglePlay: vi.fn(), reset: vi.fn(), ...overrides } as ReturnType<typeof useLogicLab>;
}

afterEach(cleanup);

describe('Execution workspace accessibility and outcomes', () => {
  it.each([
    ['loading-runtime', 'Preparing Python'],
    ['executing', 'Code is running'],
  ] as const)('shows the active %s state in the inspector', (phase, title) => {
    render(<InspectorPanel lab={makeLab({ phase, result: null, currentStep: null, totalSteps: 0 })} />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.queryByText('Ready when you are')).not.toBeInTheDocument();
  });

  it('declares active playback instead of a completed execution at the final step', () => {
    render(<InspectorPanel lab={makeLab({ isPlaying: true })} />);
    expect(screen.getByRole('heading', { name: 'Playing execution' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Execution complete' })).not.toBeInTheDocument();
  });

  it('declares a paused execution while recorded steps remain', () => {
    render(<InspectorPanel lab={makeLab({ currentStep: first, currentStepIndex: 0 })} />);
    expect(screen.getByRole('heading', { name: 'Execution paused' })).toBeInTheDocument();
  });

  it.each(['InternalError', 'TimeoutError'])('does not blame source line 1 for %s', name => {
    const lab = makeLab({ currentStep: null, totalSteps: 0 });
    lab.result = { steps: [], stdout: '', durationMs: 0, truncated: false, error: { name, message: 'Execution unavailable', line: 1 } };
    render(<InspectorPanel lab={lab} />);
    expect(screen.getByRole('alert')).not.toHaveTextContent('Line 1.');
  });

  it('shows a runtime exception with a partial trace instead of successful completion', () => {
    const lab = makeLab();
    lab.result = { ...lab.result!, error: { name: 'ZeroDivisionError', message: 'division by zero', line: 2 } };
    render(<InspectorPanel lab={lab} />);
    expect(screen.getByText(/ZeroDivisionError/)).toBeInTheDocument();
    expect(screen.queryByText('Execution Complete')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('division by zero');
  });

  it('makes changed variable meaning available without color', () => {
    render(<InspectorPanel lab={makeLab()} />);
    expect(screen.getByRole('columnheader', { name: 'Variable' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /count/ })).toBeInTheDocument();
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });

  it('names the edit action using its visible label', () => {
    render(<PlaybackControls lab={makeLab()} />);
    expect(screen.getByRole('button', { name: 'Edit code' })).toBeInTheDocument();
  });

  it('keeps partial-trace navigation available after a runtime failure', () => {
    const lab = makeLab();
    lab.result = { ...lab.result!, error: { name: 'ValueError', message: 'bad value', line: 2 } };
    render(<PlaybackControls lab={lab} />);
    expect(screen.getByRole('button', { name: /previous step/i })).toBeEnabled();
  });

  it('marks a caller variable changed after a nested function returns', () => {
    const returned: TraceStep = { ...first, id: 1, event: 'return', functionName: 'calculate', callDepth: 2, locals: {} };
    const result: ExecutionResult = { steps: [first, returned, last], stdout: '', durationMs: 1, truncated: false };
    render(<InspectorPanel lab={makeLab({ result, currentStepIndex: 2, totalSteps: 3 })} />);
    expect(screen.getByRole('rowheader', { name: /count/ })).toHaveTextContent('Changed');
  });

  it('does not compare a new call against a previous invocation at the same depth', () => {
    const returned: TraceStep = { ...first, event: 'return', functionName: 'calculate' };
    const called: TraceStep = { ...last, event: 'call', functionName: 'calculate' };
    const result: ExecutionResult = { steps: [returned, called], stdout: '', durationMs: 1, truncated: false };
    render(<InspectorPanel lab={makeLab({ result, currentStep: called })} />);
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
  });
});
