# LogicLab UX and design-system report

> Historical baseline audit. The user subsequently authorized fixes and a complete redesign. See the [verification notes](verification.md) for implemented changes, current checks, and remaining limits. Findings and line references below describe the original baseline.

Date: 14 November 2026, Asia/Manila

Repository baseline: `581435feb0cbf501b6246530199b82c47bb61053`

Scope: the `/` route, editing and execution flows, shared components, global styles, and existing tests.

Requested deliverable: a detailed report. No application fixes are included.

## Assessment

LogicLab has a clear educational purpose and a useful workspace structure. Its largest problem is incorrect feedback: a Python program that raises an exception can finish with an "Execution Complete" message and no error explanation. Readability and assistive-technology support also need attention before an accessibility conformance claim is appropriate.

Four high-priority findings concern execution feedback, contrast, control names, and status announcements. The remaining findings address selection consistency, change indicators, target sizing, tokens, states, motion, typography, and house rules. A visual redesign is not a prerequisite for fixing these problems.

The supplied skill targets WCAG AAA. This report identifies gaps against that target and distinguishes them from AA requirements and project-specific taste rules. It does not certify WCAG conformance.

## Evidence and limits

- **Reproduced:** four targeted tests exercised the existing hook and React components in JSDOM. The runtime-error test executed the real Python wrapper against the built-in Runtime Error example, then supplied its result to the hook. Only the browser execution transport and editor rendering were mocked.
- **Calculated:** contrast ratios use explicit foreground and background values declared in source. These are palette calculations, not browser-computed measurements of rendered pixels.
- **Source-confirmed:** attributes, state branches, theme definitions, and control implementations were inspected directly.
- **Pending:** real-browser geometry, focus visibility and restoration, screen-reader announcements, zoom, forced colors, and responsive screenshots remain unverified.

The earlier browser session reached the local editing screen. Interaction verification then stopped because Windows could not reliably determine the browser URL. The skill's render tools also lack Playwright in their module environment. These limits are recorded as unavailable checks, never passes.

## Product context and inventory

| Dimension | Current context |
| --- | --- |
| Domain | Developer education and Python execution tracing |
| Audience | Students learning variables, loops, functions, and recursion |
| Intended tone | Precise, calm, instructional |
| Primary task | Write code, run it, inspect each execution step |
| Layout | Header, editor, playback controls, variables, call stack, output |
| Existing visual language | Dark ink and charcoal surfaces with violet actions and syntax/status accents |
| Motion | Loading spin/pulse, color transitions, panel transitions |
| Components reviewed | LogicLabApp, EditorPanel, PlaybackControls, InspectorPanel, LogicLabMark |
| Source inventory | Nine button elements and three select elements; editing controls are duplicated for desktop and mobile |

| Flow state | Existing behavior | Main concern |
| --- | --- | --- |
| Editing | Examples and Run action surround the editor | Pickers lack names; blank code produces a silent no-op |
| Loading | Overlay and initializing message appear | No live status semantics or explicit focus handoff |
| Visualizing | Editor, playback, variables, stack, and output appear | Changes rely on visual styling; targets are compact |
| Completed | Final step displays completion | Runtime errors can incorrectly reach this state |
| Error before tracing | Error panel and Edit action appear | Error content has no explicit announcement semantics |

## Quality assessment

| Dimension | Assessment | Evidence |
| --- | --- | --- |
| Visual hierarchy | Partly established | Editor and primary action lead structurally; screenshots and rendered hierarchy remain unverified |
| Consistency | Needs work | Shared panels exist, but action classes, editor colors, and example controls have separate definitions |
| Accessibility | Known gaps | Contrast failures, unnamed controls, label/name mismatch, and missing status semantics |
| Usability | Needs work | Incorrect completion feedback and cancelled-selection mismatch are reproduced |
| Responsiveness | Source intent is sound; outcome unverified | Base column layouts and larger-screen overrides exist; tests inspect classes rather than geometry |
| Performance | Not assessed | No production build, timing profile, bundle analysis, or network benchmark was conducted for this report |

A numeric design score would imply a completed visual and interaction review. The available evidence does not support one.

## Prioritized findings

