import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, Mock } from 'vitest';
import { LogicLabApp } from '../components/LogicLabApp';
import { useLogicLab } from '../hooks/useLogicLab';

// Mock execution hook
vi.mock('../hooks/useLogicLab', () => ({
  useLogicLab: vi.fn(),
}));

// Mock CodeMirror Editor to avoid JSdom library issues
vi.mock('../components/EditorPanel', () => ({
  EditorPanel: () => <div data-testid="editor-panel" />,
}));

describe('LogicLab Responsive Layout Check', () => {
  it('renders editor and responsive selectors in editing phase', () => {
    // Mock the state for editing phase
    (useLogicLab as Mock).mockReturnValue({
      phase: 'editing',
      code: 'print("hello")',
      setCode: vi.fn(),
      result: null,
      currentStepIndex: 0,
      currentStep: null,
      totalSteps: 0,
      isPlaying: false,
      playbackSpeed: 1,
      setPlaybackSpeed: vi.fn(),
      handleRun: vi.fn(),
      handleEdit: vi.fn(),
    });

    render(<LogicLabApp />);

    // Main element should exist and be flex-col lg:flex-row
    const main = screen.getByRole('main');
    expect(main.className).toContain('flex-col');
    expect(main.className).toContain('lg:flex-row');
    expect(main.className).toContain('overflow-y-auto');
    expect(main.className).toContain('lg:overflow-hidden');

    // Header logo wrapper is shrink-0
    const logoContainer = screen.getByText('LogicLab').closest('h1');
    expect(logoContainer).toBeDefined();

    // Editor column container should exist and be w-full max-w-full min-w-0
    const editorWrapper = screen.getByTestId('editor-panel').parentElement;
    expect(editorWrapper).toBeDefined();
    expect(editorWrapper?.className).toContain('max-w-full');
    expect(editorWrapper?.className).toContain('min-w-0');
  });

  it('renders correctly ordered elements in visualizing phase', () => {
    // Mock the state for visualizing phase
    (useLogicLab as Mock).mockReturnValue({
      phase: 'visualizing',
      code: 'print("hello")',
      setCode: vi.fn(),
      result: {
        steps: [
          { id: 1, event: 'line', line: 1, functionName: '<module>', callDepth: 1, locals: {}, stdout: '', stdoutDelta: '' }
        ],
        stdout: '',
        durationMs: 10,
        truncated: false
      },
      currentStepIndex: 0,
      currentStep: { id: 1, event: 'line', line: 1, functionName: '<module>', callDepth: 1, locals: {}, stdout: '', stdoutDelta: '' },
      totalSteps: 1,
      isPlaying: false,
      playbackSpeed: 1,
      setPlaybackSpeed: vi.fn(),
      handleRun: vi.fn(),
      handleEdit: vi.fn(),
    });

    const { container } = render(<LogicLabApp />);

    // Playback controls wrapper should have flex ordering classes: order-2 lg:order-1
    const playbackControlsWrapper = screen.getByTestId('playback-controls-wrapper');
    expect(playbackControlsWrapper).toBeDefined();
    expect(playbackControlsWrapper?.className).toContain('order-2');
    expect(playbackControlsWrapper?.className).toContain('lg:order-1');

    // Editor panel wrapper should have flex ordering classes: order-1 lg:order-2
    const editorWrapper = screen.getByTestId('editor-panel').parentElement;
    expect(editorWrapper).toBeDefined();
    expect(editorWrapper?.className).toContain('order-1');
    expect(editorWrapper?.className).toContain('lg:order-2');

    // Inspector panels grid should collapse below lg breakpoint
    const inspectorGrid = container.querySelector('.grid');
    expect(inspectorGrid).toBeDefined();
    expect(inspectorGrid?.className).toContain('grid-cols-1');
    expect(inspectorGrid?.className).toContain('lg:grid-cols-2');
  });
});
