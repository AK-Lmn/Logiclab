import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogicLabApp } from '../components/LogicLabApp';
import { useLogicLab } from '../hooks/useLogicLab';
import { EXAMPLES } from '../lib/examples';

vi.mock('../hooks/useLogicLab', () => ({ useLogicLab: vi.fn() }));

vi.mock('../components/EditorPanel', () => ({
  EditorPanel: ({ code, readOnly }: { code: string; readOnly: boolean }) => <textarea aria-label="Python source code" value={code} readOnly={readOnly} onChange={() => {}} />,
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(cleanup);

function lab(overrides: Partial<ReturnType<typeof useLogicLab>> = {}) {
  return { phase: 'editing', code: EXAMPLES[0].code, setCode: vi.fn(), result: null, currentStepIndex: 0, currentStep: null, totalSteps: 0, isPlaying: false, playbackSpeed: 1, setPlaybackSpeed: vi.fn(), handleRun: vi.fn(), handleEdit: vi.fn(), nextStep: vi.fn(), prevStep: vi.fn(), jumpToFirst: vi.fn(), jumpToLast: vi.fn(), togglePlay: vi.fn(), reset: vi.fn(), ...overrides } as ReturnType<typeof useLogicLab>;
}
beforeEach(() => { vi.mocked(useLogicLab).mockReturnValue(lab()); });

describe('LogicLab workspace flows', () => {
  it('provides one named example picker and a named editor at every breakpoint', () => {
    render(<LogicLabApp />);
    expect(screen.getByRole('main', { name: 'Python workspace' })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: /Example program Variables/ })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Python source code' })).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Run code' })).toBeEnabled();
  });

  it('preserves code and the committed example when replacement is cancelled', async () => {
    const user = userEvent.setup();
    const state = lab();
    vi.mocked(useLogicLab).mockReturnValue(state);
    render(<LogicLabApp />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Runtime Error' }));
    expect(screen.getByRole('dialog', { name: 'Replace your current code?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep my code' }));
    expect(state.setCode).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveAccessibleName(/Variables & Arithmetic/);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('replaces code only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const state = lab();
    vi.mocked(useLogicLab).mockReturnValue(state);
    render(<LogicLabApp />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Function Calls' }));
    expect(state.setCode).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Replace code' }));
    expect(state.setCode).toHaveBeenCalledWith(EXAMPLES.find(example => example.id === 'functions')!.code);
  });

  it('exposes loading and prevents a duplicate run', () => {
    vi.mocked(useLogicLab).mockReturnValue(lab({ phase: 'loading-runtime' }));
    render(<LogicLabApp />);
    expect(screen.getByRole('group', { name: 'Python editor' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Preparing Python. Please wait.');
    expect(screen.getByRole('button', { name: 'Running…' })).toBeDisabled();
  });

  it.each([
    ['executing', false, 'Code is running'],
    ['visualizing', true, 'Playing execution'],
  ] as const)('declares %s activity in the live status', (phase, isPlaying, declaration) => {
    vi.mocked(useLogicLab).mockReturnValue(lab({ phase, isPlaying }));
    render(<LogicLabApp />);
    expect(screen.getByRole('status')).toHaveTextContent(declaration);
  });

  it('prevents another run during playback and restores Run again when playback finishes', async () => {
    const user = userEvent.setup();
    const state = lab({ phase: 'visualizing', isPlaying: true, result: { steps: [], stdout: '', durationMs: 1, truncated: false } });
    vi.mocked(useLogicLab).mockReturnValue(state);
    const { rerender } = render(<LogicLabApp />);
    const running = screen.getByRole('button', { name: 'Running…' });
    expect(running).toBeDisabled();
    expect(running).toHaveAttribute('aria-busy', 'true');
    await user.click(running);
    expect(state.handleRun).not.toHaveBeenCalled();

    vi.mocked(useLogicLab).mockReturnValue({ ...state, isPlaying: false });
    rerender(<LogicLabApp />);
    const again = screen.getByRole('button', { name: 'Run again' });
    expect(again).toBeEnabled();
    expect(again).toHaveAttribute('aria-busy', 'false');
    await user.click(again);
    expect(state.handleRun).toHaveBeenCalledOnce();
  });

  it('explains why an empty program cannot run', () => {
    vi.mocked(useLogicLab).mockReturnValue(lab({ code: '  \n' }));
    render(<LogicLabApp />);
    expect(screen.getByRole('button', { name: 'Run code' })).toBeDisabled();
    expect(screen.getByText('Add Python code to enable Run code.')).toBeInTheDocument();
  });
});
