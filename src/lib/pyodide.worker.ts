import { PYTHON_WRAPPER_CODE } from './python-wrapper';

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<string>;
  globals: {
    set: (name: string, value: string) => void;
  };
}

interface WorkerGlobal {
  importScripts: (...urls: string[]) => void;
  loadPyodide: () => Promise<PyodideInstance>;
  postMessage: (message: unknown) => void;
  addEventListener: (
    type: string,
    listener: (event: MessageEvent<{ id: number; code: string; action: string }>) => void
  ) => void;
}

const workerGlobal = (typeof self !== 'undefined' ? self : {}) as unknown as WorkerGlobal;

let pyodide: PyodideInstance | null = null;

const loadPyodideFromCDN = async (): Promise<PyodideInstance> => {
  if (pyodide) return pyodide;
  
  workerGlobal.importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
  
  // @ts-expect-error loadPyodide is loaded dynamically from importScripts
  pyodide = await loadPyodide();
  
  if (!pyodide) {
    throw new Error('Failed to initialize Pyodide instance.');
  }
  
  await pyodide.runPythonAsync(PYTHON_WRAPPER_CODE);
  return pyodide;
};

workerGlobal.addEventListener('message', async (e) => {
  const { id, code, action } = e.data;
  
  if (action === 'init') {
    try {
      await loadPyodideFromCDN();
      workerGlobal.postMessage({ id, type: 'init-success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      workerGlobal.postMessage({ id, type: 'init-error', error: message });
    }
    return;
  }
  
  if (action === 'execute') {
    try {
      const p = await loadPyodideFromCDN();
      
      p.globals.set('_user_code', code);
      const jsonResult = await p.runPythonAsync('run_logiclab(_user_code)');
      
      workerGlobal.postMessage({ id, type: 'execute-success', result: jsonResult });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      workerGlobal.postMessage({ id, type: 'execute-error', error: message });
    }
  }
});
