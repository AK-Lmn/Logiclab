import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() { FakeWorker.instances.push(this); }
  emit(data: unknown) { this.onmessage?.({ data } as MessageEvent); }
}

beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); FakeWorker.instances = []; vi.stubGlobal('Worker', FakeWorker); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Python worker initialization and execution timeout', () => {
  it('shares one in-flight initialization across callers', async () => {
    const engine = await import('../lib/execute');
    const first = engine.initExecutionEngine();
    const second = engine.initExecutionEngine();
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    worker.emit({ type: 'init-success' });
    await Promise.all([first, second]);
  });

  it('waits for cold initialization before starting the execution-only timeout', async () => {
    const engine = await import('../lib/execute');
    const execution = engine.executeCode('print(1)');
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage.mock.calls[0][0].action).toBe('init');
    await vi.advanceTimersByTimeAsync(6000);
    worker.emit({ type: 'init-success' });
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.postMessage.mock.calls[1][0].action).toBe('execute');
    worker.emit({ type: 'execute-success', result: JSON.stringify({ steps: [], stdout: '1\n', durationMs: 1, truncated: false }) });
    expect((await execution).stdout).toBe('1\n');
  });

  it('does not let an initialization response cancel the execution timeout', async () => {
    const engine = await import('../lib/execute');
    const initialization = engine.initExecutionEngine();
    const worker = FakeWorker.instances[0];
    worker.emit({ type: 'init-success' });
    await initialization;
    let finished = false;
    const execution = engine.executeCode('while True: pass').then(result => { finished = true; return result; });
    await vi.advanceTimersByTimeAsync(0);
    worker.emit({ type: 'init-success' });
    await vi.advanceTimersByTimeAsync(4001);
    expect(finished).toBe(true);
    expect((await execution).error?.name).toBe('TimeoutError');
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
