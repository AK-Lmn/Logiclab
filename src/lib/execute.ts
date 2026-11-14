import { ExecutionResult } from '../types/execution';

const WORKER_TIMEOUT_MS = 4000;
const RUNTIME_START_TIMEOUT_MS = 30000;

let worker: Worker | null = null;
let initResolve: (() => void) | null = null;
let initReject: ((err: Error) => void) | null = null;
let executeResolve: ((res: string) => void) | null = null;
let executeReject: ((err: Error) => void) | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let initialization: Promise<void> | null = null;
let initialized = false;
let initTimeoutId: ReturnType<typeof setTimeout> | null = null;

const terminateWorker = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  initialized = false;
  initialization = null;
  if (initTimeoutId) clearTimeout(initTimeoutId);
  initTimeoutId = null;
};

const ensureWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
      type: 'classic',
    });
    
    worker.onmessage = (e) => {
      const { type, result, error } = e.data;
      if ((type === 'execute-success' || type === 'execute-error') && timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (type === 'init-success') {
        if (initTimeoutId) clearTimeout(initTimeoutId);
        initTimeoutId = null;
        initialized = true;
        if (initResolve) initResolve();
        initResolve = null;
        initReject = null;
      } else if (type === 'execute-success') {
        if (executeResolve) executeResolve(result);
        executeResolve = null;
        executeReject = null;
      } else if (type === 'init-error') {
        if (initReject) initReject(new Error(error));
        initResolve = null;
        initReject = null;
        terminateWorker();
      } else if (type === 'execute-error') {
        if (executeReject) executeReject(new Error(error));
        executeResolve = null;
        executeReject = null;
      }
    };
    
    worker.onerror = (err) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      const errorMsg = err instanceof ErrorEvent ? err.message : 'Worker error';
      if (initReject) {
        initReject(new Error(errorMsg));
      }
      if (executeReject) {
        executeReject(new Error(errorMsg));
      }
      initResolve = null;
      initReject = null;
      executeResolve = null;
      executeReject = null;
      terminateWorker();
    };
  }
  return worker;
};

export const initExecutionEngine = async (): Promise<void> => {
  if (initialized) return;
  if (initialization) return initialization;
  initialization = new Promise<void>((resolve, reject) => {
    const w = ensureWorker();
    initResolve = resolve;
    initReject = reject;
    initTimeoutId = setTimeout(() => {
      initReject?.(new Error('Python could not start. Check your connection and try again.'));
      initResolve = null;
      initReject = null;
      terminateWorker();
    }, RUNTIME_START_TIMEOUT_MS);
    w.postMessage({ id: Date.now(), action: 'init' });
  });
  return initialization;
};

export const executeCode = async (code: string): Promise<ExecutionResult> => {
  await initExecutionEngine();
  if (executeResolve) throw new Error('A program is already running. Wait for it to finish.');
  return new Promise<ExecutionResult>((resolve, reject) => {
    const w = ensureWorker();
    executeResolve = (jsonStr: string) => {
      try {
        const res = JSON.parse(jsonStr) as ExecutionResult;
        resolve(res);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };
    executeReject = reject;
    
    w.postMessage({ id: Date.now(), action: 'execute', code });
    
    timeoutId = setTimeout(() => {
      terminateWorker();
      resolve({
        steps: [],
        stdout: '',
        error: {
          name: 'TimeoutError',
          message: 'Execution exceeded the four-second time limit.',
          line: 1,
        },
        durationMs: WORKER_TIMEOUT_MS,
        truncated: true,
        truncationReason: 'Timeout'
      });
      executeResolve = null;
      executeReject = null;
    }, WORKER_TIMEOUT_MS);
  });
};
