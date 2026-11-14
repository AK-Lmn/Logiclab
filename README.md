# LogicLab

![LogicLab logo](brand/masters/logiclab-horizontal.svg)

“See your Python code think.”

LogicLab is an interactive Python execution visualizer for programming students. It helps users understand how code runs by letting them write Python code, execute it inside the browser, and step through execution one line at a time.

## Safety & Security Notice

> [!WARNING]
> **LogicLab is an educational playground, NOT a hardened security sandbox.**
>
> While Python execution runs client-side in an isolated Web Worker (leaving your main page responsive), it should **not** be used to run untrusted production code.
> - Code execution occurs strictly client-side inside the user's browser. No source code or execution trace is uploaded to external servers.
> - Pyodide requires loading dynamic runtime WebAssembly assets from the official public CDN (`https://cdn.jsdelivr.net/pyodide/`).

## Features

- **Isolated Client-Side Execution**: Code runs in a dedicated Web Worker using Pyodide, avoiding main thread lockups.
- **Deterministic Step-by-Step Tracing**: Play, pause, rewind, reset, or step line-by-line forward and backward through the execution trace.
- **Real-Time Variable Inspection**: Inspect local variables in the active scope, highlighted visually when their values change.
- **Visual Call Stack**: Recursion and function call trees update dynamically, displaying active frames and call depths.
- **Stdout & Error Logs**: Cumulative printed output is tracked step-by-step; runtime exceptions point to exact failure lines.

## Sandbox & Execution Limits

To ensure browser stability and safety, the sandbox enforces these hard limits:
- **Maximum Execution Steps**: 1,500 steps (prevents infinite loops from locking up the worker).
- **Execution Timeout**: 4,000 milliseconds (4 seconds).
- **Maximum Output Size**: 20,000 characters of stdout.
- **Maximum Source Length**: ~10,000 characters.

## Unsupported Syntax & Restrained Built-ins

To prevent dangerous operations and enforce a clean educational sandbox, the following features are rejected at the AST level or disabled dynamically:
- **Imports**: All `import` or `from ... import` statements are blocked.
- **File System**: `open()` and file access APIs are blocked.
- **Interactive Input**: `input()` is not supported.
- **Dynamic Introspection / Execution**: `eval()`, `exec()`, `compile()`, `globals()`, `locals()`, `vars()`, `breakpoint()`, and `__import__()` are disallowed.
- **Dunder Access**: Direct access to double-underscore variables/attributes (e.g. `obj.__class__`) is strictly blocked.
- **Concurrency**: Asynchronous code (`asyncio`), multithreading, or multiprocessing are not supported.

## Architecture

- **Next.js 16 (App Router)**: Framework & rendering.
- **TypeScript**: Typed safety across execution modules.
- **Tailwind CSS v4**: A paper-and-forest workspace with semantic design tokens and a dark code editor.
- **CodeMirror 6**: Direct editor integration with Python syntax, history, bracket pairing, and accessible keyboard navigation.
- **Pyodide (Wasm)**: Local Python runtime.
- **Python Wrapper**: Employs `sys.settrace` inside a wrapper to serialize trace steps, frame depths, print history, and variables.

## Identity

The Open Frame logo brings one observable block into view. The [identity kit](brand/README.md)
includes outlined SVG masters, PNGs, favicon and app icons, and a compact usage guide.
The app header and generated icon routes use the same geometric source.

## Installation & Local Development

Use Node.js 22.12 or later. Wrapper unit tests also require Python 3 on PATH.

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview.

## Testing

Verify the wrapper's AST parser, serialization, truncation rules, and state management:
```bash
npm run test
```

Run the production browser checks, including real Python execution, replacement confirmation,
keyboard controls, responsive layouts, accessibility scans, and long-source scrolling:

```bash
npm run build
npm run test:e2e
```

Browser tests use an installed Google Chrome in isolated headless sessions. The Python wrapper
unit tests require `python` on PATH. Design tokens live in `tokens/*.json`; run `npm run tokens`
after editing them. Development and production builds regenerate the CSS and app icon automatically.

Production builds use Next.js's supported Webpack builder. Development retains Turbopack.
The [verification notes](docs/verification.md) record the current behavior, checks, and limitations.
Browser reports, screenshots, and traces are written to the ignored `test-results/` directory.

The interface preserves partial traces after runtime errors. Changing an example requires a
confirmation before replacing nonempty code. All primary controls support keyboard use, and
optional motion respects reduced-motion preferences.

The first run records a trace for manual exploration with Play or Next step. Run again reruns
the program and automatically starts playback of the new trace.
Edit code clears the previous execution results while preserving the program.
The Run button shows Running… and stays disabled throughout execution and automatic playback.
It becomes available when playback finishes or pauses. The status above the editor distinguishes
preparation, execution, playback, pause, completion, and failure. Results, changed values, menus,
and dialogs use short transitions that respect reduced motion.

## Known Limitations

- **Internet Dependency**: The initial execution requires an internet connection to download Pyodide Wasm runtimes from JSDelivr CDN.
- **Worker Support**: Requires browsers that support HTML5 Web Workers.
