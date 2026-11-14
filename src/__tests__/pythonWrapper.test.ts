import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { PYTHON_WRAPPER_CODE } from '../lib/python-wrapper';
import { ExecutionResult, SerializedValue } from '../types/execution';
import { EXAMPLES } from '../lib/examples';

function runPythonWrapper(userCode: string): ExecutionResult {
  const runnerScript = `
${PYTHON_WRAPPER_CODE}
print(run_logiclab(${JSON.stringify(userCode)}))
`;
  try {
    const stdout = execSync('python', {
      input: runnerScript,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'] // capture stdout and stderr
    });
    return JSON.parse(stdout.trim()) as ExecutionResult;
  } catch (err: unknown) {
    const stderr = err instanceof Error && 'stderr' in err ? String((err as Record<string, unknown>).stderr) : '';
    throw new Error(`Python execution failed: ${stderr || (err instanceof Error ? err.message : String(err))}`);
  }
}

describe('Python Wrapper & AST Security Sandbox', () => {
  
  describe('AST Security Restrictions', () => {
    it('blocks import statements', () => {
      const res = runPythonWrapper('import math');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
      expect(res.error?.message).toContain('Imports are not allowed');
    });

    it('blocks from ... import statements', () => {
      const res = runPythonWrapper('from os import path');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
      expect(res.error?.message).toContain('Imports are not allowed');
    });

    it('blocks input() builtin', () => {
      const res = runPythonWrapper('input("enter name")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
      expect(res.error?.message).toContain("Function 'input' is not allowed");
    });

    it('blocks open() builtin', () => {
      const res = runPythonWrapper('open("test.txt", "r")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
    });

    it('blocks eval() builtin', () => {
      const res = runPythonWrapper('eval("1 + 1")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
    });

    it('blocks exec() builtin', () => {
      const res = runPythonWrapper('exec("x = 1")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
    });

    it('blocks compile() builtin', () => {
      const res = runPythonWrapper('compile("x = 1", "<string>", "exec")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
    });

    it('blocks __import__() builtin', () => {
      const res = runPythonWrapper('__import__("math")');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
    });

    it('blocks dunder attribute access', () => {
      const res = runPythonWrapper('x = 1\ny = x.__class__');
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('SecurityError');
      expect(res.error?.message).toContain('Access to dunder attributes is not allowed');
    });

    it('blocks globals(), locals(), and vars() builtins', () => {
      for (const builtin of ['globals', 'locals', 'vars']) {
        const res = runPythonWrapper(`${builtin}()`);
        expect(res.error).toBeDefined();
        expect(res.error?.name).toBe('SecurityError');
        expect(res.error?.message).toContain(`Function '${builtin}' is not allowed`);
      }
    });
  });

  describe('Basic Programming Constructs Tracing', () => {
    it('traces arithmetic programs', () => {
      const code = `x = 5\ny = 10\nz = x + y`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      expect(res.steps.length).toBeGreaterThanOrEqual(3);
      
      const lastStep = res.steps[res.steps.length - 1];
      expect(lastStep.locals.x).toEqual({ type: 'int', value: 5 });
      expect(lastStep.locals.y).toEqual({ type: 'int', value: 10 });
      expect(lastStep.locals.z).toEqual({ type: 'int', value: 15 });
    });

    it('traces if/else conditions', () => {
      const code = `
x = 10
if x > 5:
    res = 'greater'
else:
    res = 'smaller'
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.res).toEqual({ type: 'str', value: 'greater' });
    });

    it('traces for-loop with running total', () => {
      const code = `
total = 0
for i in range(3):
    total += i
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      const lastLocals = res.steps[res.steps.length - 1].locals;
      expect(lastLocals.total).toEqual({ type: 'int', value: 3 });
    });

    it('traces while loops', () => {
      const code = `
count = 3
while count > 0:
    count -= 1
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      const lastLocals = res.steps[res.steps.length - 1].locals;
      expect(lastLocals.count).toEqual({ type: 'int', value: 0 });
    });

    it('traces function calls and parameters', () => {
      const code = `
def add(a, b):
      return a + b
res = add(3, 4)
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      
      // Verify call step
      const callSteps = res.steps.filter(s => s.event === 'call' && s.functionName !== '<module>');
      expect(callSteps.length).toBe(1);
      expect(callSteps[0].functionName).toBe('add');
      expect(callSteps[0].locals.a).toEqual({ type: 'int', value: 3 });
      expect(callSteps[0].locals.b).toEqual({ type: 'int', value: 4 });

      // Verify return step
      const returnSteps = res.steps.filter(s => s.event === 'return' && s.functionName !== '<module>');
      expect(returnSteps.length).toBe(1);
      expect(returnSteps[0].returnValue).toEqual({ type: 'int', value: 7 });
    });

    it('traces recursive functions and call depths', () => {
      const code = `
def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)
res = fact(3)
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      
      const callSteps = res.steps.filter(s => s.event === 'call' && s.functionName !== '<module>');
      expect(callSteps.length).toBe(3); // fact(3), fact(2), fact(1)
      
      // Check depth tracking (fact(3) starts at depth 2 since <module> is depth 1)
      expect(callSteps[0].callDepth).toBe(2);
      expect(callSteps[1].callDepth).toBe(3);
      expect(callSteps[2].callDepth).toBe(4);

      // Verify stack snapshots for the call steps
      // For fact(3)
      const stack0 = callSteps[0].stack;
      expect(stack0).toBeDefined();
      expect(stack0?.length).toBe(2); // <module>, fact
      expect(stack0?.[0].functionName).toBe('<module>');
      expect(stack0?.[1].functionName).toBe('fact');
      expect(stack0?.[1].locals.n).toEqual({ type: 'int', value: 3 });

      // For fact(2)
      const stack1 = callSteps[1].stack;
      expect(stack1?.length).toBe(3); // <module>, fact, fact
      expect(stack1?.[1].locals.n).toEqual({ type: 'int', value: 3 });
      expect(stack1?.[2].locals.n).toEqual({ type: 'int', value: 2 });

      // For fact(1)
      const stack2 = callSteps[2].stack;
      expect(stack2?.length).toBe(4); // <module>, fact, fact, fact
      expect(stack2?.[1].locals.n).toEqual({ type: 'int', value: 3 });
      expect(stack2?.[2].locals.n).toEqual({ type: 'int', value: 2 });
      expect(stack2?.[3].locals.n).toEqual({ type: 'int', value: 1 });
    });

    it('traces nested function calls and captures stack frame snapshots', () => {
      const code = `
def outer_func(x):
    def inner_func(y):
        return x + y
    return inner_func(10)
res = outer_func(5)
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      
      // Find the step executing inside inner_func
      const innerStep = res.steps.find(s => s.functionName === 'inner_func' && s.event === 'line');
      expect(innerStep).toBeDefined();
      expect(innerStep?.stack).toBeDefined();
      expect(innerStep?.stack?.length).toBe(3); // <module>, outer_func, inner_func
      expect(innerStep?.stack?.[0].functionName).toBe('<module>');
      expect(innerStep?.stack?.[1].functionName).toBe('outer_func');
      expect(innerStep?.stack?.[2].functionName).toBe('inner_func');
      expect(innerStep?.stack?.[1].locals.x).toEqual({ type: 'int', value: 5 });
      expect(innerStep?.stack?.[2].locals.y).toEqual({ type: 'int', value: 10 });
    });

    it('handles print statements and standard output', () => {
      const code = `
print("hello")
print("world")
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeNull();
      expect(res.stdout).toBe('hello\nworld\n');
      
      // Trace steps should accumulate stdout
      const lastStep = res.steps[res.steps.length - 1];
      expect(lastStep.stdout).toBe('hello\nworld\n');
    });

    it('formats runtime exceptions correctly', () => {
      const code = `
def divide():
    return 10 / 0
divide()
`;
      const res = runPythonWrapper(code);
      expect(res.error).toBeDefined();
      expect(res.error?.name).toBe('ZeroDivisionError');
      expect(res.error?.message).toContain('division by zero');
      expect(res.error?.line).toBe(3); // points to line 3 inside user code
    });
  });

  describe('Value Serialization and Truncation', () => {
    it('serializes primitives', () => {
      const code = `
a = None
b = True
c = 1.5
d = "short string"
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.a).toEqual({ type: 'null', value: null });
      expect(locals.b).toEqual({ type: 'bool', value: true });
      expect(locals.c).toEqual({ type: 'float', value: 1.5 });
      expect(locals.d).toEqual({ type: 'str', value: 'short string' });
    });

    it('serializes complex structures (lists, tuples, dicts, sets)', () => {
      const code = `
lst = [1, 2]
tup = (3, 4)
st = {5, 6}
dct = {"a": 7}
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.lst).toEqual({
        type: 'list',
        value: [{ type: 'int', value: 1 }, { type: 'int', value: 2 }]
      });
      expect(locals.tup).toEqual({
        type: 'tuple',
        value: [{ type: 'int', value: 3 }, { type: 'int', value: 4 }]
      });
      expect(locals.st.type).toBe('set');
      expect(locals.dct).toEqual({
        type: 'dict',
        value: { "a": { type: 'int', value: 7 } }
      });
    });

    it('truncates deeply nested objects exceeding max depth (3)', () => {
      const code = `
# Nesting depth: 4
deep = [[[[42]]]]
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      // level 0: deep (list)
      // level 1: [ [[42]] ]
      // level 2: [ [42] ]
      // level 3: [ 42 ]
      // level 4: truncated
      expect(locals.deep.type).toBe('list');
      const lvl1 = (locals.deep.value as SerializedValue[])[0];
      const lvl2 = (lvl1.value as SerializedValue[])[0];
      const lvl3 = (lvl2.value as SerializedValue[])[0];
      expect((lvl3.value as SerializedValue[])[0]).toEqual({ type: 'truncated', value: 'Maximum nesting depth reached' });
    });

    it('truncates list items exceeding max limit (50)', () => {
      const code = `
large_list = list(range(60))
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.large_list.type).toBe('list');
      expect((locals.large_list.value as SerializedValue[]).length).toBe(51); // 50 items + 1 truncation marker
      expect((locals.large_list.value as SerializedValue[])[50]).toEqual({ type: 'truncated', value: '... more' });
    });

    it('truncates dictionary keys exceeding max limit (50)', () => {
      const code = `
large_dict = {str(i): i for i in range(60)}
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.large_dict.type).toBe('dict');
      expect((locals.large_dict.value as Record<string, SerializedValue>).__truncated__).toEqual({ type: 'truncated', value: '... more keys' });
    });

    it('truncates strings exceeding max length (200)', () => {
      const code = `
long_str = "x" * 250
`;
      const res = runPythonWrapper(code);
      const locals = res.steps[res.steps.length - 1].locals;
      expect(locals.long_str.type).toBe('str');
      expect((locals.long_str.value as string).length).toBe(215); // 200 + length of suffix "... (truncated)"
      expect((locals.long_str.value as string)).toContain('(truncated)');
    });
  });

  describe('Built-in Examples Integrity', () => {
    it('runs all built-in examples successfully without security violations', () => {
      EXAMPLES.forEach(example => {
        const res = runPythonWrapper(example.code);
        if (example.id === 'error') {
          expect(res.error).toBeDefined();
          expect(res.error?.name).not.toBe('SecurityError');
        } else {
          expect(res.error).toBeNull();
        }
        expect(res.steps.length).toBeGreaterThan(0);
      });
    });
  });
});
