import { useState, useEffect, useRef, useCallback } from 'react';
import { AppPhase, ExecutionResult } from '../types/execution';
import { initExecutionEngine, executeCode } from '../lib/execute';
import { EXAMPLES } from '../lib/examples';

export function useLogicLab() {
  const [phase, setPhase] = useState<AppPhase>('editing');
  const [code, setCode] = useState<string>(EXAMPLES[0].code);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initExecutionEngine().catch(console.error);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRun = async () => {
    if (!code.trim()) return;
    const replay = phase !== 'editing' && result !== null;
    
    setPhase('loading-runtime');
    setResult(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    
    try {
      await initExecutionEngine();
      setPhase('executing');
      const res = await executeCode(code);
      setResult(res);
      setIsPlaying(replay && res.steps.length > 1);
      
      if (res.error && res.steps.length === 0) {
        setPhase('error');
      } else {
        setPhase('visualizing');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown execution error';
      setResult({
        steps: [],
        stdout: '',
        error: { name: 'InternalError', message: errMsg, line: 1 },
        durationMs: 0,
        truncated: false
      });
      setPhase('error');
    }
  };

  const handleEdit = () => {
    setIsPlaying(false);
    setResult(null);
    setCurrentStepIndex(0);
    setPhase('editing');
  };

  const currentStep = result?.steps[currentStepIndex] || null;
  const totalSteps = result?.steps.length || 0;

  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, Math.min(prev + 1, totalSteps - 1)));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const jumpToFirst = useCallback(() => setCurrentStepIndex(0), []);
  const jumpToLast = useCallback(() => setCurrentStepIndex(totalSteps > 0 ? totalSteps - 1 : 0), [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const intervalMs = 1000 / (1.5 * playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, totalSteps]);

  const togglePlay = () => {
    if (totalSteps === 0) return;
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(p => !p);
    }
  };

  return {
    phase,
    code,
    setCode,
    result,
    currentStepIndex,
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    handleRun,
    handleEdit,
    nextStep,
    prevStep,
    jumpToFirst,
    jumpToLast,
    togglePlay,
    reset
  };
}