Priority meanings: **P1** has substantial impact on learning or access; **P2** affects usability or system quality; **P3** concerns polish or house-rule consistency.

| ID | Priority | Finding | Evidence |
| --- | --- | --- | --- |
| F01 | P1 | Runtime errors can be presented as successful completion | Reproduced |
| F02 | P1 | Primary-action text and editor gutter colors lack sufficient contrast | Calculated |
| F03 | P1 | Example pickers lack names; Edit's accessible name differs from its visible label | Reproduced and source-confirmed |
| F04 | P1 | Loading, completion, and error feedback lack announcement semantics | Reproduced and source-confirmed |
| F05 | P2 | Cancelling example replacement leaves a misleading selected value | Reproduced |
| F06 | P2 | Variable-change indication relies on color and tables lack explicit headers | Source-confirmed |
| F07 | P2 | Playback targets appear smaller than the AAA target | Source-derived estimate |
| F08 | P2 | Tokens are palette-based and split across CSS and component styles | Source-confirmed |
| F09 | P2 | Interactive states lack a consistent contract | Source-confirmed; rendered states pending |
| F10 | P2 | App-authored motion has no reduced-motion treatment | Source-confirmed |
| F11 | P3 | Font configuration and heading hierarchy need alignment | Source-confirmed |
| F12 | P3 | Native selects, a dash separator, and execution-line borders conflict with house rules | Static gates and source |

### F01: A failed program can look successful

