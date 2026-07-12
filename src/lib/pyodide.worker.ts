import { PYTHON_WRAPPER_CODE } from './python-wrapper';

declare const self: any;

let pyodide: any = null;

// Pyodide loads via script injection typically, but in a worker we can use importScripts
// if we point to a CDN. We'll use the official Pyodide CDN.
const loadPyodideFromCDN = async () => {
  if (pyodide) return pyodide;
  
  self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
  
  // @ts-expect-error global function loaded from script
  pyodide = await loadPyodide();
  
  // Load our wrapper function
  await pyodide.runPythonAsync(PYTHON_WRAPPER_CODE);
  return pyodide;
};

self.addEventListener('message', async (e: any) => {
  const { id, code, action } = e.data;
  
  if (action === 'init') {
    try {
      await loadPyodideFromCDN();
      self.postMessage({ id, type: 'init-success' });
    } catch (err: any) {
      self.postMessage({ id, type: 'init-error', error: err.message });
    }
    return;
  }
  
  if (action === 'execute') {
    try {
      const p = await loadPyodideFromCDN();
      
      // We pass the code by escaping it safely or by setting a global variable
      p.globals.set('_user_code', code);
      const jsonResult = await p.runPythonAsync('run_logiclab(_user_code)');
      
      self.postMessage({ id, type: 'execute-success', result: jsonResult });
    } catch (err: any) {
      self.postMessage({ id, type: 'execute-error', error: err.message });
    }
  }
});
