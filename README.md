# LogicLab

“See your Python code think.”

LogicLab is an interactive Python execution visualizer for programming students. It helps users understand how code runs by letting them write Python code, execute it safely inside the browser, and move through execution one step at a time. 

## Features

- **Safe Execution**: Python code runs client-side within an isolated Web Worker using Pyodide, ensuring no network round-trips or server-side security risks.
- **Deterministic Execution Tracing**: Steps forward and backward through the code.
- **Variable Inspection**: See local variables update in real-time as you step through the code.
- **Call Stack Visualization**: Understand nested function calls and basic recursion.
- **Built-in Examples**: Ready-to-run examples demonstrating basic concepts like loops, conditionals, list mutation, and errors.
- **Aesthetic Developer Tool UI**: Deep ink and charcoal colors with a violet accent, resembling modern IDEs.

## Supported Python Concepts

The MVP supports educational programs containing:
- Primitive variables, arithmetic and comparison expressions
- Strings and booleans
- `if` / `elif` / `else`
- `for` and `while` loops
- Lists, dictionaries, tuples, sets
- User-defined functions, nested calls, basic recursion
- `print` statements, return values, common runtime exceptions

## Safety Restrictions

LogicLab uses Python AST validation and runtime checks to restrict execution:
- Execution occurs strictly in a Web Worker (no DOM access).
- No file system or network access (`open()`, `fetch()`, etc. are blocked).
- No imports (`import`, `__import__`).
- No dynamic execution (`eval()`, `exec()`, `compile()`).
- No standard input (`input()`).
- Hard limits on maximum execution steps (1500), output size (20,000 characters), and timeout (4s).

*Note: This is an educational sandbox for beginners, not a hardened security boundary for untrusted production workloads. Code is not intentionally uploaded to any LogicLab server.*

## Architecture

- **Next.js App Router**: Provides the React framework and structure.
- **Tailwind CSS**: Styling and layout.
- **CodeMirror 6**: Code editor component.
- **Pyodide**: Runs a full Python 3 environment in the browser via WebAssembly.
- **Python Wrapper**: Intercepts `sys.settrace` to capture execution state at every line/call/return and securely serializes data to the main thread.

## Installation & Local Development

1. **Clone the repository.**
2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
3. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open \`http://localhost:3000\` with your browser to see the result.

## Testing

LogicLab includes Vitest and React Testing Library for verifying execution state transitions.

\`\`\`bash
npm run test
\`\`\`

## Deployment

The application can be built and deployed on Vercel without a backend server:
\`\`\`bash
npm run build
\`\`\`

## Future Improvements

- Support for asynchronous Python functions.
- Multi-file projects.
- Better error highlighting directly inside the code editor lines via advanced CodeMirror extensions.