Locations: [useLogicLab.ts:37](../src/hooks/useLogicLab.ts#L37), [InspectorPanel.tsx:12](../src/components/InspectorPanel.tsx#L12), [InspectorPanel.tsx:119](../src/components/InspectorPanel.tsx#L119).

The hook enters the error phase only when an error has no recorded steps. A runtime exception usually follows earlier steps, so the hook instead enters `visualizing`. The inspector derives error presentation from the phase alone. At the final step, it displays "Execution Complete" and suppresses the error panel.

The audit reproduced this with the built-in Runtime Error example. The Python wrapper returned `ZeroDivisionError` with a nonempty trace. The hook selected `visualizing`; the final inspector showed completion and no `ZeroDivisionError` message.

**Recommendation:** represent execution outcome separately from playback position. Retain partial-trace navigation, show the exception, and avoid success wording for a failed execution.

**Acceptance:** successful, syntax-error, runtime-error-with-trace, and timeout executions have distinct, truthful outcomes. A partial trace remains inspectable after failure.

### F02: Important text and hover icons lose contrast

Locations: [LogicLabApp.tsx:53](../src/components/LogicLabApp.tsx#L53), [LogicLabApp.tsx:97](../src/components/LogicLabApp.tsx#L97), [PlaybackControls.tsx:54](../src/components/PlaybackControls.tsx#L54), [EditorPanel.tsx:34](../src/components/EditorPanel.tsx#L34).

| Source-defined pair | Ratio | Result |
| --- | --- | --- |
| White on primary violet `#8b5cf6` | 4.23:1 | Fails AA and AAA for normal-size button text |
| White on hover violet `#a78bfa` | 2.72:1 | Fails normal text and the 3:1 graphical contrast threshold |
| Gutter text `#64748b` on `#22263d` | 3.12:1 | Below normal-text AA and AAA thresholds |
| Body text `#e2e8f0` on page `#0a0c16` | 15.82:1 | Passes the normal-text AAA threshold for this declared pair |

Run labels use small text, so the large-text exception does not apply. The Play icon inherits white and is also at risk on the hover fill. Gutter text is 14px and carries useful line information.

Normal text requires 4.5:1 at AA and 7:1 at AAA; large-text thresholds differ. [W3C minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html).

**Recommendation:** define foreground/background pairs for default, hover, focus, and pressed actions. Preserve sufficient contrast throughout the interaction instead of lightening the fill under white content. Give gutter text a readable semantic token.

**Acceptance:** applicable text pairs meet the chosen level in all rendered states; essential icons meet their graphical contrast requirement. Confirm against actual composed backgrounds.

### F03: Control names need to match their purposes and labels

Locations: [LogicLabApp.tsx:34](../src/components/LogicLabApp.tsx#L34), [LogicLabApp.tsx:78](../src/components/LogicLabApp.tsx#L78), [PlaybackControls.tsx:17](../src/components/PlaybackControls.tsx#L17), [EditorPanel.tsx:76](../src/components/EditorPanel.tsx#L76).

Both example selectors lack a label, `aria-label`, or `aria-labelledby`. JSDOM accessible-name calculation returned an empty name for each. Their selected option is a value, not a stable name for the control.

The desktop Edit button visibly says "Edit Code" while its accessible name is "Return to Editing". Speech users may try the visible wording and fail to match the control. The editor also has no app-supplied accessible label; its actual generated textbox needs a browser accessibility-tree check.

**Recommendation:** name the picker "Load example", make the Edit name contain its visible label, and label the code editor through CodeMirror's editor/content attributes. Relevant requirements include name/role/value and label-in-name. [WCAG 2.2](https://www.w3.org/TR/WCAG22/#name-role-value), [label-in-name](https://www.w3.org/TR/WCAG22/#label-in-name).

**Acceptance:** each visible input has a stable, descriptive accessible name. Visible action labels occur in their accessible names. Verify editor name, role, and read-only state in a real accessibility tree.

### F04: Status changes are visual only

Locations: [LogicLabApp.tsx:65](../src/components/LogicLabApp.tsx#L65), [InspectorPanel.tsx:106](../src/components/InspectorPanel.tsx#L106), [InspectorPanel.tsx:132](../src/components/InspectorPanel.tsx#L132).

The loading message has no status role or live-region ancestor. A targeted React test confirmed this. Completion text and the error panel similarly lack explicit announcement semantics. Starting a run removes its triggering button, and the application defines no corresponding focus handoff.

**Recommendation:** provide a stable, concise status region for waiting and final outcomes. Use appropriate error announcement semantics and expose busy state. Establish focus behavior when editing controls disappear and when the user returns to editing. Avoid announcing every autoplay step, which could overwhelm the user.

**Acceptance:** a screen-reader user receives loading and final outcomes without searching for changed content. Focus remains logical through Run and Edit. [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### F05: Cancelling an example creates a value/content mismatch

Locations: [LogicLabApp.tsx:36](../src/components/LogicLabApp.tsx#L36), [LogicLabApp.tsx:80](../src/components/LogicLabApp.tsx#L80).

The browser updates the uncontrolled selector before the confirmation handler runs. Cancelling preserves the code but leaves the new example selected. The audit reproduced a picker showing Runtime Error while the editor retained the original example. Selecting that same value again may produce no new change event.

**Recommendation:** track committed selection, or reset the picker after an attempted load. Keep selector value and editor contents consistent on both confirmation paths. Preserve protection against replacing user-written code.

**Acceptance:** cancelling leaves both code and displayed selection unchanged. The same example can be requested again immediately. Confirming replacement produces consistent content and selection at every breakpoint.

### F06: Variable changes and relationships need nonvisual equivalents

Location: [InspectorPanel.tsx:156](../src/components/InspectorPanel.tsx#L156).

Changed variables receive a violet row background, but no changed marker or programmatic description. The value remains readable, yet the extra meaning conveyed by the highlight is unavailable without perceiving color. Variable names and values also use only `td` cells, without column or row headers.

**Recommendation:** add a concise changed indication, associate names with values, and use suitable table headers. Keep the current stack's explicit "Current" label, which already complements its color treatment. [WCAG use of color](https://www.w3.org/TR/WCAG22/#use-of-color), [information and relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships).

**Acceptance:** users can identify which variable changed without color and understand each name/value relationship with assistive technology.

### F07: Compact playback targets need AAA sizing verification

Location: [PlaybackControls.tsx:31](../src/components/PlaybackControls.tsx#L31).

With the normal Tailwind spacing scale and a 16px root size, navigation buttons imply approximately 32px square targets on mobile and 28px on larger screens. Play implies 36px and 40px. These are source-derived estimates, not measured bounding boxes.

The AAA target-size criterion generally requires 44 by 44 CSS pixels, with specified exceptions. The AA minimum is a separate, less demanding criterion; a sub-44px control is not automatically an AA failure. [W3C enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

**Recommendation:** use a shared hit-area token that reaches the AAA target without requiring larger icons. Measure the complete toolbar at phone and intermediate widths before increasing spacing.

**Acceptance:** all applicable targets satisfy the chosen criterion and exceptions. The toolbar remains usable at 320px without clipped controls or accidental activation.

### F08: The theme has useful foundations but lacks semantic ownership

Locations: [globals.css:3](../src/app/globals.css#L3), [EditorPanel.tsx:16](../src/components/EditorPanel.tsx#L16), [layout.tsx:21](../src/app/layout.tsx#L21), [manifest.ts:10](../src/app/manifest.ts#L10).

Global CSS defines 12 color variables and is imported once by the root layout. Those are useful foundations. However, the variables describe palette colors rather than purpose. CodeMirror repeats raw colors, alpha colors, sizes, and font stacks. Metadata and icon assets also hold independent brand values. No project DTCG `tokens/` source exists.

The hardcode linter reports 115 raw-value flags. This is a triage list, not 115 confirmed design defects. It includes deliberate asset dimensions, palette utilities that already resolve through Tailwind variables, and prose such as execution-limit durations. The atlas separately counts 15 hex usages within its narrower scan.

**Recommendation:** centralize intent first. Preserve a single dark theme unless another theme is required. Reuse platform and Tailwind scales rather than replacing every utility with a custom abstraction.

| Semantic role | Current responsibility to consolidate |
| --- | --- |
| `text.primary`, `text.secondary`, `text.muted` | Page, panel, empty-state, and gutter readability |
| `surface.page`, `surface.panel`, `surface.raised` | Ink and charcoal surface hierarchy |
| `action.primary`, `action.primary.hover`, `text.on-action` | Run and playback action contrast |
| `action.destructive` | Destructive confirmations when applicable |
| `border.default`, `border.focus` | Separators and visible focus |
| `status.error`, `status.success`, `status.warning` | Execution outcomes |
| `editor.execution`, `editor.error`, `editor.changed` | Trace and variable indicators |
| `control.hit-area`, typography, spacing, motion | Shared dimensions and interaction behavior |

**Acceptance:** app styles and CodeMirror consume generated CSS variables from the same token source. Raw-value exceptions are deliberate and documented. Token alias and contrast checks run against the project's tokens.

### F09: Component states have inconsistent coverage

Locations: [LogicLabApp.tsx:51](../src/components/LogicLabApp.tsx#L51), [PlaybackControls.tsx:13](../src/components/PlaybackControls.tsx#L13), [useLogicLab.ts:25](../src/hooks/useLogicLab.ts#L25).

Run buttons have default and hover styling but no empty-source disabled treatment; submitting whitespace silently returns. Playback buttons define endpoint/error disabling, while focus and pressed feedback depend on browser defaults. There is no shared state contract for the duplicated Run and picker controls.

**Recommendation:** standardize applicable states through small shared primitives or class definitions. Preserve native button semantics. A normal action button does not need an artificial selected state; loading, error, and selected states should exist where their meanings apply.

**Acceptance:** invalid or empty source receives a clear response. All applicable states have predictable appearance, semantics, and focus behavior. Browser-provided behavior is measured before being declared missing.

### F10: Motion preferences have no app-level treatment

Locations: [LogicLabApp.tsx:67](../src/components/LogicLabApp.tsx#L67), [LogicLabApp.tsx:73](../src/components/LogicLabApp.tsx#L73), [globals.css](../src/app/globals.css).

Loading uses spin and pulse animations. Panel transitions use `transition-all` and a fixed duration. The reviewed app styles contain no reduced-motion media query or motion-reduction utility.

**Recommendation:** suppress optional pulsing and panel motion under reduced-motion preferences. Retain readable loading text. Restrict transitions to properties that need feedback, with shared duration/easing tokens.

**Acceptance:** reduced-motion users receive equivalent state information without optional movement. This source gap is not a blanket assertion that every loading animation violates WCAG.

### F11: Font and heading decisions need a single intent

Locations: [layout.tsx:5](../src/app/layout.tsx#L5), [globals.css:21](../src/app/globals.css#L21), [EditorPanel.tsx:25](../src/components/EditorPanel.tsx#L25), [InspectorPanel.tsx:149](../src/components/InspectorPanel.tsx#L149).

Geist font variables are configured, but the body and editor specify separate system stacks. Panel headings jump from the page's `h1` to `h3`. Several labels use 10px or 12px text. These choices weaken consistency even where they are not automatic WCAG failures.

The supplied skill also requests a display/body ratio of at least 2.5 and an 18-24 character display measure. The current workspace does not demonstrate that treatment. A large marketing-style title could reduce useful editor space, so this requirement needs a deliberate workspace-specific decision.

**Recommendation:** choose one interface font policy and one code font policy. Make panel hierarchy explicit and evaluate small labels with real screenshots and zoom. Let the editor remain the task's visual anchor.

**Acceptance:** configured fonts are intentionally consumed or removed, headings describe panel structure, and essential labels remain legible at zoom and narrow widths.

### F12: Separate house-rule violations from accessibility defects

Locations: [LogicLabApp.tsx:34](../src/components/LogicLabApp.tsx#L34), [PlaybackControls.tsx:97](../src/components/PlaybackControls.tsx#L97), [InspectorPanel.tsx:34](../src/components/InspectorPanel.tsx#L34), [EditorPanel.tsx:101](../src/components/EditorPanel.tsx#L101).

The supplied house rules ban native selects. There are three in source, including the duplicated example picker. The copy gate also finds one U+2014 separator in stack labels. Execution/error line CSS uses a colored left border, conflicting with the literal border rule, although it serves a functional trace-indicator purpose.

Native selects are not intrinsically accessibility defects. Replacing one introduces responsibility for keyboard behavior, naming, expanded/selected state, dismissal, and focus handling. If strict house-rule compliance is required, use one complete select-only combobox pattern across the pickers. [W3C combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

**Acceptance:** custom replacements retain keyboard and assistive-technology behavior; copy follows the requested punctuation rule; trace indicators retain their meaning if the border treatment changes.

## Interactive-state coverage

"Unverified" means no completed browser check exists. "Native" means the platform supplies behavior; it is not evidence that the rendered state passes every requirement.

| Control | Default | Hover | Focus | Active | Disabled | Loading | Error | Selected |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Run | Present, contrast gap | Present, contrast gap | Native, unverified | Native, unverified | Empty-source treatment missing | Trigger removed; global feedback gap | Global feedback gap | Not applicable |
| Example picker | Present, unnamed | Native | Border change; unverified | Native | Placeholder option only | Removed with editing UI | Not applicable | Present; cancellation mismatch |
| Play/Pause | Present | Contrast risk | Native, unverified | Native, unverified | Error phase | Not applicable | Depends on incorrect phase outcome | Action label changes with playback |
| Step/Reset | Present | Present | Native, unverified | Native, unverified | Endpoint/error rules present | Not applicable | No separate per-control error required | Not applicable |
| Speed | Present, named | Native | Border change; unverified | Native | Error phase | Not applicable | Not applicable | Controlled value present |
| Code editor | Dark theme | Not applicable | CodeMirror, unverified | CodeMirror, unverified | Editing disabled outside edit phase | Read-only presentation | CSS line treatment | CodeMirror selection, unverified |

## Mobile, keyboard, and assistive-technology verification plan

The source uses mobile-base column layouts, `min-w-0`, scrollable content, and larger-screen layout overrides. These are positive signals. Existing responsive tests check class strings and mock the editor; they do not establish reflow, hit areas, or absence of clipping.

| Test | Required evidence | Current status |
| --- | --- | --- |
| 320px and 375px editing | Complete controls, readable labels, usable editor | Pending |
| 320px and 375px playback | Every control reachable; inspector and long values remain usable | Pending |
| 640px to 1024px transitions | Header and playback toolbar fit at intermediate widths | Pending |
| Wide desktop | Clear editor/inspector hierarchy and sensible reading order | Pending |
| 125%, 200%, and reflow equivalent to 400% zoom | No hidden essential content or control overlap | Pending |
| Keyboard-only Run, playback, Edit | Logical focus order, visible focus, no trap, sensible restoration | Pending |
| NVDA or another screen reader | Names, state, variable relationships, and final outcomes understood | Pending |
| Reduced motion and forced colors | Equivalent feedback without color-only or motion-only meaning | Pending |
| Long source and long values | Correct trace highlighting, editor scrolling, and containment | Pending |

The editor's line highlight uses DOM `nth-child` selectors. Include long-source scrolling in browser QA before relying on it; its behavior with CodeMirror's rendered line structure was not reproduced in this report.

## Verification receipts

| Check | Result | Interpretation |
| --- | --- | --- |
| Existing project tests from the preceding audit | 33 passed across 3 files, exit 0 | Baseline unit/component checks, not browser conformance |
| Existing ESLint run | Exit 0 | No reported lint failures |
| Atlas verification TypeScript step | Passed | Compilation passed; the enclosing strict gate failed |
| Four temporary audit proof tests | 4 passed, exit 0 | Reproduced F01, unnamed example pickers, F05, and missing loading status semantics |
| Hardcode linter on `src` | 115 flags, exit 1 | Requires classification, not blind replacement |
| Native-select linter on `src` | 3 elements, exit 1 | House-rule failure |
| Copy/emoji/dash linter on `src` | 1 dash flag, exit 1 | No emoji finding was reported |
| Four explicit color-pair calculations | 3 below normal-text AA; 1 passes AAA | Source-defined pairs only |
| DTCG token validator | Exit 1: project `tokens` path absent | No project token JSON was validated |
| Semantic contrast validator | Exit 1: `tokens/colors.json` absent | No semantic-pair pass claim |
| Render-based intent gate with browser required | Exit 1: Playwright unavailable | Nothing was rendered or measured |
| Atlas strict clean gate from preceding audit | Exit 1: 15 hex usages | Repository is not token-clean |

The other render gates were not run: state contrast, axe, keyboard, target sizing, responsive scaling, mobile-first rendering, overflow, reduced motion, and strict visual-pattern checks require a valid rendered target and the missing browser tooling. Their status remains unverified. No build or performance pass is claimed.

The temporary proof test was removed after execution. It verified existing defects rather than adding regression tests to the product. [Machine-readable static-check output](./ux-ui-audit-evidence.json) records the fresh gate commands and exit codes.

### Corrections to automated atlas interpretation

1. The atlas says there are zero test files. The repository has three test suites, and the preceding run passed 33 tests.
2. Missing `dark:` counterparts are not proof of broken dark mode in an intentionally dark-only app. Contrast and actual surfaces are the relevant checks.
3. Native button tags are appropriate HTML. A missing `type="button"` is a useful defensive concern, but it is not an observed submission bug when no containing form exists.
4. "Verified Clean" in generated headers is not evidence of accessibility or token compliance. The strict gate fails.
5. Generated headers show 27 October 2026 even though this audit ran on 14 November 2026. Do not use that header as an execution timestamp.

## Remediation order and acceptance gates

### Batch 1: Correct outcomes and make actions perceivable

Address F01 through F04 first: truthful runtime-error presentation, action/gutter contrast, control names, and status/focus behavior. Preserve partial-trace playback. Add regression coverage for both empty-trace and nonempty-trace failures, then verify the full task with keyboard and a screen reader.

### Batch 2: Make repeated interaction predictable

Address cancellation consistency, changed-variable meaning, table relationships, empty-source feedback, and target sizing. Check intermediate widths as well as phone and desktop endpoints.

### Batch 3: Consolidate the existing system

Introduce semantic token ownership, connect CodeMirror and app styles, align font policy, and standardize applicable component states. Keep documented exceptions for fixed asset dimensions and functional limits where appropriate. Replace native selects only with a fully verified custom pattern if the house rule remains mandatory.

### Batch 4: Establish evidence for the chosen accessibility target

Restore browser verification tooling, capture the important states, and run the supplied rendering gates. Perform manual keyboard, screen-reader, reflow, motion, and forced-colors checks. Treat AAA as a complete-scope assessment, not a label earned by passing a few automated scripts.

The report is ready for prioritization. The product still has the defects and unverified checks recorded above.
