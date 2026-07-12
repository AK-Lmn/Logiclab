export type SerializedValue =
  | { type: 'null'; value: null }
  | { type: 'bool'; value: boolean }
  | { type: 'int'; value: number }
  | { type: 'float'; value: number }
  | { type: 'str'; value: string }
  | { type: 'list'; value: SerializedValue[] }
  | { type: 'tuple'; value: SerializedValue[] }
  | { type: 'dict'; value: Record<string, SerializedValue> }
  | { type: 'set'; value: SerializedValue[] }
  | { type: 'unsupported'; value: string }
  | { type: 'truncated'; value: string };

export type TraceEvent = 'line' | 'call' | 'return' | 'exception';

export type TraceStep = {
  id: number;
  event: TraceEvent;
  line: number;
  functionName: string;
  callDepth: number;
  locals: Record<string, SerializedValue>;
  stdout: string;
  stdoutDelta: string;
  returnValue?: SerializedValue;
  exception?: {
    name: string;
    message: string;
  };
};

export type ExecutionResult = {
  steps: TraceStep[];
  stdout: string;
  error?: {
    name: string;
    message: string;
    line: number;
  };
  durationMs: number;
  truncated: boolean;
  truncationReason?: string;
};

export type AppPhase =
  | 'editing'
  | 'loading-runtime'
  | 'executing'
  | 'visualizing'
  | 'error';
