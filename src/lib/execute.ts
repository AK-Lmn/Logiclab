import { ExecutionResult } from '../types/execution';

const WORKER_TIMEOUT_MS = 4000;

let worker: Worker | null = null;
let currentResolve: ((res: any) => void) | null = null;
let currentReject: ((err: any) => void) | null = null;
let timeoutId: any = null;

const terminateWorker = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
};

const ensureWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
      type: 'classic',
    });
    
    worker.onmessage = (e) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      const { type, result, error } = e.data;
      if (type === 'init-success' || type === 'execute-success') {
        if (currentResolve) currentResolve(result);
      } else if (type === 'init-error' || type === 'execute-error') {
        if (currentReject) currentReject(new Error(error));
      }
      
      currentResolve = null;
      currentReject = null;
    };
    
    worker.onerror = (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentReject) currentReject(err);
      terminateWorker();
    };
  }
  return worker;
};

export const initExecutionEngine = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const w = ensureWorker();
    currentResolve = resolve;
    currentReject = reject;
    w.postMessage({ id: Date.now(), action: 'init' });
  });
};

export const executeCode = async (code: string): Promise<ExecutionResult> => {
  return new Promise((resolve, reject) => {
    const w = ensureWorker();
    currentResolve = (jsonStr: string) => {
      try {
        const res = JSON.parse(jsonStr) as ExecutionResult;
        resolve(res);
      } catch (e) {
        reject(e);
      }
    };
    currentReject = reject;
    
    w.postMessage({ id: Date.now(), action: 'execute', code });
    
    timeoutId = setTimeout(() => {
      terminateWorker();
      resolve({
        steps: [],
        stdout: '',
        error: {
          name: 'TimeoutError',
          message: 'Execution exceeded the time limit (4000ms).',
          line: 1,
        },
        durationMs: WORKER_TIMEOUT_MS,
        truncated: true,
        truncationReason: 'Timeout'
      });
    }, WORKER_TIMEOUT_MS);
  });
};
