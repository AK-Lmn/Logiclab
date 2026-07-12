import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useLogicLab } from '../hooks/useLogicLab';
import * as executeModule from '../lib/execute';
import { EXAMPLES } from '../lib/examples';

vi.mock('../lib/execute', () => ({
  initExecutionEngine: vi.fn().mockResolvedValue(undefined),
  executeCode: vi.fn(),
}));

describe('useLogicLab Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with editing phase and first example code', () => {
    const { result } = renderHook(() => useLogicLab());
    expect(result.current.phase).toBe('editing');
    expect(result.current.code).toBe(EXAMPLES[0].code);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('handleRun switches to visualizing phase on success', async () => {
    const mockResult = {
      steps: [
        { id: 1, event: 'line' as const, line: 1, functionName: '', callDepth: 0, locals: {}, stdout: '', stdoutDelta: '' }
      ],
      stdout: '',
      durationMs: 10,
      truncated: false
    };
    
    vi.spyOn(executeModule, 'executeCode').mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useLogicLab());
    
    await act(async () => {
      await result.current.handleRun();
    });

    expect(result.current.phase).toBe('visualizing');
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('handleRun switches to error phase when execution fails', async () => {
    const mockResult = {
      steps: [],
      stdout: '',
      error: { name: 'SyntaxError', message: 'invalid syntax', line: 1 },
      durationMs: 10,
      truncated: false
    };
    
    vi.spyOn(executeModule, 'executeCode').mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useLogicLab());
    
    await act(async () => {
      await result.current.handleRun();
    });

    expect(result.current.phase).toBe('error');
    expect(result.current.result).toEqual(mockResult);
  });

  it('handles stepping forward and backward', async () => {
    const mockResult = {
      steps: [
        { id: 1, event: 'line' as const, line: 1, functionName: '', callDepth: 0, locals: {}, stdout: '', stdoutDelta: '' },
        { id: 2, event: 'line' as const, line: 2, functionName: '', callDepth: 0, locals: {}, stdout: '', stdoutDelta: '' }
      ],
      stdout: '',
      durationMs: 10,
      truncated: false
    };
    
    vi.spyOn(executeModule, 'executeCode').mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useLogicLab());
    
    await act(async () => {
      await result.current.handleRun();
    });

    expect(result.current.currentStepIndex).toBe(0);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    act(() => {
      result.current.nextStep();
    });
    // Should not exceed bounds
    expect(result.current.currentStepIndex).toBe(1);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStepIndex).toBe(0);
  });
});
