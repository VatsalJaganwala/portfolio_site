# DevMode Implementation Reference
### Flutter Portfolio — Jaspr Web Framework
> **For AI Agent use.** Read this entire document before writing a single line of code. Every behaviour, visual detail, interaction, and state transition is defined here. Do not assume anything not written here.

---

## Implementation Phases Overview

This implementation is divided into **four phases**:

- **Phase 1 (Core Foundation)**: Basic DevTools shell, static widget tree, properties panel, debug console, and exit mechanics
- **Phase 2 (Interactivity & Polish)**: Scroll sync, bounding boxes, reactive console logs, live properties, and full mobile support
- **Phase 3 (Advanced Features)**: Widget tree search, collapsible console sections, performance metrics, and enhanced animations
- **Phase 4 (Easter Eggs & Refinements)**: Hidden features, keyboard shortcuts, theme variations, and final optimizations

**Current Document Scope**: Phase 1 (Core Foundation)

---

## Table of Contents

### Core Documentation
1. [Project Context](#1-project-context)
2. [Tech Stack & Constraints](#2-tech-stack--constraints)
3. [Design Tokens](#3-design-tokens)
4. [File Structure](#4-file-structure)
5. [State Architecture](#5-state-architecture)

### Phase 1 — Core Foundation
6. [Task 1 — Debug Pill (Normal Mode Trigger)](#task-1--debug-pill-normal-mode-trigger)
7. [Task 2 — Flutter Run Transition Overlay](#task-2--flutter-run-transition-overlay)
8. [Task 3 — DevTools Shell Layout](#task-3--devtools-shell-layout)
9. [Task 4 — DevTools Tab Bar](#task-4--devtools-tab-bar)
10. [Task 5 — Widget Tree Panel](#task-5--widget-tree-panel)
11. [Task 6 — Main Content Area (Dev Mode Overlays)](#task-6--main-content-area-dev-mode-overlays)
12. [Task 7 — Properties Panel](#task-7--properties-panel)
13. [Task 8 — Debug Console](#task-8--debug-console)
14. [Task 9 — Reactive Console Logs](#task-9--reactive-console-logs)
15. [Task 10 — Performance Tab](#task-10--performance-tab)
16. [Task 11 — Exit Mechanic](#task-11--exit-mechanic)
17. [Task 12 — Mobile Layout](#task-12--mobile-layout)
18. [Task 13 — Final Integration & Polish](#task-13--final-integration--polish)
19. [Component Checklist](#component-checklist)

### Future Phases
20. [Phase 2 — Interactivity & Polish](#phase-2--interactivity--polish)
21. [Phase 3 — Advanced Features](#phase-3--advanced-features)
22. [Phase 4 — Easter Eggs & Refinements](#phase-4--easter-eggs--refinements)

---

## 1. Project Context

This document defines the full implementation of a **Developer Mode** feature for a Flutter developer portfolio website built with **Jaspr** (a Dart-first web framework). 

### Concept Summary

The portfolio has two modes:

| Mode | Audience | Description |
|------|----------|-------------|
| **Normal Mode** | Everyone | Clean, dark-themed portfolio. Professional and readable. |
| **Developer Mode** | Flutter devs | The entire UI transforms into a fake Flutter DevTools session. The portfolio *pretends to be a running Flutter app being inspected.* |

### The Core Illusion
The visitor becomes a developer inspecting your portfolio as if it were a live Flutter app. The Widget Tree shows your portfolio sections as widget nodes. The Properties Panel shows fake widget properties. The Debug Console logs their interactions in real time. Everything uses Flutter's actual DevTools visual language — colours, typography, layout, terminology.

### Phase 1 Scope

Phase 1 establishes the **core foundation** with these deliverables:

**✅ Included in Phase 1:**
- Debug pill activation trigger (normal mode)
- Flutter run transition overlay with animated logs
- Complete DevTools shell layout (4-zone grid)
- Static widget tree panel with accordion behavior
- Properties panel with static node data
- Debug console with initial log entries
- Performance tab (decorative flame graph)
- Exit mechanic (q key + exit button)
- Basic mobile layout with bottom tab bar
- All CSS design tokens and styling

**❌ Deferred to Phase 2:**
- Bidirectional scroll synchronization (content ↔ tree)
- Dynamic bounding box overlays on hover
- Reactive console logs (interaction triggers)
- Live property updates (hover states, animations)
- Section annotation labels in content area
- Git commit badges on experience entries
- Idle detection and advanced event listeners

**Phase 1 Goal**: A visually complete, navigable DevTools interface that looks production-ready but has limited interactivity. Users can explore the tree, switch tabs, and exit cleanly.

---

## 2. Tech Stack & Constraints

| Item | Detail |
|------|--------|
| Framework | [Jaspr](https://jaspr.site) — Dart web framework |
| Language | **Dart only.** No raw JS files. |
| JS Interop | Allowed only for `dart:html` keyboard/scroll/mouse event listeners |
| Layout | CSS Flexbox and CSS Grid. **No Flutter Column/Row/Stack.** |
| Styling | CSS written via Jaspr's `styles` attribute or a global CSS file |
| State | `StatefulComponent` + `setState()`. One top-level bool `isDevMode`. Pass via `InheritedComponent`. |
| Animations | **CSS `@keyframes` and `transition` only.** No Dart timers for visual effects. |
| Class toggling | Use Jaspr's `classes` attribute. Toggle by rebuilding with new class list. |
| Event listeners | Register in `initState()` via `dart:html`. Store `StreamSubscription`. Cancel ALL in `dispose()`. |
| Fonts | `JetBrains Mono` (monospace, all DevTools panels). Site's existing font for main content. |

### Jaspr-Specific Rules

- Components: `StatelessComponent`, `StatefulComponent`, `InheritedComponent`
- Rendering: `build()` returns `Iterable<Component>`
- Events: `onClick`, `onMouseEnter`, `onMouseLeave` as Jaspr event attributes
- Scroll detection: `dart:html`'s `window.onScroll` or element `.onScroll`
- Do NOT use `flutter/material.dart` — this is web, not Flutter

---

## 3. Design Tokens

Define all of the following as CSS custom properties at `:root` level. These are **additive** — they extend the existing site's CSS variables without replacing them.

```css
:root {
  /* DevTools chrome */
  --dt-bg:            #1E2227;   /* Main DevTools background */
  --dt-sidebar-bg:    #21252B;   /* Widget tree + properties background */
  --dt-border:        #3E4451;   /* All panel borders and dividers */
  --dt-tab-bg:        #282C34;   /* Inactive tab background */
  --dt-tab-active:    #1E2227;   /* Active tab background */
  --dt-overlay-bg:    #0D1117;   /* flutter run overlay + console body */

  /* DevTools text */
  --dt-text:          #ABB2BF;   /* Default text */
  --dt-text-dim:      #5C6370;   /* Secondary / dimmed text */
  --dt-text-dark:     #3E4451;   /* Timestamps, very faint items */

  /* Syntax colours — used across tree, properties, console */
  --dt-blue:          #61AFEF;   /* Widget names, selected nodes, bounding boxes, links */
  --dt-orange:        #E5C07B;   /* Property keys, debug/command text */
  --dt-green:         #98C379;   /* String values, success logs, pill dot */
  --dt-purple:        #C678DD;   /* Type references, Dart keywords */
  --dt-red:           #E06C75;   /* Error logs, exit button */
  --dt-cyan:          #56B6C2;   /* Info logs */
  --dt-yellow:        #D19A66;   /* Numeric values */

  /* Selection */
  --dt-selection-bg:  rgba(97, 175, 239, 0.15);
  --dt-hover-bg:      rgba(97, 175, 239, 0.08);
  --dt-bound-bg:      rgba(97, 175, 239, 0.06);
  --dt-bound-border:  #61AFEF;

  /* DevTools font */
  --dt-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --dt-font-size: 12px;
  --dt-line-height: 1.6;
}
```

---

## 4. File Structure

Create files exactly as named below. Do not merge components.

```
lib/
├── state/
│   ├── dev_mode_state.dart          # InheritedComponent — mode + callbacks
│   └── console_log_controller.dart  # Manages log entry list
│
├── components/
│   ├── dev_mode/
│   │   ├── dev_mode_pill.dart           # Floating trigger pill (normal mode)
│   │   ├── flutter_run_overlay.dart     # Full-screen transition animation
│   │   ├── dev_mode_shell.dart          # Outer 4-zone layout container
│   │   ├── devtools_tab_bar.dart        # Top tab row (36px)
│   │   ├── widget_tree_panel.dart       # Left sidebar (280px)
│   │   ├── main_content_wrapper.dart    # Centre — portfolio + overlays
│   │   ├── bounding_box_overlay.dart    # Absolute-positioned highlights
│   │   ├── properties_panel.dart        # Right sidebar (260px)
│   │   ├── debug_console.dart           # Bottom panel (180px)
│   │   ├── performance_tab.dart         # Decorative flame graph view
│   │   └── dev_mode_exit_button.dart    # Exit button (conditional)
│   │
│   └── portfolio/                       # Your existing site components
│       └── [existing files unchanged]
│
└── app.dart                             # Top-level StatefulComponent
```

---

## 5. State Architecture

### `dev_mode_state.dart`

```dart
class DevModeState extends InheritedComponent {
  final bool isDevMode;
  final bool isTransitioning;       // true during flutter run animation
  final void Function() enterDevMode;
  final void Function() exitDevMode;
  final ConsoleLogController console;

  const DevModeState({
    required this.isDevMode,
    required this.isTransitioning,
    required this.enterDevMode,
    required this.exitDevMode,
    required this.console,
    required super.child,
  });

  static DevModeState of(BuildContext context) =>
    context.dependOnInheritedComponentOfExactType<DevModeState>()!;

  @override
  bool updateShouldNotify(DevModeState old) =>
    old.isDevMode != isDevMode || old.isTransitioning != isTransitioning;
}
```

### `console_log_controller.dart`

```dart
enum LogLevel { info, debug, warning, error, command }

class LogEntry {
  final LogLevel level;
  final String message;
  final String timestamp; // "HH:MM:SS"
  final bool isCommand;   // true for "> flutter stop" lines
  LogEntry({required this.level, required this.message, 
            required this.timestamp, this.isCommand = false});
}

class ConsoleLogController {
  final List<LogEntry> entries = [];
  void Function()? onUpdate;  // called after every addLog

  void addLog(LogLevel level, String message) {
    final now = DateTime.now();
    final ts = '${now.hour.toString().padLeft(2,'0')}:'
               '${now.minute.toString().padLeft(2,'0')}:'
               '${now.second.toString().padLeft(2,'0')}';
    entries.add(LogEntry(level: level, message: message, timestamp: ts));
    onUpdate?.call();
  }

  void addCommand(String command) {
    entries.add(LogEntry(level: LogLevel.command, message: command,
                         timestamp: '', isCommand: true));
    onUpdate?.call();
  }

  void clear() {
    entries.clear();
    onUpdate?.call();
  }
}
```

### `app.dart` — Top-level state

The top-level `StatefulComponent` holds:

```dart
bool _isDevMode = false;
bool _isTransitioning = false;
bool _showExitButton = false;
final ConsoleLogController _console = ConsoleLogController();

void _enterDevMode() {
  setState(() => _isTransitioning = true);
  // Overlay plays for ~4.5s, then:
  Future.delayed(Duration(milliseconds: 4500), () {
    setState(() {
      _isTransitioning = false;
      _isDevMode = true;
    });
  });
}

void _exitDevMode() {
  // Log entries added in exit mechanic before this is called
  Future.delayed(Duration(milliseconds: 350), () {
    setState(() {
      _isDevMode = false;
      _isTransitioning = false;
      _showExitButton = false;
    });
  });
}
```

### Rendering logic in `app.dart` `build()`:

```
if _isTransitioning  → render normal site BEHIND overlay + FlutterRunOverlay on top
if _isDevMode        → render DevModeShell (which contains portfolio inside it)
else                 → render normal site + DevModePill
```

---

## Task 1 — Debug Pill (Normal Mode Trigger)

**File:** `lib/components/dev_mode/dev_mode_pill.dart`  
**Visible when:** `isDevMode == false && isTransitioning == false`

### Position & Container

```css
.debug-pill {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 12px;
  background: rgba(30, 34, 39, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(97, 175, 239, 0.35);
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-text);
  user-select: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.debug-pill:hover {
  border-color: rgba(97, 175, 239, 0.7);
  box-shadow: 0 0 16px rgba(97, 175, 239, 0.2);
}
```

### Pill Contents (left → right)

| Element | Detail |
|---------|--------|
| Green dot | `8px × 8px` circle, `background: #98C379`, `border-radius: 50%`, CSS `pulse` animation |
| Debug text | `"● debug"` — colour `#E5C07B` |
| Separator | `1px` vertical line, `height: 14px`, `background: rgba(255,255,255,0.1)` |
| Version text | `"v2.3.1+42"` — colour `#5C6370` |

### Green Dot Pulse Animation

```css
@keyframes pill-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(152, 195, 121, 0.5); }
  50%       { box-shadow: 0 0 0 5px rgba(152, 195, 121, 0); }
}
.pill-dot {
  width: 8px; height: 8px;
  background: #98C379;
  border-radius: 50%;
  animation: pill-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
```

### Tooltip

- Appears **600ms after hover begins** (use CSS `transition-delay` or a Dart `Timer`)
- Text: `"Open Flutter DevTools"`
- Position: centered above pill, `8px` gap below tooltip
- Style: same `background` and `border` as pill, `font-size: 10px`, `border-radius: 6px`, `padding: 4px 10px`
- Implemented as a child `div` with `position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%)`
- Hidden by default (`opacity: 0; pointer-events: none`), shown on parent hover via CSS

### Click Action

Calls `DevModeState.of(context).enterDevMode()`.

### Mobile adjustment

On viewport width `< 1024px`:
- `bottom: 80px` (avoid overlap with any existing mobile UI)
- `padding: 5px 12px 5px 10px`
- `font-size: 10px`

---

## Task 2 — Flutter Run Transition Overlay

**File:** `lib/components/dev_mode/flutter_run_overlay.dart`  
**Visible when:** `isTransitioning == true`  
**Duration:** `~4.5 seconds` total before dev mode shows

### Overlay Container

```css
.flutter-run-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0D1117;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px 48px 48px;
  font-family: var(--dt-font);
  font-size: 13px;
  line-height: 1.8;
  color: var(--dt-text);
  animation: overlay-fade-in 0.25s ease forwards;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### Progress Bar (top of overlay)

```css
.overlay-progress {
  position: absolute;
  top: 0; left: 0;
  height: 3px;
  background: linear-gradient(90deg, #61AFEF, #C678DD);
  animation: progress-grow 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes progress-grow {
  from { width: 0%; }
  to   { width: 100%; }
}
```

### Log Lines

Each line is a `<span>` or `<div>` with individual animation delay. Use:

```css
@keyframes log-appear {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.log-line {
  display: block;
  animation: log-appear 0.2s ease forwards;
  animation-fill-mode: both;
  opacity: 0;
}
```

**Complete log lines, delays, and colours:**

| Delay | Colour | Text |
|-------|--------|------|
| `0.1s` | `#5C6370` | `$ flutter run -d chrome --debug` |
| `0.4s` | `#ABB2BF` | `Launching lib/main.dart on Chrome in debug mode...` |
| `0.8s` | `#5C6370` | `Running Gradle task 'assembleDebug'...` |
| `1.2s` | `#98C379` | `✓  Built build/web/main.dart.js` |
| `1.6s` | `#ABB2BF` | `Syncing files to device Chrome...` |
| `2.0s` | — | *(empty line)* |
| `2.1s` | `#ABB2BF` | `Flutter run key commands.` |
| `2.3s` | `#E5C07B` | `r  Hot reload. 🔥🔥🔥` |
| `2.5s` | `#E5C07B` | `R  Hot restart.` |
| `2.7s` | `#61AFEF` | `v  Open Flutter DevTools.` |
| `2.9s` | `#ABB2BF` | `q  Quit (terminate the application).` |
| `3.2s` | — | *(empty line)* |
| `3.3s` | `#5C6370` | `An Observatory debugger and profiler on Chrome is available at:` |
| `3.5s` | `#61AFEF` | `http://127.0.0.1:9102/yourPortfolioToken=/` |
| `3.7s` | — | *(empty line)* |
| `3.8s` | `#ABB2BF` | `Opening DevTools in the browser...` |

### Blinking Cursor (delay: `4.0s`)

Appears on a new line after the last log line:

```css
.terminal-cursor {
  display: inline-block;
  width: 8px; height: 14px;
  background: #61AFEF;
  vertical-align: middle;
  animation: cursor-blink 1s step-end infinite;
  animation-delay: 4.0s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

### Completion Trigger

In `initState()`, register:

```dart
Future.delayed(Duration(milliseconds: 4300), () {
  widget.onComplete(); // calls enterDevMode completion in parent
});
```

### Skip Button

```
Position:  absolute, top: 20px, right: 24px
Text:      "Skip →"
Style:     font-family monospace, font-size 11px, colour #5C6370
           background transparent, border none, cursor pointer
Hover:     colour #ABB2BF
Action:    call onComplete() immediately (same callback as auto-trigger)
```

---

## Task 3 — DevTools Shell Layout

**File:** `lib/components/dev_mode/dev_mode_shell.dart`  
**Visible when:** `isDevMode == true`

### Outer Container

```css
.devtools-shell {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  background: var(--dt-bg);
  animation: devtools-slide-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes devtools-slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Exit animation class (applied before unmount)

```css
.devtools-shell.exiting {
  animation: devtools-slide-out 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes devtools-slide-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(12px); }
}
```

### Zone Layout (Desktop — `>= 1024px`)

```
┌────────────────────────────────────────────────────────────────┐
│  DevTools Tab Bar                                  height: 36px│
├─────────────────┬──────────────────────┬───────────────────────┤
│  Widget Tree    │  Main Content Area   │  Properties Panel     │
│  280px fixed    │  flex: 1             │  260px fixed          │
│  overflow-y:auto│  overflow-y: auto    │  overflow-y: auto     │
├─────────────────┴──────────────────────┴───────────────────────┤
│  Debug Console                               height: 180px     │
│  (collapsible — 0px when collapsed)                            │
└────────────────────────────────────────────────────────────────┘
```

```css
.devtools-main-row {
  display: grid;
  grid-template-columns: 280px 1fr 260px;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid var(--dt-border);
  border-bottom: 1px solid var(--dt-border);
  min-height: 0; /* critical for flex children to shrink */
}

.devtools-panel {
  overflow-y: auto;
  height: 100%;
}
```

### Scrollbar Styling (scoped to dev mode)

```css
.devtools-shell ::-webkit-scrollbar        { width: 6px; }
.devtools-shell ::-webkit-scrollbar-track  { background: transparent; }
.devtools-shell ::-webkit-scrollbar-thumb  { background: #3E4451; border-radius: 3px; }
.devtools-shell ::-webkit-scrollbar-thumb:hover { background: #5C6370; }
```

---

## Task 4 — DevTools Tab Bar

**File:** `lib/components/dev_mode/devtools_tab_bar.dart`  
**Height:** `36px`

```css
.dt-tab-bar {
  height: 36px;
  background: var(--dt-tab-bg);
  border-bottom: 1px solid var(--dt-border);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
}
```

### Left — App identity

```
[Flutter "F" SVG icon — 14×14px, blue]  [space 8px]
[text: "portfolio | Flutter DevTools"  — 11px, colour #5C6370]
[space 16px]
[vertical separator — 1px, height 20px, background #3E4451]
```

Flutter "F" SVG: Use the official Flutter icon mark. Can be inlined as SVG or referenced as an asset.

### Tabs (after a flex spacer that pushes tabs left-center)

Four tabs rendered as a row:

| Tab Label | ID | Functional in Phase 1? |
|-----------|-----|------------------------|
| `Flutter Inspector` | `inspector` | ✅ Yes — default active |
| `Performance` | `performance` | ✅ Yes — shows Performance tab view |
| `Memory` | `memory` | ❌ No — click does nothing |
| `Logging` | `logging` | ❌ No — click does nothing |

```css
.dt-tab {
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-family: var(--dt-font);
  font-size: 12px;
  color: var(--dt-text-dim);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  border-top: 2px solid transparent; /* prevent layout shift */
  transition: color 0.15s, border-color 0.15s;
  user-select: none;
  white-space: nowrap;
}

.dt-tab:hover {
  color: var(--dt-text);
}

.dt-tab.active {
  color: var(--dt-text);
  border-bottom-color: var(--dt-blue);
  background: var(--dt-tab-active);
}
```

State: `String _activeTab = 'inspector'` inside the shell's state. Clicking a functional tab calls `setState(() => _activeTab = id)`.

### Right — Connection status + Exit Button

```
[6px green dot — #98C379]  [space 6px]  ["Connected" — 11px #5C6370]
[space 12px]
[Exit Button — conditional, see Task 11]
[space 16px]
```

---

## Task 5 — Widget Tree Panel

**File:** `lib/components/dev_mode/widget_tree_panel.dart`  
**Width:** `280px` | **Background:** `var(--dt-sidebar-bg)` | **Border-right:** `1px solid var(--dt-border)`

### Panel Header

```
Height: 32px
Padding: 0 12px
Display: flex, align-items: center, justify-content: space-between

Left:  "Widget tree"  — 11px, uppercase, font-weight 600, colour #5C6370, letter-spacing 0.8px
Right: Refresh icon "↺"  — 14px, colour #5C6370, cursor pointer (cosmetic only in Phase 1)
```

### Search Bar

```css
.dt-tree-search {
  display: block;
  width: calc(100% - 16px);
  margin: 4px 8px 8px;
  padding: 5px 8px 5px 26px;
  background: rgba(255,255,255,0.05);
  border: 1px solid #3E4451;
  border-radius: 4px;
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-text);
  outline: none;
}
.dt-tree-search::placeholder { color: var(--dt-text-dim); }
```

Search icon (`🔍`) is a `span` positioned `absolute` inside a `relative` wrapper, `left: 8px`, `font-size: 12px`.  
**Phase 1:** Input is visible but non-functional (cosmetic).

### Tree Node Structure

Every node is a single `div`:

```css
.tree-node {
  height: 28px;          /* 32px on mobile */
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  font-family: var(--dt-font);
  font-size: 12px;
  padding-right: 8px;
  /* padding-left set dynamically: indent * 16px */
}

.tree-node:hover         { background: var(--dt-hover-bg); }
.tree-node.active        { background: var(--dt-selection-bg);
                           border-left: 2px solid var(--dt-blue); }
```

**Node inner structure (left → right):**

1. `Toggle arrow` — `span`, `font-size: 9px`, `width: 14px`, `text-align: center`, colour `#5C6370`
   - `"▶"` when collapsed, `"▼"` when expanded
   - If node has no children: render a `"─"` at the same size
2. `Widget name` — `span`, colour `var(--dt-blue)`, `font-weight: 400`
3. `Opening paren` — `span`, colour `#5C6370`, text `"("`
4. `Args` — `span`, colour `var(--dt-orange)`, `font-size: 11px` (empty string if node has no args)
5. `Closing paren` — `span`, colour `#5C6370`, text `")"`

### Complete Node Definitions

The tree is a flat list. `indentLevel` determines `padding-left: indentLevel * 16px`.

```
ID: 'material-app'    label: 'MaterialApp'              args: ''                              indent: 0  hasChildren: true  section: —
ID: 'scaffold'        label: 'Scaffold'                  args: ''                              indent: 1  hasChildren: true  section: —
ID: 'app-bar'         label: 'AppBar'                    args: 'title: Text("YourName.dev")'   indent: 2  hasChildren: false section: —
ID: 'body'            label: 'SingleChildScrollView'     args: ''                              indent: 2  hasChildren: true  section: —
ID: 'hero-section'    label: 'Hero'                      args: 'tag: "flutter-developer"'      indent: 3  hasChildren: false section: 'hero'
ID: 'projects'        label: 'ProjectsSection'           args: 'itemCount: 3'                  indent: 3  hasChildren: true  section: 'projects'
ID: 'project-1'       label: 'ProjectCard'               args: 'title: "TaskFlow"'             indent: 4  hasChildren: false section: —
ID: 'project-2'       label: 'ProjectCard'               args: 'title: "PulseAI"'              indent: 4  hasChildren: false section: —
ID: 'project-3'       label: 'ProjectCard'               args: 'title: "Vault"'                indent: 4  hasChildren: false section: —
ID: 'about'           label: 'AboutSection'              args: ''                              indent: 3  hasChildren: false section: 'about'
ID: 'experience'      label: 'ExperienceTimeline'        args: 'entries: 3'                    indent: 3  hasChildren: false section: 'experience'
ID: 'contact'         label: 'ContactSection'            args: ''                              indent: 3  hasChildren: false section: 'contact'
ID: 'fab'             label: 'FloatingActionButton'      args: 'onPressed: HireCallback'       indent: 2  hasChildren: false section: —
```

### Accordion State

```dart
// in widget_tree_panel state:
Map<String, bool> _expanded = {};
String? _activeSection; // tracks current scroll position

bool isExpanded(String id) => _expanded[id] ?? false;

void toggleNode(String id, List<String> siblingIds) {
  final wasExpanded = isExpanded(id);
  // collapse all siblings at same level
  for (final s in siblingIds) {
    _expanded[s] = false;
  }
  // toggle self
  _expanded[id] = !wasExpanded;
  setState(() {});
}
```

A node only renders its children when `isExpanded(id) == true`.

### Scroll Synchronisation

**Content → Tree (scroll tracking):**

Register a scroll listener on the main content area's scroll container. As the user scrolls, check which section's top offset is nearest to the viewport top. Update `_activeSection`. The matching tree node gets class `active`.

Implement section offset detection by assigning `id` attributes to each portfolio section div (e.g., `id="section-hero"`), then reading `element.getBoundingClientRect().top`.

**Tree → Content (click navigation):**

When a tree node with a `section` value is clicked, call:
```dart
document.getElementById('section-${node.section}')
        ?.scrollIntoView(ScrollIntoViewOptions(behavior: 'smooth'));
```

Also trigger the bounding box highlight for that section (see Task 6).

---

## Task 6 — Main Content Area (Dev Mode Overlays)

**File:** `lib/components/dev_mode/main_content_wrapper.dart`  
**File:** `lib/components/dev_mode/bounding_box_overlay.dart`

### Container

```css
.dt-content-area {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: var(--existing-site-bg); /* inherits normal mode bg */
}
```

The normal portfolio components render **unchanged** inside this container. The overlays are siblings rendered inside the same `position: relative` container.

### Section ID Attributes

Every major portfolio section must have an `id` attribute added (modify existing components to add this in dev mode, or always add it):

```
id="section-hero"
id="section-projects"
id="section-about"
id="section-experience"
id="section-contact"
```

### Section Annotation Labels

Wrap each section's content in a `DevModeAnnotation` component. When `isDevMode == true`, it renders a label pill above the section:

```css
.dt-section-label {
  display: block;
  font-family: var(--dt-font);
  font-size: 10px;
  color: var(--dt-text-dim);
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}
```

Labels per section:

| Section | Label text |
|---------|-----------|
| Hero | `// hero_section.dart` |
| Projects | `// projects_section.dart` |
| About | `// about_me.dart` |
| Experience | `// experience_timeline.dart` |
| Contact | `// contact_section.dart` |

### Experience Timeline — Git Commit Badges

When `isDevMode == true`, render a commit badge before each timeline entry heading:

```css
.dt-commit-badge {
  font-family: var(--dt-font);
  font-size: 10px;
  color: var(--dt-text-dim);
  margin-bottom: 4px;
  display: block;
}
.dt-commit-hash {
  color: var(--dt-orange);
}
```

Fake hashes per experience entry (in chronological order):

```
Entry 1: commit a4f2c1d  — feat: first flutter production app
Entry 2: commit 3b9e821  — fix: shipped 5 client apps on time
Entry 3: commit f71c304  — feat: joined as flutter developer
```

### Bounding Box Overlay

**File:** `bounding_box_overlay.dart`

An `absolutely-positioned` transparent div covering the full content area (`inset: 0`, `pointer-events: none`, `z-index: 10`). Contains one highlight div per section.

```css
.dt-bbox {
  position: absolute;
  border: 1.5px solid var(--dt-bound-border);
  border-radius: 2px;
  background: var(--dt-bound-bg);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.dt-bbox.visible { opacity: 1; }

.dt-bbox-label {
  position: absolute;
  top: -19px;
  left: -1px;
  background: var(--dt-blue);
  color: #000;
  font-family: var(--dt-font);
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
}
```

A bounding box becomes `visible` when:
- The corresponding tree node is hovered or clicked
- The mouse enters the corresponding section in the content area

Bounding box positions are calculated dynamically using `getBoundingClientRect()` on each section element, called on mount and on window resize.

Section → label mapping:

```
section-hero        → "Hero"
section-projects    → "ProjectsSection"
section-about       → "AboutSection"
section-experience  → "ExperienceTimeline"
section-contact     → "ContactSection"
```

---

## Task 7 — Properties Panel

**File:** `lib/components/dev_mode/properties_panel.dart`  
**Width:** `260px` | **Background:** `var(--dt-sidebar-bg)` | **Border-left:** `1px solid var(--dt-border)`

### Panel Header

Same structure as Widget Tree panel header. Text: `"Properties"`.

### Default State (nothing inspected)

Show build metadata. Title: `"App info"` — `11px`, uppercase, `#5C6370`, `padding: 12px 12px 6px`.

Render as key-value rows:

```css
.dt-prop-row {
  display: flex;
  gap: 0;
  padding: 2px 12px;
  font-family: var(--dt-font);
  font-size: 12px;
  line-height: 1.7;
}
.dt-prop-key   { color: var(--dt-orange); min-width: 90px; flex-shrink: 0; }
.dt-prop-sep   { color: var(--dt-text); margin: 0 6px; }
.dt-prop-val   { color: var(--dt-green); }
```

**Build metadata values:**

| Key | Value |
|-----|-------|
| `app` | `"YourName Portfolio"` |
| `version` | `"2.3.1+42"` |
| `dartSDK` | `"3.3.0"` |
| `flutterVer` | `"3.19.0"` |
| `buildMode` | `"debug"` |
| `platform` | `"web"` |
| `theme` | `"dark"` |
| `locale` | `"en_IN"` |

After the metadata, a `1px` divider line then:

```
// Hover any widget to inspect
```
`font-style: italic`, `font-size: 11px`, `color: #5C6370`, `padding: 10px 12px`

### Inspected State

When a tree node is hovered or clicked, `_inspectedNodeId` is set in state. The panel shows node-specific properties.

#### Value type → colour mapping

| Type | Colour |
|------|--------|
| `string` | `#98C379` (green) |
| `bool` | `#C678DD` (purple) |
| `num` | `#D19A66` (yellow) |
| `enum` | `#61AFEF` (blue) |
| `ref` | `#61AFEF` (blue) |
| `live` | `#E06C75` (red) + pulsing dot |

**"live" indicator dot:**

```css
.dt-live-dot {
  display: inline-block;
  width: 5px; height: 5px;
  background: #E06C75;
  border-radius: 50%;
  margin-right: 5px;
  animation: live-pulse 1.5s ease-in-out infinite;
  vertical-align: middle;
}
@keyframes live-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.3; }
}
```

#### Properties per node

**`hero-section`**
```
tag          : "flutter-developer"       string
isHovered    : false → true on hover     live bool
child        : Column                    ref
crossAxis    : CrossAxisAlignment.start  enum
renderSize   : "1fr × auto"              string
```

**`projects`**
```
itemCount    : 3                         num
scrollDir    : Axis.vertical             enum
padding      : EdgeInsets.all(24.0)      ref
isVisible    : true                      live bool
```

**`project-1`**
```
title        : "TaskFlow"                string
category     : "Productivity"            string
isHovered    : false                     live bool
animProgress : 0.0 → 0.73 on hover      live num
platforms    : "[iOS, Android]"          string
stateLib     : "Bloc"                    string
```

**`project-2`**
```
title        : "PulseAI"                 string
category     : "Health & Wellness"       string
isHovered    : false                     live bool
stateLib     : "Riverpod"               string
platforms    : "[iOS, Android, Web]"     string
```

**`project-3`**
```
title        : "Vault"                   string
category     : "Fintech"                 string
isHovered    : false                     live bool
stateLib     : "GetX"                    string
platforms    : "[iOS, Android]"          string
```

**`about`**
```
yearsXP      : 2                         num
location     : "Ahmedabad, India"        string
isAnimated   : true                      bool
```

**`experience`**
```
entryCount   : 3                         num
layout       : "vertical timeline"       string
```

**`contact`**
```
hiringSignal : true                      live bool
email        : "your@email.com"          string
```

**`fab`**
```
elevation    : 6.0                       num
tooltip      : "Hire me"                 string
onPressed    : HireCallback              ref
```

### Live property update behaviour

When the user hovers a project card in the content area:
- `isHovered` updates to `true` in the properties panel
- `animProgress` increments from `0.0` to `0.73` over `300ms` (use a `Timer.periodic` updating a local `double` state)

When they stop hovering:
- Both revert to default values

---

## Task 8 — Debug Console

**File:** `lib/components/dev_mode/debug_console.dart`

### Container

```css
.dt-console {
  flex-shrink: 0;
  height: 180px; /* when expanded */
  background: #0D1117;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dt-console.collapsed {
  height: 0;
}
```

State: `bool _consoleExpanded = true`

### Console Header (always visible — `28px`)

```css
.dt-console-header {
  height: 28px;
  flex-shrink: 0;
  background: #161B22;
  border-top: 1px solid var(--dt-border);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
}
```

**Header contents (left → right):**

1. Label: `"Console"` — `11px`, uppercase, `font-weight: 600`, `#5C6370`
2. Filter pills row (flex, gap 4px):
   - Pills: `ALL` | `INFO` | `DEBUG` | `WARNING` | `ERROR`
   - Active pill style: `background: rgba(97,175,239,0.15)`, `colour: #61AFEF`, `border: 1px solid rgba(97,175,239,0.3)`
   - Inactive pill style: `colour: #5C6370`, `background: transparent`
   - Each pill: `font-family: monospace`, `font-size: 10px`, `padding: 2px 8px`, `border-radius: 99px`, `cursor: pointer`
   - Default active: `ALL`
3. Flex spacer
4. Clear button `🗑` — `14px`, `colour: #5C6370`, `cursor: pointer`. On click: `_console.clear()`
5. Collapse arrow — `"▼"` (expanded) or `"▲"` (collapsed). `14px`, `#5C6370`, cursor pointer. Toggles `_consoleExpanded`.

### Console Body

```css
.dt-console-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  font-family: var(--dt-font);
  font-size: 12px;
  line-height: 1.6;
}
```

Auto-scroll to bottom on every new log entry:
```dart
// after setState with new log entry:
SchedulerBinding.instance.addPostFrameCallback((_) {
  _scrollController.animateTo(
    _scrollController.position.maxScrollExtent,
    duration: Duration(milliseconds: 100),
    curve: Curves.easeOut,
  );
});
```
Or via `dart:html`: `_consoleDiv.scrollTop = _consoleDiv.scrollHeight`

### Log Entry Structure

```css
.dt-log-entry {
  display: flex;
  align-items: flex-start;
  padding: 1px 12px;
  gap: 8px;
}
.dt-log-entry:hover { background: rgba(255,255,255,0.03); }

.dt-log-level {
  width: 76px;
  flex-shrink: 0;
  font-weight: 500;
}
.dt-log-source  { color: var(--dt-text-dim); flex-shrink: 0; }
.dt-log-message { color: var(--dt-text); flex: 1; }
.dt-log-time    { color: var(--dt-text-dark); font-size: 10px; flex-shrink: 0; margin-left: auto; }
```

**Log level colours:**

| Level | Colour | Display text |
|-------|--------|--------------|
| `INFO` | `#56B6C2` | `[INFO]` |
| `DEBUG` | `#5C6370` | `[DEBUG]` |
| `WARNING` | `#E5C07B` | `[WARNING]` |
| `ERROR` | `#E06C75` | `[ERROR]` |

**Command line style** (for `"> flutter stop"` line only):

```css
.dt-log-command {
  display: block;
  padding: 1px 12px;
  color: var(--dt-orange);
  font-family: var(--dt-font);
  font-size: 12px;
}
```

No level badge, no timestamp, no source tag.

### Filtering

When filter is not `ALL`:  
Hide entries with non-matching levels using `display: none` (CSS class toggle, not removal from DOM).

### Initial Log Entries on Dev Mode Mount

Stagger via `Future.delayed` in `initState`:

| Delay | Level | Message |
|-------|-------|---------|
| `+0ms` | INFO | `Portfolio initialised. Rendering 847 widgets...` |
| `+300ms` | INFO | `Theme: dark. Platform: web.` |
| `+600ms` | DEBUG | `Hot restart not available in production build.` |
| `+900ms` | INFO | `DevTools connected. Inspector active.` |
| `+1200ms` | WARNING | `setState() called 3 times during build. Consider optimising.` |
| `+1500ms` | DEBUG | `Scroll controller attached to SingleChildScrollView.` |
| `+1800ms` | INFO | `Welcome, visitor. Portfolio ready for inspection.` |

---

## Task 9 — Reactive Console Logs

**File:** Referenced in `main_content_wrapper.dart` and all section components.

All interactions with the portfolio content in dev mode fire `_console.addLog()`. Wire up via `DevModeState.of(context).console`. Register all mouse/scroll/idle listeners in the main content wrapper's `initState`.

### Complete Trigger Map

| Trigger | Level | Message |
|---------|-------|---------|
| Mouse enters hero section | DEBUG | `Hero widget entered hovered state. Rebuilding.` |
| Mouse enters projects section | INFO | `ProjectsSection entered viewport. ListView rendering 3 items.` |
| Click project card (TaskFlow) | INFO | `Navigator: pushed route '/projects/taskflow'.` |
| Click project card (PulseAI) | INFO | `Navigator: pushed route '/projects/pulseai'.` |
| Click project card (Vault) | INFO | `Navigator: pushed route '/projects/vault'.` |
| Mouse enters about section | INFO | `about_me.dart loaded. Static analysis: 0 errors, 0 warnings.` |
| Mouse enters experience section | INFO | `ExperienceTimeline mounted. Entries: 3. Git log attached.` |
| Mouse enters contact section | INFO | `ContactSection entered viewport.` |
| Hover hire/contact button | WARNING | `HireButton() tapped. Initiating contact sequence...` |
| Click GitHub link | INFO | `Launching external URL: github.com/{yourusername}` |
| Click email link | INFO | `mailto: triggered. Opening compose window...` |
| Scroll to absolute bottom | INFO | `End of widget tree reached. ContactSection fully visible.` |
| Scroll to absolute bottom (+500ms) | DEBUG | `hire.sh is ready to execute. Awaiting input.` |
| Any non-q key pressed | DEBUG | `Key event: '{key}'. Did you mean 'q' to quit?` |
| Performance tab opened | DEBUG | `Collecting frame rendering data...` |
| Performance tab opened (+800ms) | WARNING | `High coffee dependency detected. Performance may vary.` |
| Idle 20 seconds (no mouse move) | DEBUG | `No interaction detected for 20s. Visitor still reading. Good sign.` |

### Idle Detection

```dart
Timer? _idleTimer;
late StreamSubscription _mouseSub;

void _resetIdle() {
  _idleTimer?.cancel();
  _idleTimer = Timer(Duration(seconds: 20), () {
    _console.addLog(LogLevel.debug, 
      'No interaction detected for 20s. Visitor still reading. Good sign.');
  });
}

// In initState:
_mouseSub = document.onMouseMove.listen((_) => _resetIdle());
_resetIdle(); // start timer immediately

// In dispose:
_idleTimer?.cancel();
_mouseSub.cancel();
```

---

## Task 10 — Performance Tab

**File:** `lib/components/dev_mode/performance_tab.dart`  
**Visible when:** `_activeTab == 'performance'` (replaces main content area)

```css
.dt-perf-view {
  flex: 1;
  overflow-y: auto;
  background: var(--dt-bg);
  padding: 28px 32px;
}
```

### Header

```
Title:    "Frame rendering timeline"
Style:    12px, uppercase, letter-spacing 0.8px, colour #5C6370, monospace
Subtitle: "Target: 60fps  |  Showing last 300ms"
Style:    11px, colour #3E4451, monospace, margin-top 4px, margin-bottom 28px
```

### Flame Graph Bar Rows

Each row:

```css
.dt-flame-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.dt-flame-label {
  width: 200px;
  flex-shrink: 0;
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-text);
  text-align: right;
}
.dt-flame-track {
  flex: 1;
  height: 18px;
  background: #21252B;
  border-radius: 2px;
  overflow: hidden;
}
.dt-flame-fill {
  height: 100%;
  border-radius: 2px;
  width: 0%; /* starts at 0, animates to target */
  transition: width 0.8s ease;
}
.dt-flame-fps {
  width: 48px;
  flex-shrink: 0;
  font-family: var(--dt-font);
  font-size: 10px;
  text-align: right;
}
```

Add class `animate` after `100ms` in `initState` to trigger bar growth.

**Bar data (in order):**

| Label | Target Width | FPS | Fill Colour |
|-------|-------------|-----|-------------|
| `Flutter / Dart` | `100%` | `60fps` | `#98C379` |
| `State Management` | `100%` | `60fps` | `#98C379` |
| `UI / Animations` | `97%` | `58fps` | `#98C379` |
| `Firebase / Backend` | `80%` | `48fps` | `#E5C07B` |
| `REST APIs` | `78%` | `47fps` | `#E5C07B` |
| `Unit Testing` | `53%` | `32fps` | `#E5C07B` |
| `Writing Docs` | `35%` | `21fps` | `#E06C75` |
| `Attending meetings` | `13%` | `8fps` | `#E06C75` |

FPS badge colour matches fill colour.

**Staggered animation:** Apply `animation-delay: {index * 100}ms` to each `.dt-flame-fill`.

### Footer Notes

```
// Performance data collected over 2+ years of Flutter development.
// Low fps values indicate room for growth, not skill gaps.
```
Style: `font-size: 12px`, `colour: #3E4451`, `font-style: italic`, `margin-top: 28px`, `line-height: 1.8`

---

## Task 11 — Exit Mechanic

**File:** `lib/components/dev_mode/dev_mode_exit_button.dart`

Three layers work together.

### Layer 1 — Keyboard listener (`q` key)

Register in the DevTools shell's `initState`:

```dart
late StreamSubscription _keySub;

@override
void initState() {
  super.initState();
  _keySub = document.onKeyDown.listen((e) {
    if (e.key == 'q' || e.key == 'Q') {
      _handleQKeyPress();
    } else if (widget.isDevMode) {
      _console.addLog(LogLevel.debug,
        "Key event: '${e.key}'. Did you mean 'q' to quit?");
    }
  });
}

@override
void dispose() {
  _keySub.cancel();
  super.dispose();
}

void _handleQKeyPress() {
  setState(() => _showExitButton = true);
  _console.addCommand('> flutter stop');
  Future.delayed(Duration(milliseconds: 150), () {
    _console.addLog(LogLevel.info, 
      'Caught terminal signal. Application about to exit.');
    _console.addLog(LogLevel.debug, 
      'Press the Exit button or wait...');
  });
}
```

### Layer 2 — Exit Button

Rendered in `devtools_tab_bar.dart`. Conditional on `_showExitButton`.

```css
.dt-exit-btn {
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-red);
  background: transparent;
  border: 1px solid var(--dt-red);
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  margin-right: 12px;
  transition: background 0.15s;
  white-space: nowrap;
}
.dt-exit-btn:hover {
  background: rgba(224, 108, 117, 0.1);
}
```

**Button label:** `"✕ Exit DevTools — Back to normal view"`  
On screen `< 1200px` truncate to `"✕ Exit DevTools"`

**On click:**
```dart
void _exit() {
  _console.addLog(LogLevel.info, 'Exiting... Application finished.');
  // Apply exit animation class
  setState(() => _isExiting = true);
  Future.delayed(Duration(milliseconds: 350), () {
    widget.exitDevMode();
  });
}
```

### Layer 3 — Console command line

Already handled in `_handleQKeyPress` above. The `addCommand('>flutter stop')` renders as a special orange command line without badges.

### Exit Transition Animation

When `_isExiting == true`, add class `exiting` to `.devtools-shell`:

```css
.devtools-shell.exiting {
  animation: devtools-slide-out 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes devtools-slide-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(12px); }
}
```

After `350ms`, `exitDevMode()` sets `isDevMode = false` in top-level state and the shell is removed from the component tree. Normal mode + debug pill reappear.

---

## Task 12 — Mobile Layout

**Breakpoint:** Viewport width `< 1024px`

Detect in `initState`:
```dart
final isMobile = window.innerWidth < 1024;
```

Re-detect on `window.onResize`.

### Mobile DevTools Shell

Same outer shell container as desktop **except:**
- No `grid-template-columns`
- A single content zone fills all available space
- No persistent sidebar panels

```css
.devtools-shell.mobile .devtools-main-row {
  display: block; /* not grid */
  flex: 1;
  overflow: hidden;
}
.dt-mobile-zone {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: none;
}
.dt-mobile-zone.active {
  display: block;
}
```

### Top DevTools Tab Bar (mobile)

Same as desktop — `36px`, same tabs. On mobile: just show `"Flutter Inspector"` as always-active label. No tab switching from top bar on mobile.

### Bottom Tab Bar (mobile only)

```css
.dt-mobile-tabs {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 52px;
  background: var(--dt-tab-bg);
  border-top: 1px solid var(--dt-border);
  display: flex;
  z-index: 600;
}
.dt-mobile-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  border-top: 2px solid transparent;
  transition: border-color 0.15s;
}
.dt-mobile-tab.active {
  border-top-color: var(--dt-blue);
}
.dt-mobile-tab-icon  { font-size: 16px; }
.dt-mobile-tab-label { 
  font-family: var(--dt-font); 
  font-size: 9px; 
  color: var(--dt-text-dim); 
}
.dt-mobile-tab.active .dt-mobile-tab-label { color: var(--dt-text); }
```

**Four tabs:**

| Icon | Label | Zone ID | Default |
|------|-------|---------|---------|
| `🌳` | `Tree` | `tree` | — |
| `📱` | `UI` | `ui` | ✅ Active |
| `⚙️` | `Props` | `props` | — |
| `🖥` | `Console` | `console` | — |

State: `String _activeMobileTab = 'ui'`

### Mobile Zone heights

```
Available height = 100vh - 36px (top bar) - 52px (bottom tabs)
Each zone: height: calc(100vh - 88px)
```

### Mobile-Specific Overrides

- Tree node height: `32px` (larger touch targets)
- Console filter pills: horizontally scrollable row, `overflow-x: auto`, `flex-wrap: nowrap`
- Properties panel: full-width key-value layout, same content
- Debug pill `bottom`: `80px`

### Exit Button on Mobile

On mobile: `_showExitButton = true` **immediately** on dev mode activation.  
Do not wait for `q` key press.  
The exit button is always visible in the top-right of the top DevTools tab bar on mobile.

---

## Task 13 — Final Integration & Polish

### StreamSubscription Checklist

Every `StatefulComponent` that registers an event listener **must** cancel it in `dispose()`. Required subscriptions:

| Component | Subscription | Event |
|-----------|-------------|-------|
| `DevModeShell` | `_keySub` | `document.onKeyDown` |
| `MainContentWrapper` | `_scrollSub` | Content div scroll |
| `MainContentWrapper` | `_mouseSub` | `document.onMouseMove` |
| `MainContentWrapper` | `_idleTimer` | Timer (not StreamSubscription, but cancel) |
| `app.dart` | `_resizeSub` | `window.onResize` (mobile detection) |

### CSS Loading

All DevTools CSS must be loaded **conditionally** — only when dev mode is active — or loaded globally but scoped under `.devtools-shell {}` selectors to avoid polluting normal mode styles.

### Normal mode pill visibility

The `DevModePill` must be completely hidden (`display: none` or not rendered) when `isDevMode == true` or `isTransitioning == true`.

### Z-Index Stack

| Layer | Z-Index |
|-------|---------|
| Normal site content | `1` |
| Debug pill | `1000` |
| DevTools shell | `500` |
| Bounding box overlay | `10` (inside shell) |
| Flutter run overlay | `9999` |

### Browser Support

Test in: Chrome, Firefox, Safari.  
`backdrop-filter` requires `-webkit-` prefix for Safari.  
`JetBrains Mono` requires Google Fonts import or local asset.

---

## Implementation Notes

> **Architecture deviation from spec:** Jaspr runs in `static` rendering mode — HTML is pre-rendered server-side with no client-side Dart hydration. Dart event handlers are never attached to the DOM. All interactivity is therefore implemented in `web/devmode.js` (plain JavaScript). Jaspr components render static HTML with `id` and `data-*` attributes that the JS hooks into. The `InheritedComponent` / `StatefulComponent` state architecture described in the spec is not used; JS manages all runtime state.

> **Duplicate DOM:** `app.dart` renders portfolio content twice — once for normal mode, once inside `DevModeShell`. Both are always in the DOM. All Phase 2 DOM lookups use `scopedById`/`scopedQuery`/`scopedQueryAll` helpers that search within `#dt-content-area` first to target the correct copy.

## QA Audit Log

### Round 1 (previous session)
- Fixed `activeBbox = null` → `_activeBbox = null` (ReferenceError)
- Fixed commit badge selector to include `.timeline-item`
- Added `animProgress` to all 5 project node entries
- Narrowed hire button selector to `a[href^="mailto"]`
- Added `scopedById`/`scopedQuery`/`scopedQueryAll` helpers for duplicate-DOM safety

### Round 2 (this session) — 5 additional bugs found and fixed

**Bug 1 — Shell/overlay animations don't replay on second DevMode entry** *(CRITICAL)*
- Root cause: CSS animations on `.devtools-shell` and `.flutter-run-overlay` run once on page load/first show. On re-entry, the animation has already completed (`forwards` fill mode keeps final state).
- Fix: Moved shell animation to `.entering` class added by JS. Added `void el.offsetWidth` reflow trick to force animation reset on overlay and all child animated elements before re-showing.

**Bug 2 — Console collapse hides the header** *(CRITICAL)*
- Root cause: `.dt-console.collapsed { height: 0 }` collapsed the entire `#dt-console` div including the header with the toggle button. User could never re-expand.
- Fix: Restructured console HTML to add `#dt-console-body-wrap` wrapper. Only the body wrapper collapses (`height: 152px → 0`). Header always visible. JS toggle now targets `#dt-console-body-wrap`.

**Bug 3 — Performance tab renders below console, not replacing content area** *(CRITICAL)*
- Root cause: `#dt-perf-view` was a direct child of `.devtools-shell` (flex column), rendered after `.devtools-main-row`. `flex: 1` made it expand below the console, not overlay the content area.
- Fix: Changed `.dt-perf-view` to `position: absolute` with `top: 36px` (below tab bar), `bottom: 180px` (above console), `left/right: 0`. Shell already has `position: fixed` so absolute children position relative to it.

**Bug 4 — `display: contents` ignores `overflow: hidden`** *(MEDIUM)*
- Root cause: CSS spec — `overflow` is ignored on `display: contents` elements. The comment in the CSS even noted this but the property was left in.
- Fix: Removed `overflow: hidden` from the `display: contents` rule. Added `overflow: hidden; min-height: 0` to direct children of the zone wrappers instead.

**Bug 5 — Shell slide-in animation fires on page load** *(LOW)*
- Root cause: Animation was on `.devtools-shell` class permanently. Shell starts `display: none` so it's invisible, but the animation runs and completes immediately on parse.
- Fix: Covered by Bug 1 fix — animation now only on `.entering` class added by JS.

## Component Checklist

### Task 1 — Debug Pill
- [x] Pill renders at bottom-center in normal mode (`#debug-pill`, `.debug-pill-wrapper` fixed positioned)
- [x] Green dot pulse animation works (`pill-pulse` keyframe in `devtools.css`)
- [x] Hover state (border glow) works (CSS `:hover` on `.debug-pill`)
- [x] Tooltip appears after 600ms hover (CSS `transition-delay: 0.6s` on `.debug-pill:hover .debug-pill-tooltip`)
- [x] Click triggers `enterDevMode()` (JS `init()` wires `#debug-pill` click → `enterDevMode`)
- [x] Pill hides when transitioning (`enterDevMode()` sets `pill.style.display = 'none'`)
- [x] Pill hides when dev mode active (shell covers viewport at z-index 500; pill restored on exit)
- [x] Mobile bottom offset (`80px`) applied via `@media (max-width: 1023px)` in `devtools.css`

### Task 2 — Flutter Run Overlay
- [x] Overlay covers full screen (`position: fixed; inset: 0; z-index: 9999`)
- [x] Fade-in animation works (`overlay-fade-in` keyframe)
- [x] Progress bar animates full width over 4s (`progress-grow` keyframe)
- [x] All 16 log lines rendered with correct delays (`animation-delay` inline styles in `flutter_run_overlay.dart`)
- [x] Log line colours match spec (inline `color` styles per line)
- [x] Blinking cursor appears at `4.0s` (`terminal-cursor` with `animation-delay: 4.0s`)
- [x] Overlay auto-dismisses at `4.3s` (`setTimeout(completeTransition, 4300)` in JS)
- [x] Skip button dismisses immediately (`#overlay-skip-btn` click → `completeTransition()`)
- [x] Shell shown after dismiss (`completeTransition` sets `shell.style.display = 'flex'`)
- [x] **Animations replay correctly on re-entry** (reflow trick resets all CSS animations)

### Task 3 — DevTools Shell
- [x] Shell covers full screen (`position: fixed; inset: 0; z-index: 500`)
- [x] Slide-in animation plays on mount (`.entering` class added by JS; `void offsetWidth` reflow ensures replay on re-entry)
- [x] 4-zone CSS grid renders correctly (`flex-direction: column` shell with grid main row)
- [x] Middle row uses `grid-template-columns: 340px 1fr 300px`
- [x] Custom scrollbars applied (`.devtools-shell ::-webkit-scrollbar` rules)
- [x] Exit animation plays before unmount (`exiting` class adds `devtools-slide-out` keyframe; shell hidden after 350ms)
- [x] **Animation does not fire on page load** (moved to `.entering` class, only added by JS)

### Task 4 — DevTools Tab Bar
- [x] Flutter icon renders in top-left (inline SVG polygon in `devtools_tab_bar.dart`)
- [x] All 4 tabs render (`Flutter Inspector`, `Performance`, `Memory`, `Logging`)
- [x] Active tab has blue bottom border (`.dt-tab.active` CSS)
- [x] `inspector` is default active tab (`active: true` on inspector tab in Dart)
- [x] Clicking `Performance` switches view (`switchTab()` in JS shows/hides `#dt-perf-view`)
- [x] Connection status (green dot + "Connected") renders
- [x] Exit button conditionally renders (JS `renderExitButton()` injects into `#dt-exit-btn-container`)

### Task 5 — Widget Tree Panel
- [x] Panel renders at `280px` width (CSS `grid-template-columns: 280px 1fr 260px`)
- [x] All 13 nodes defined and render (`kTreeNodes` in `widget_tree_panel.dart`)
- [x] Correct indent levels applied (`padding-left: indent * 16 + 4 px` inline style)
- [x] Accordion expand/collapse works (JS `onNodeClick` toggles `data-parent` children `display`)
- [ ] Siblings collapse when one opens — **not implemented** (JS only hides/shows clicked node's children, no sibling collapse)
- [x] Hovered node shows `dt-hover-bg` (CSS `.tree-node:hover`)
- [ ] Active section node shows `dt-selection-bg` + left border — **not implemented** (scroll sync deferred to Phase 2)
- [ ] Scroll sync: content scroll updates active node — **deferred to Phase 2**
- [x] Click sync: node click scrolls content to section (`el.scrollIntoView` in `onNodeClick`)
- [ ] Hovering node triggers bounding box — **deferred to Phase 2**

### Task 6 — Main Content Overlays
- [x] Section `id` attributes exist on all sections (existing: `hero`, `projects`, `about`, `experience`, `contact`)
- [ ] Section annotation labels render in dev mode — **deferred to Phase 2**
- [ ] Git commit badges render on experience entries — **deferred to Phase 2**
- [ ] Bounding box overlay — **deferred to Phase 2**

### Task 7 — Properties Panel
- [x] Panel renders at `260px` width (CSS grid column)
- [x] Default state shows build metadata (8 key-value rows in `properties_panel.dart`)
- [x] "Hover any widget to inspect" text renders below metadata
- [x] Hovering tree node updates inspected properties (JS `onNodeHover` → `renderProperties()`)
- [x] Correct properties render for each node ID (`nodeProps` map in `devmode.js`)
- [x] Value type colours match spec (`.type-bool`, `.type-num`, `.type-enum`, `.type-ref`, `.type-live` CSS classes)
- [x] Live properties show pulsing dot (`dt-live-dot` injected by `renderProperties()`)
- [ ] `isHovered` on project cards updates on hover — **deferred to Phase 2**
- [ ] `animProgress` animates on project card hover — **deferred to Phase 2**

### Task 8 — Debug Console
- [x] Console renders at bottom, `180px` height (`.dt-console` + `.dt-console-body-wrap` CSS)
- [x] Console header renders with all elements (label, filter pills, clear, toggle)
- [x] ALL/INFO/DEBUG/WARNING/ERROR filter pills render
- [x] Default filter is `ALL` (`.active` class on ALL pill in `debug_console.dart`)
- [x] Filter click updates active pill (JS `consoleFilter` state + class toggle)
- [x] **Collapsed/expanded toggle works correctly** — header always visible; only body wrapper collapses (`#dt-console-body-wrap.collapsed`)
- [x] Clear button clears all entries (`#dt-console-clear` click → `clearLogs()`)
- [x] Log entries render with level badge + message + timestamp (JS `renderConsole()`)
- [x] Level colours match spec (`.dt-log-level.info/debug/warning/error` CSS)
- [x] Command line renders in orange, no badge (`.dt-log-command` CSS)
- [x] Console auto-scrolls to bottom on new entry (`scrollConsoleToBottom()` after every `addLog`)
- [x] Initial 7 staggered entries fire on dev mode mount (`scheduleInitialLogs()` in JS)

### Task 9 — Reactive Console Logs
- [x] Idle timer resets on mouse move (`setupIdleDetection` / `resetIdle` in JS)
- [x] Idle log fires after 20s of no interaction
- [x] Non-q key press logs key name correctly (`keyHandler` in JS)
- [x] Performance tab open triggers debug + warning logs (`switchTab` in JS)
- [ ] All other interaction triggers (section hover, project card click, scroll-to-bottom, link clicks) — **deferred to Phase 2**

### Task 10 — Performance Tab
- [x] **View renders correctly when Performance tab clicked** — `position: absolute` overlay covers main row area (`top: 36px`, `bottom: 180px`)
- [x] All 8 bar rows render (`performance_tab.dart`)
- [x] Bars start at `0%` width (`width: 0%` inline style)
- [x] Bars animate to target width after `100ms` (`setTimeout` in `switchTab` sets `bar.style.width = bar.dataset.target`)
- [x] Stagger delays applied (`transition-delay: index * 100ms` inline style)
- [x] Colours match fps ranges (green/orange/red per bar)
- [x] Footer italic notes render

### Task 11 — Exit Mechanic
- [x] `q` key press fires `handleQKey()` in JS
- [x] Exit button appears on `q` (`renderExitButton()` injects button)
- [x] `"> flutter stop"` command line added to console
- [x] Exit INFO + DEBUG messages added to console
- [x] Exit button click triggers slide-out animation (`exiting` class on shell)
- [x] Shell hidden and pill restored after `350ms`
- [x] Key listener removed on exit (`removeKeyListener()`)

### Task 12 — Mobile Layout
- [x] Mobile detected via `window.innerWidth < 1024` (`isMobile()` in JS)
- [x] Bottom tab bar renders (`.dt-mobile-tabs` in `dev_mode_shell.dart`)
- [x] `UI` tab is default active (`active` class on `ui` tab in Dart)
- [x] Tab switching wired up (`setupMobileTabs()` in JS)
- [x] Exit button always visible on mobile (JS `completeTransition` calls `renderExitButton()` when mobile)
- [x] Debug pill at `bottom: 80px` on mobile (CSS media query)
- [x] Console filters horizontally scrollable (CSS `overflow-x: auto; flex-wrap: nowrap`)
- [ ] Mobile zones properly isolated (panels share same DOM on mobile; zone show/hide not fully wired — **needs Phase 2 polish**)
- [ ] Tree nodes have `32px` height on mobile — **not applied** (CSS media query exists but panels aren't in `.dt-mobile-zone` wrappers)

### Task 13 — Integration
- [x] All JS event listeners cleaned up on exit (`removeKeyListener`, `clearIdleDetection`)
- [x] CSS scoped to DevTools components (`devtools.css` separate file, selectors scoped to `.devtools-shell` where needed)
- [x] No CSS from dev mode bleeds into normal mode (all DevTools classes are prefixed `dt-` or `devtools-`)
- [x] Debug pill hidden when dev mode active (JS hides on enter, restores on exit)
- [x] Z-index stack correct (overlay `9999` > pill `1000` > shell `500`)
- [x] `JetBrains Mono` font loads (already in Google Fonts import in `main.server.dart`)
- [ ] Tested in Chrome, Firefox, Safari — **pending**
- [ ] Responsive between `768px–1440px` verified — **pending**

---

*Document version: 1.0 — Phase 1 complete scope.*  


---

## Phase 2 — Interactivity & Polish

**Goal**: Transform the static Phase 1 shell into a fully reactive, interactive experience that responds to user actions in real time.

### Prerequisites
- Phase 1 fully complete and tested
- All Phase 1 checklist items verified
- No console errors or visual bugs

### Phase 2 Deliverables

#### 2.1 — Bidirectional Scroll Synchronization

**Content → Tree Sync:**
- Register scroll listener on main content area (`dart:html` `onScroll`)
- Calculate which section is currently in viewport using `getBoundingClientRect()`
- Update `_activeSection` state when section changes
- Apply `.active` class to matching tree node
- Auto-scroll tree panel to keep active node visible

**Tree → Content Sync:**
- Clicking a tree node with a `section` value scrolls content to that section
- Use `element.scrollIntoView({behavior: 'smooth'})` via `dart:html`
- Trigger bounding box highlight for 2 seconds after navigation
- Add subtle "jump" animation to content area on navigation

**Implementation Notes:**
```dart
// In main_content_wrapper.dart
late StreamSubscription _scrollSub;

@override
void initState() {
  super.initState();
  final contentDiv = document.getElementById('dt-content-area');
  _scrollSub = contentDiv!.onScroll.listen((_) => _detectActiveSection());
}

void _detectActiveSection() {
  final sections = ['hero', 'projects', 'about', 'experience', 'contact'];
  String? closest;
  double minDistance = double.infinity;
  
  for (final section in sections) {
    final el = document.getElementById('section-$section');
    if (el != null) {
      final rect = el.getBoundingClientRect();
      final distance = (rect.top - 100).abs(); // 100px offset for header
      if (distance < minDistance) {
        minDistance = distance;
        closest = section;
      }
    }
  }
  
  if (closest != null && closest != _activeSection) {
    setState(() => _activeSection = closest);
    // Notify widget tree panel to update active node
  }
}

@override
void dispose() {
  _scrollSub.cancel();
  super.dispose();
}
```

#### 2.2 — Dynamic Bounding Box Overlays

**Trigger Conditions:**
- Tree node hover → show bounding box for corresponding section
- Tree node click → show bounding box for 2 seconds
- Content section hover → show bounding box for that section
- Mouse leave → fade out bounding box after 300ms delay

**Implementation:**
- Create `BoundingBoxController` to manage visibility state
- Calculate box positions dynamically on mount and window resize
- Use `IntersectionObserver` (via `dart:html`) for efficient hover detection
- Add label chip at top-left of each box with widget name

**CSS Transitions:**
```css
.dt-bbox {
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dt-bbox.visible {
  opacity: 1;
  transform: scale(1);
}
```

#### 2.3 — Reactive Console Logs

Implement all 16 interaction triggers from Task 9:

**Event Listeners Required:**
- `onMouseEnter` on each major section div
- `onClick` on project cards, links, buttons
- `onScroll` for bottom-detection
- `onKeyDown` for non-q key presses
- `Timer` for idle detection (20s)
- Tab switch listener for Performance tab

**Console Log Controller Integration:**
```dart
// Pass console controller via DevModeState
final console = DevModeState.of(context).console;

// Example trigger
onMouseEnter: (_) {
  console.addLog(LogLevel.debug, 
    'Hero widget entered hovered state. Rebuilding.');
}
```

**Auto-scroll Implementation:**
```dart
// In debug_console.dart
void _scrollToBottom() {
  final consoleBody = document.getElementById('dt-console-body');
  if (consoleBody != null) {
    consoleBody.scrollTop = consoleBody.scrollHeight;
  }
}

// Call after every log entry added
console.onUpdate = () {
  setState(() {});
  Future.delayed(Duration(milliseconds: 50), _scrollToBottom);
};
```

#### 2.4 — Live Property Updates

**Hover State Tracking:**
- Add `_hoveredNodeId` state to properties panel
- Update when mouse enters/leaves project cards
- Show pulsing red dot next to `isHovered` property
- Animate `animProgress` from 0.0 → 0.73 over 300ms

**Implementation:**
```dart
// In project_card.dart (or wrapper)
bool _isHovered = false;

div(
  onMouseEnter: (_) {
    setState(() => _isHovered = true);
    // Notify properties panel
    DevModeState.of(context).updateHoveredNode('project-1', true);
  },
  onMouseLeave: (_) {
    setState(() => _isHovered = false);
    DevModeState.of(context).updateHoveredNode('project-1', false);
  },
  // ... card content
)
```

**Animation Progress:**
```dart
// In properties_panel.dart
Timer? _animTimer;
double _animProgress = 0.0;

void _startAnimation() {
  _animProgress = 0.0;
  _animTimer?.cancel();
  _animTimer = Timer.periodic(Duration(milliseconds: 30), (timer) {
    setState(() {
      _animProgress += 0.073; // reaches 0.73 in ~300ms
      if (_animProgress >= 0.73) {
        _animProgress = 0.73;
        timer.cancel();
      }
    });
  });
}
```

#### 2.5 — Section Annotation Labels

**File**: `lib/components/dev_mode/dev_mode_annotation.dart`

```dart
class DevModeAnnotation extends StatelessComponent {
  final String label;
  final Component child;

  const DevModeAnnotation({
    required this.label,
    required this.child,
  });

  @override
  Iterable<Component> build(BuildContext context) sync* {
    final isDevMode = DevModeState.of(context).isDevMode;
    
    if (isDevMode) {
      yield span(
        classes: 'dt-section-label',
        [text('// $label')],
      );
    }
    
    yield child;
  }
}
```

**Usage in sections:**
```dart
// In hero_section.dart
@override
Iterable<Component> build(BuildContext context) sync* {
  yield DevModeAnnotation(
    label: 'hero_section.dart',
    child: section(
      id: 'section-hero',
      // ... existing hero content
    ),
  );
}
```

#### 2.6 — Git Commit Badges

**Conditional Rendering:**
```dart
// In experience_section.dart
if (DevModeState.of(context).isDevMode) {
  yield span(
    classes: 'dt-commit-badge',
    [
      span(
        classes: 'dt-commit-hash',
        [text('commit a4f2c1d')],
      ),
      text('  — feat: first flutter production app'),
    ],
  );
}
```

#### 2.7 — Enhanced Mobile Support

**Improvements:**
- Smooth zone transitions with slide animations
- Swipe gestures for zone switching (optional)
- Larger touch targets (44px minimum)
- Improved scrollbar visibility on mobile
- Exit button always visible (no q key required)

**Mobile Detection:**
```dart
// In app.dart
bool _isMobile = false;

@override
void initState() {
  super.initState();
  _checkMobile();
  _resizeSub = window.onResize.listen((_) => _checkMobile());
}

void _checkMobile() {
  final wasMobile = _isMobile;
  _isMobile = window.innerWidth < 1024;
  if (wasMobile != _isMobile) {
    setState(() {});
  }
}
```

### Phase 2 Implementation Notes

> **Architecture:** All Phase 2 features are implemented in `web/devmode.js` (plain JS) and `web/devtools.css`. Dart components remain static HTML; JS hooks into `id` and `data-*` attributes at runtime.

> **QA audit fixes applied (post-verification):**
> - `activeBbox = null` → `_activeBbox = null` in `completeTransition` (was a ReferenceError)
> - `injectCommitBadges` selector updated to include `.timeline-item` (actual `ExperienceEntry` class)
> - **CRITICAL:** All DOM lookups now use `scopedById` / `scopedQuery` / `scopedQueryAll` helpers that search within `#dt-content-area` first. `app.dart` renders portfolio content twice (once for normal mode, once inside the shell), so `document.getElementById('hero')` was returning the wrong (normal-site) element for scroll sync, bounding boxes, section listeners, annotations, badges, and link listeners.
> - `animProgress` property added to all 5 project node entries in `nodeProps` (was missing, causing `startAnimProgress` to silently no-op)
> - Hire button selector narrowed from broad `[class*="cta"]` to `a[href^="mailto"]` scoped to `#contact`

### Phase 2 Checklist

#### Scroll Sync
- [x] Content scroll updates active tree node (`onContentScroll` → `updateActiveTreeNode`)
- [x] Tree node click scrolls to section smoothly (`onNodeClick` → `contentArea.scrollTo` via `scopedById`)
- [x] Active node auto-scrolls into view in tree panel (`updateActiveTreeNode` checks `offsetTop`)
- [x] Scroll offset accounts for 80px header offset
- [x] Scoped DOM lookup prevents targeting normal-site duplicate elements

#### Bounding Boxes
- [x] Overlay injected into `#dt-content-area` on dev mode enter (`ensureBboxOverlay`)
- [x] Boxes appear on tree node hover (`onNodeHover` → `showBbox`)
- [x] Boxes appear on content section hover (`setupSectionListeners` → `showBbox`)
- [x] Box positions calculated via `scopedById` (correct elements, not normal-site duplicates)
- [x] Box positions update on window resize (`window.addEventListener('resize', updateBboxPositions)`)
- [x] Labels render correctly at top-left (`.dt-bbox-label` inside each `.dt-bbox`)
- [x] Fade + scale transition on show/hide (CSS `opacity` + `transform: scale`)
- [x] Delayed hide (300ms on section leave, 400ms on tree node leave, 2s after click)

#### Reactive Logs
- [x] Section hover logs: all 9 sections wired via `scopedById`
- [x] Project card hover logs (all 5 cards via `scopedById`)
- [x] Hire/contact button hover warning log (scoped `a[href^="mailto"]` in `#contact`)
- [x] GitHub link click log (scoped to `#dt-content-area`)
- [x] Email link click log (scoped to `#dt-content-area`)
- [x] Scroll-to-bottom detection + 2 logs (500ms stagger)
- [x] Idle timer (20s) log
- [x] Non-q key press log
- [x] Performance tab open logs (debug + warning at 800ms)
- [x] Section logs fire once per session (no spam on re-hover)
- [x] Console auto-scrolls to bottom on every new entry

#### Live Properties
- [x] `isHovered` updates to `true` on project card hover
- [x] `animProgress` property present in all 5 project nodes (was missing — fixed)
- [x] `animProgress` animates 0.0 → 0.73 over ~300ms (`setInterval` at 30ms)
- [x] Both reset to defaults on mouse leave
- [x] Pulsing dot renders for `type-live` properties (CSS `.dt-live-dot`)

#### Annotations
- [x] Section labels injected into correct elements via `scopedById`
- [x] Labels removed on exit (`removeAnnotations`)
- [x] Git commit badges injected into `.timeline-item` entries via `scopedQuery`
- [x] Badges removed on exit (`removeCommitBadges`)
- [x] Normal mode unaffected (injection only runs when `isDevMode` becomes true)

#### Widget Tree
- [x] Sibling collapse implemented (`collapseSiblings` called before expanding)
- [x] Tree node `mouseleave` wired to delayed bbox hide

#### Cleanup
- [x] All Phase 2 listeners torn down in `exitDevMode` (`teardown*` functions)
- [x] `MutationObserver` guarded with `_initDone` flag (no duplicate listeners)
- [x] `animProgressTimer` cleared on card leave and on exit
- [x] `_activeBbox` ReferenceError fixed
- [x] Commit badge selector includes `.timeline-item`
- [x] All DOM queries scoped to `#dt-content-area` to avoid duplicate-DOM targeting

---

## Phase 3 — Advanced Features

**Goal**: Add sophisticated features that enhance the developer experience and showcase technical depth.

**Status: ✅ COMPLETE**

### Phase 3 Deliverables

#### 3.1 — Functional Widget Tree Search ✅

**Implemented in:** `web/devmode.js` — `setupTreeSearch`, `filterTree`, `teardownTreeSearch`

- Real-time filtering as user types (case-insensitive)
- Matches on widget name AND args text
- Shows matching nodes + all their ancestors (so tree context is preserved)
- Highlights matching text with `<mark class="dt-search-highlight">` (blue tint)
- Accordion state snapshotted before search, restored exactly on clear
- `×` clear button injected into search wrap, shown only when query is non-empty
- `f` / `F` key focuses the search input from anywhere
- Teardown removes listener, clears input, removes clear button, restores tree

#### 3.2 — Hot Reload Simulation ✅

**Implemented in:** `web/devmode.js` — `handleHotReload`  
**Triggered by:** `r` / `R` key (when not in input)

- Logs `[INFO] Performing hot reload... 🔥`
- Flashes content area with yellow tint (CSS `dt-hot-reload-flash` keyframe, 400ms)
- After random 150–450ms delay: logs reload time + hot reload count
- Counter increments per session

#### 3.3 — Keyboard Shortcuts Panel ✅

**Implemented in:** `web/devmode.js` — `openShortcutsPanel`, `closeShortcutsPanel`, `toggleShortcutsPanel`  
**Triggered by:** `?` key (Shift+/)

Shortcuts shown:
- `q` — Exit DevTools
- `r` — Hot reload
- `?` — Toggle this panel
- `f` — Focus widget search
- `c` — Clear console
- `/` — Toggle console
- `Esc` — Close overlays

Panel features:
- Backdrop blur overlay, centered modal
- Close on backdrop click, `×` button, or `Esc`
- Logs `[DEBUG] Keyboard shortcuts panel opened.`
- Removed on exit

#### 3.4 — Time-Based Console Greeting ✅

**Implemented in:** `web/devmode.js` — `showTimeBasedGreeting`

Fires at 2100ms after dev mode entry (after the 7 initial staggered logs):
- 05:00–11:59 → "Good morning! Portfolio ready for inspection."
- 12:00–16:59 → "Good afternoon! DevTools connected."
- 17:00–20:59 → "Good evening! Late night coding session?"
- 21:00–04:59 → "Burning the midnight oil? Portfolio ready."

### Phase 3 Checklist

- [x] Widget tree search filters in real time
- [x] Matching text highlighted in blue
- [x] Ancestor nodes shown for context
- [x] Accordion state restored correctly on clear
- [x] `×` clear button visible only when query non-empty
- [x] `f` key focuses search input
- [x] Hot reload flash animation plays on `r` key
- [x] Hot reload logs fire with realistic timing
- [x] Shortcuts panel opens on `?` key
- [x] Shortcuts panel closes on `Esc`, backdrop click, `×` button
- [x] All 7 shortcuts listed with correct descriptions
- [x] Time-based greeting fires after initial logs
- [x] All Phase 3 state reset on exit
- [x] All Phase 3 listeners torn down on exit

---

## Phase 4 — Easter Eggs & Refinements

**Goal**: Add delightful hidden features and final polish that make the experience memorable.

### Phase 4 Deliverables

#### 4.1 — Konami Code Easter Egg

**Trigger:** ↑ ↑ ↓ ↓ ← → ← → B A

**Effect:**
- Matrix-style falling code animation overlay
- Console logs: `[INFO] Cheat code activated. God mode enabled.`
- All performance bars jump to 100% / 60fps
- Confetti animation (brief)

#### 4.2 — Hot Reload Simulation

**Trigger:** Press `r` key

**Effect:**
- Brief flash overlay (yellow tint)
- Console logs: `[INFO] Performing hot reload... ⚡`
- Console logs: `[INFO] Reloaded 1 of 847 libraries in 234ms.`
- Subtle shake animation on content area

#### 4.3 — Hidden Developer Credits

**Trigger:** Click Flutter logo in tab bar 5 times rapidly

**Effect:**
- Modal overlay with credits
- "Built with ❤️ by [Your Name]"
- Tech stack list
- Links to GitHub, LinkedIn

#### 4.4 — Time-Based Greetings

**Feature:**
- Console greeting changes based on time of day
- Morning: "Good morning! Portfolio ready for inspection."
- Afternoon: "Good afternoon! DevTools connected."
- Evening: "Good evening! Late night coding session?"
- Night: "Burning the midnight oil? Portfolio ready."

#### 4.5 — Visitor Analytics (Fake)

**Feature:**
- Show fake "visitor count" in properties panel
- Increment randomly every 10-30 seconds
- Show fake "active users" count (1-3)
- Add to console: `[DEBUG] New visitor from [Random City]. Total: X`

#### 4.6 — Final Polish

**Refinements:**
- Add loading states for all async operations
- Improve error boundaries
- Add accessibility labels (ARIA)
- Optimize bundle size
- Add service worker for offline support
- Comprehensive browser testing
- Performance profiling and optimization

### Phase 4 Checklist

- [ ] Konami code works
- [ ] Hot reload simulation functional
- [ ] Credits modal implemented
- [ ] Time-based greetings work
- [ ] Fake analytics implemented
- [ ] All accessibility labels added
- [ ] Performance optimized
- [ ] Cross-browser tested
- [ ] Offline support works
- [ ] No console warnings

---

## Implementation Timeline

**Recommended Schedule:**

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 3-5 days | Core foundation, visual completeness |
| Phase 2 | 2-3 days | Interactivity, reactive features |
| Phase 3 | 2-3 days | Advanced features, polish |
| Phase 4 | 1-2 days | Easter eggs, final refinements |

**Total**: 8-13 days for complete implementation

---

## Testing Strategy

### Phase 1 Testing
- Visual regression testing (screenshots)
- Layout testing at 5 breakpoints (320px, 768px, 1024px, 1440px, 1920px)
- Tab navigation testing
- Exit flow testing

### Phase 2 Testing
- Scroll sync accuracy testing
- Event listener memory leak testing
- Console log performance testing (1000+ entries)
- Mobile touch interaction testing

### Phase 3 Testing
- Search performance testing (large trees)
- Animation frame rate testing
- Keyboard shortcut conflict testing
- Theme switching persistence testing

### Phase 4 Testing
- Easter egg discovery testing
- Cross-browser compatibility testing
- Accessibility audit (WAVE, axe)
- Performance audit (Lighthouse)

---

*Document version: 2.0 — Complete multi-phase implementation guide.*

---

## Phase 5 — Easter Eggs Master Reference

> **For AI Agent use.** This section defines every easter egg, hidden command, and interactive surprise for the DevMode portfolio. Each entry includes trigger, effect, console output, visual behaviour, and implementation notes. Read entirely before writing code.

---

### Architecture Notes for Easter Eggs

All easter eggs are implemented in `web/devmode.js`. They hook into the existing console input field (`#dt-console-input`) and keyboard listener already wired in Phase 1–2. A global `easterEggState` object tracks counters, toggles, and found-egg count.

```js
const easterEggState = {
  foundCount: 0,          // eggs triggered so far
  totalEggs: 15,          // shown in easter egg counter badge
  repaintRainbow: false,
  slowAnimations: false,
  performanceOverlay: false,
  semanticDebugger: false,
  debugBanner: false,
  buildVariant: 'debug',  // 'debug' | 'profile' | 'release'
  stateManager: 'bloc',
  platform: 'web',
  themeIndex: 0,
  konamiProgress: 0,
  flutterLogoClicks: 0,
};
```

The **console input** (`#dt-console-input`) accepts typed commands. On `Enter`, the value is passed to `handleConsoleCommand(cmd)`. All CLI easter eggs are triggered this way.

---

## Category 1 — Flutter CLI Commands

### EGG-01 — `flutter doctor`

**Trigger:** Type `flutter doctor` in console → press Enter

**Console output (staggered, 120ms apart):**
```
> flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.24.0, on Windows 11)
[✓] Windows Version (Installed version of Windows is version 10 or higher)
[✓] Chrome - develop for the web (Chrome 124.0)
[✓] VS Code (version 1.89.0)
[✓] Connected device (2 available)
[!] Your hesitation to hire Vatsal (run ./hire.sh to fix)

! Doctor found issues in 1 category.
```

**Implementation:**
- Lines appear staggered via `setTimeout` chain, 120ms per line
- The `[!]` line uses `--dt-red` colour
- `./hire.sh` rendered as a clickable span that triggers EGG-79
- Counts as 1 found egg

---

### EGG-02 — `flutter clean`

**Trigger:** Type `flutter clean` → Enter

**Console output:**
```
> flutter clean
Deleting .dart_tool...                    Done
Deleting build/web...                     Done
Deleting .flutter-plugins...              Done
Deleting pubspec.lock...                  Done
Deleting cached_regrets/...               Done
Deleting impostor_syndrome.lock...        Done

847mb freed.
```

**Visual effect:** The main content area briefly flickers to white (`opacity: 0` for 80ms, then back) — simulating a clean wipe. A CSS class `cleaning` is toggled on `#dt-content-area`.

**CSS:**
```css
#dt-content-area.cleaning {
  animation: clean-flash 0.4s ease forwards;
}
@keyframes clean-flash {
  0%   { opacity: 1; }
  30%  { opacity: 0; background: #fff; }
  100% { opacity: 1; }
}
```

---

### EGG-03 — `flutter pub get`

**Trigger:** Type `flutter pub get` → Enter

**Console output (staggered):**
```
> flutter pub get
Resolving dependencies...
+ flutter_bloc 8.1.3
+ riverpod 2.4.9
+ go_router 13.2.0
+ freezed_annotation 2.4.1
+ injectable 2.3.2
+ dio 5.4.0
+ hive_flutter 1.1.0
+ cached_network_image 3.3.0
+ self_doubt 0.0.1 (not found — removing)

Changed 12 dependencies!
```

**Note:** `self_doubt` line in `--dt-red`. Final line in `--dt-green`.

---

### EGG-04 — `flutter build web`

**Trigger:** Type `flutter build web` → Enter

**Console output:**
```
> flutter build web
Compiling lib/main.dart for the Web...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%

Font tree shaken: 847 glyphs → 312 glyphs
JS minified: portfolio.dart.js (2.4MB → 847KB)
✓  Built build/web in 23.4s
```

**Visual:** After the final line, a confetti burst fires (use `canvas-confetti` or CSS keyframe particles). Console shows `[INFO] Build complete. Deploying personality...`

---

### EGG-05 — `flutter upgrade`

**Trigger:** Type `flutter upgrade` → Enter

**Console output:**
```
> flutter upgrade
Checking Flutter updates...
Downloading Flutter 3.24.0...  ████████████ 100%

Flutter 3.19.0 → 3.24.0
Dart 3.3.0 → 3.5.0

Changes in 3.24.0:
  • Impeller rendering on web (no more jank)
  • Material 3 fully stable
  • DevTools 2.34.0 (you are here)
  • Null safety complaints reduced by 94%
```

---

### EGG-06 — `flutter analyze`

**Trigger:** Type `flutter analyze` → Enter

**Console output:**
```
> flutter analyze
Analyzing portfolio...

   info • lib/about_me.dart:12 • avoid_using_visitor_without_hiring • avoid_underpricing_yourself
   info • lib/contact.dart:3 • prefer_hire_over_ghosting

0 errors, 0 warnings, 2 hints.

Hint: avoid_using_visitor_without_hiring: Call hire() to resolve.
```

**Note:** Hint line uses `--dt-cyan`. The word `hire()` is a clickable span → opens `mailto:` link.

---

### EGG-07 — `flutter test`

**Trigger:** Type `flutter test` → Enter

**Console output (each test line appears 200ms apart):**
```
> flutter test
00:01 +0: loading test/widget_test.dart
00:02 +1: Hero widget renders correctly ✓
00:03 +2: ProjectCard displays title ✓
00:04 +3: HireButton fires callback ✓
00:05 +4: SkillsSection has no null values ✓
00:06 +5: ContactSection awaits Future<Job> ✓

All tests passed! (5 tests, 0 failures, 100% coverage)
```

**Final line in `--dt-green`.**

---

### EGG-08 — `flutter run --release`

**Trigger:** Type `flutter run --release` → Enter

**Effect:** This is the **premium exit mechanic**. Console shows:
```
> flutter run --release
Building release build...
Stripping debug symbols...
Removing DevTools chrome...
✓  Launching in release mode.
```
Then after 1.2s, `exitDevMode()` is called — the shell slides out and the clean portfolio appears. The most elegant exit.

---

### EGG-09 — `help`

**Trigger:** Type `help` → Enter

**Effect:** Renders a formatted help table in the console showing all available commands:

```
> help
Available commands:
──────────────────────────────────────────────────
  flutter doctor          Run health check
  flutter clean           Free 847mb of self-doubt
  flutter pub get         Resolve dependencies
  flutter build web       Build and deploy
  flutter analyze         Lint the portfolio
  flutter test            Run test suite
  flutter run --release   Exit to clean portfolio
  flutter upgrade         Upgrade Flutter version
  dart --version          Show Dart SDK info
  git log                 View career as commits
  ./hire.sh               Execute hire script
  null                    Trigger null safety demo
  stackoverflow           Search top questions
  discord                 Open Discord log
  theme                   Cycle colour themes
  dwg                     Parse DWG file
  r                       Hot reload
  R                       Hot restart
  konami / ↑↑↓↓←→←→BA    God mode
──────────────────────────────────────────────────
Tip: Try typing anything. The console catches all.
```

Rendered as a `pre`-style block inside the console log area.

---

### EGG-10 — `dart --version`

**Trigger:** Type `dart --version` → Enter

**Console output:**
```
> dart --version
Dart SDK version: 3.5.0 (stable) (Fri Sep 6 18:27:00 2024 +0000)
  Null safety: ✓ (no more ! operators used in anger)
  Sound null safety: enabled
  Type inference: aggressively helpful
```

---

## Category 2 — DevTools Panel Toggles

These are toggle buttons added to the DevTools tab bar right side, or as toggle rows in the Properties panel header.

### EGG-11 — Repaint Rainbow

**Trigger:** Toggle button in Inspector tab bar area, labelled `🌈 Repaint`

**Effect ON:** Every major section of the portfolio gets a 3px neon border. Borders cycle through hue using CSS animation:
```css
.repaint-rainbow-active * {
  outline: 3px solid transparent;
  animation: rainbow-border 2s linear infinite;
}
@keyframes rainbow-border {
  0%   { outline-color: hsl(0, 100%, 60%); }
  25%  { outline-color: hsl(90, 100%, 60%); }
  50%  { outline-color: hsl(180, 100%, 60%); }
  75%  { outline-color: hsl(270, 100%, 60%); }
  100% { outline-color: hsl(360, 100%, 60%); }
}
```
Class `repaint-rainbow-active` toggled on `#dt-content-area`.

**Console log:** `[DEBUG] debugRepaintRainbowEnabled = true. Every repaint is now visible.`

---

### EGG-12 — Slow Animations (3×)

**Trigger:** Toggle button labelled `🐢 Slow (3×)`

**Effect ON:** All CSS transitions on the page run at 3× slower speed:
```js
document.documentElement.style.setProperty('--anim-speed-multiplier', '3');
```
All transition durations reference `calc(var(--base-duration) * var(--anim-speed-multiplier, 1))`.

For existing site transitions not using this variable, inject a `<style>` tag:
```css
#dt-content-area * {
  transition-duration: calc(var(--orig-duration, 300ms) * 3) !important;
  animation-duration: calc(var(--orig-duration, 300ms) * 3) !important;
}
```

**Console log:** `[DEBUG] timeDilation = 3.0. All animations slowed. This is how Flutter debugging feels.`

**Also reveals:** Animation scrubber (EGG-34) appears at bottom of content area when Slow Animations is ON.

---

### EGG-13 — Performance Overlay

**Trigger:** Toggle button labelled `📊 Perf Overlay`

**Effect ON:** Two semi-transparent bar charts fixed at top of `#dt-content-area`:
- Top bar: "UI Thread" — green bars animating randomly 8–16ms range
- Bottom bar: "Raster Thread" — blue bars animating randomly 4–12ms range
- Red threshold line at 16ms (60fps budget)

```css
.dt-perf-overlay {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 80px;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  pointer-events: none;
}
```

Bars are `<canvas>` elements updated via `setInterval(drawBars, 100)`.

**Console log:** `[DEBUG] Performance overlay enabled. UI thread nominal. Raster thread nominal.`

---

### EGG-14 — Semantic Debugger

**Trigger:** Toggle button labelled `♿ Semantics`

**Effect ON:** Blue semi-transparent overlay labels appear over every interactive element:
- Buttons show: `Button: "View Work"`
- Links show: `Link: "GitHub"`  
- Images show: `Image: "TaskFlow screenshot"`
- Headings show: `Heading: "Vatsal Jaganwala"`

Implementation: JS queries all `a`, `button`, `img`, `h1-h6` in `#dt-content-area`, creates absolute-positioned label divs.

```css
.dt-semantic-label {
  position: absolute;
  background: rgba(97, 175, 239, 0.85);
  color: #000;
  font-family: var(--dt-font);
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 2px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
}
```

**Console log:** `[INFO] debugSemanticsEnabled = true. Accessibility tree visible.`

---

### EGG-15 — Checkerboard Raster Cache

**Trigger:** Toggle button labelled `♟ Raster Cache`

**Effect ON:** All `img` elements and elements with `background-image` get a cyan checkerboard overlay using CSS `background-image`:
```css
.raster-cache-active img,
.raster-cache-active [style*="background-image"] {
  position: relative;
}
.raster-cache-active img::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-conic-gradient(#0ff 0% 25%, transparent 0% 50%);
  background-size: 16px 16px;
  opacity: 0.4;
  pointer-events: none;
}
```

**Console log:** `[DEBUG] checkerboardRasterCacheImages = true. Cached layers highlighted in cyan.`

---

### EGG-16 — Baseline Painting

**Trigger:** Toggle button labelled `— Baselines`

**Effect ON:** A red horizontal line appears under every text element, simulating Flutter's `debugPaintBaselinesEnabled`:
```css
.baseline-active p,
.baseline-active span,
.baseline-active h1,
.baseline-active h2,
.baseline-active li {
  border-bottom: 1px solid rgba(224, 108, 117, 0.6);
}
```

**Console log:** `[DEBUG] debugPaintBaselinesEnabled = true. Text baselines painted in red.`

---

### EGG-17 — Debug Banner

**Trigger:** Toggle button in tab bar labelled `🏴 Debug Banner` (default ON when DevMode opens)

**Effect ON:** A red `DEBUG` ribbon appears in top-right of `#dt-content-area`, exactly replicating Flutter's debug banner:
```css
.dt-debug-banner {
  position: absolute;
  top: 0; right: 0;
  width: 88px; height: 88px;
  overflow: hidden;
  pointer-events: none;
  z-index: 200;
}
.dt-debug-banner::after {
  content: 'DEBUG';
  position: absolute;
  top: 20px; right: -22px;
  width: 100px;
  background: #E06C75;
  color: white;
  font-family: var(--dt-font);
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  padding: 3px 0;
  transform: rotate(45deg);
}
```

**Effect OFF:** Banner fades out with `opacity: 0; transition: opacity 0.3s`. Console: `[INFO] Debug banner removed. Looking cleaner already.`

---

### EGG-18 — Widget Size Inspector

**Trigger:** Hover any section element while in DevMode (always-on in DevMode)

**Effect:** A tooltip appears showing rendered dimensions:
```
RenderBox(size: 1440.0 × 312.0)
```

```css
.dt-size-tooltip {
  position: fixed;
  background: var(--dt-overlay-bg);
  border: 1px solid var(--dt-border);
  font-family: var(--dt-font);
  font-size: 10px;
  color: var(--dt-text);
  padding: 3px 8px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 999;
}
```

JS reads `element.getBoundingClientRect()` → formats as `width.0 × height.0`. Tooltip follows cursor with 12px offset.

---

### EGG-19 — Network Tab (Fake)

**Trigger:** Click `Network` tab in the tab bar (new tab added to Phase 1 tab bar)

**Effect:** Shows a fake DevTools Network panel with these entries:

| Method | URL | Status | Time |
|--------|-----|--------|------|
| GET | `/api/portfolio/info` | 200 | 8ms |
| GET | `/api/projects` | 200 | 12ms |
| GET | `/api/skills` | 200 | 9ms |
| GET | `/api/github/stats` | 200 | 34ms |
| POST | `/api/hire` | 202 ⏳ | pending... |
| GET | `/assets/smartpub-stats` | 200 | 156ms |

The `POST /api/hire` row pulses with `--dt-yellow` colour and shows a spinning indicator. Clicking it adds to console: `[INFO] POST /api/hire is pending. Have you considered clicking "Hire"?`

The panel has column headers: `Name | Method | Status | Time | Size` styled like real DevTools.

---

### EGG-20 — Memory Heap Snapshot

**Trigger:** Click `Memory` tab

**Effect:** A treemap of fake heap blocks. Implemented as CSS grid of coloured rectangles, each with a tooltip on hover:

| Block | Size | Colour |
|-------|------|--------|
| `VatsalJaganwala.ambition` | 847KB | `--dt-blue` |
| `flutter_bloc` | 234KB | `--dt-green` |
| `go_router` | 128KB | `--dt-purple` |
| `cached_network_image` | 89KB | `--dt-cyan` |
| `freezed` | 67KB | `--dt-orange` |
| `meeting_notes` | 2KB | `--dt-red` |
| `impostor_syndrome` | 0.3KB | `--dt-text-dim` |

Hover each block → tooltip: `{name}: {size} — {description}`. `meeting_notes: 2KB — TODO: delete these`.

---

### EGG-21 — CPU Profiler (Flame Chart)

**Trigger:** Button `🔥 CPU Profile` in Performance tab

**Effect:** Below the existing bar chart, renders a fake flame chart:

```
buildPortfolio()          ████████████████████████  847ms
  renderProjects()        ████████████████          623ms
    buildProjectCard()    ████████                  312ms
      animateHero()       ████                      156ms
        awaitJobOffer()   ██                         78ms  ← pending
```

Each row is a `div` with `background: var(--dt-orange)`, width proportional to time. Labels left-aligned. `awaitJobOffer()` row has a pulsing dot.

---

### EGG-22 — Layout Explorer

**Trigger:** Click any tree node → Properties panel shows a Layout Explorer section at bottom

**Effect:** A visual CSS box-model style diagram appears in the Properties panel:

```
┌─── margin: 0 ───────────────────────────────┐
│  ┌── padding: 24px ─────────────────────┐   │
│  │  ┌─ content ──────────────────────┐  │   │
│  │  │  1440 × 312                    │  │   │
│  │  └────────────────────────────────┘  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

Rendered as nested `div`s with `--dt-orange` text labels. Values are fake but plausible for each section.

---
## Category 3 — Flutter Framework Concepts

### EGG-23 — Build Variants Toggle

**Trigger:** Dropdown in top-right of tab bar. Options: `debug` | `profile` | `release`

**debug (default):** Full DevMode — all panels, overlays, console. Debug banner ON.

**profile:** Console: `[INFO] Switching to profile mode. Removing debug overlays.`
- Bounding boxes hidden
- Debug banner removed
- Properties panel shows: `buildMode: "profile"`
- Performance overlay remains (profile mode is for perf analysis)
- Widget tree panel dims slightly

**release:** Same as EGG-08 (`flutter run --release`). Triggers `exitDevMode()` after a 1.5s fake build sequence.

```
[INFO] Building release build...
[INFO] Tree shaking unused widgets...
[INFO] Compiling to optimised JS...
✓  Release mode active. Enjoy the clean portfolio.
```

---

### EGG-24 — RenderFlex Overflow Error

**Trigger:** Resize browser window to < 480px width

**Effect:** A yellow-black striped error banner appears at the bottom of the first section that would overflow:

```css
.dt-overflow-banner {
  background: repeating-linear-gradient(
    -45deg,
    #E5C07B,
    #E5C07B 10px,
    #1a1500 10px,
    #1a1500 20px
  );
  color: #000;
  font-family: var(--dt-font);
  font-size: 11px;
  font-weight: bold;
  padding: 6px 12px;
  cursor: pointer;
}
```

**Banner text:** `A RenderFlex overflowed by 42 pixels on the right.`

**Click effect:** Banner disappears. Console logs:
```
[DEBUG] Wrapped child in Flexible. Overflow resolved.
[INFO] Consider using Expanded or Flexible for responsive layouts.
```

**Trigger detection:** `window.innerWidth < 480` — use `ResizeObserver`.

---

### EGG-25 — setState() Storm

**Trigger:** Triple-click any section of the portfolio content

**Effect:** Console spams 8 warning lines rapidly (50ms apart):
```
[WARNING] setState() called during build. (1/8)
[WARNING] setState() called during build. (2/8)
...
[WARNING] setState() called during build. (8/8)
[WARNING] Build scheduled while build in progress. This is a bug in your framework layer.
```

The content area flickers once (same `clean-flash` animation but faster, 150ms).

After 500ms, console clears the warnings and adds:
```
[INFO] setState storm resolved. Consider using BlocBuilder.
```

---

### EGG-26 — Null Crash Screen

**Trigger:** Type `null` in console → Enter

**Effect:** Full-screen red overlay replaces the DevTools shell:

```css
.dt-null-crash {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: #B00020;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 48px;
  font-family: var(--dt-font);
  color: white;
}
```

**Content:**
```
════════ Exception caught by widgets library ══════════════

Null check operator used on a null value

The relevant error-causing widget was:
  HireButton  ambition.dart:47

Stack trace:
  #0  VatsalJaganwala.getJobOffer (ambition.dart:47)
  #1  HireButton._onPressed (hire_button.dart:23)
  #2  ImpostorSyndrome._dismiss (impostor_syndrome.dart:12)
  #3  Recruiter.openEmail (recruiter.dart:8)

════════════════════════════════════════════════════════════

Press R to hot restart.
```

**Dismiss:** Press `R` or `r` → `exitCrashScreen()` → shell returns. Console: `[INFO] Hot restart performed. Null resolved. hire() is no longer null.`

---

### EGG-27 — InheritedWidget Visualiser

**Trigger:** Toggle button `🔗 Data Flow` in Properties panel header

**Effect ON:** Animated dotted lines drawn from the top widget tree node downward, connecting parent to children. Lines pulse with a travelling dot animation:

```css
.dt-data-flow-line {
  position: absolute;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    var(--dt-cyan) 0px,
    var(--dt-cyan) 6px,
    transparent 6px,
    transparent 12px
  );
  animation: flow-travel 1s linear infinite;
}
@keyframes flow-travel {
  from { background-position: 0 0; }
  to   { background-position: 0 12px; }
}
```

Lines connect `MaterialApp → Scaffold → Body → each section`. Label near top: `DevModeState flowing ↓`.

**Console:** `[DEBUG] InheritedWidget propagation visualised. Data flows from root to leaves.`

---

### EGG-28 — Key Inspector

**Trigger:** Click any tree node → Properties panel adds a "Key" section at top

**Key values per node:**

| Node | Key shown |
|------|-----------|
| `hero-section` | `ValueKey('hero')` |
| `project-1` | `ValueKey('taskflow')` |
| `project-2` | `ValueKey('pulseai')` |
| `project-3` | `ValueKey('vault')` |
| `about` | `GlobalKey<AboutSectionState>()` |
| `contact` | `ValueKey('contact')` |
| `fab` | `GlobalKey<FloatingActionButtonState>()` |

**Hover tooltip on key row:** `"Keys preserve widget identity across rebuilds. GlobalKey provides access to State."`

---

### EGG-29 — Future/Stream Visualiser

**Trigger:** Click the `contact` node in the widget tree (or navigate to Contact section)

**Effect:** Properties panel shows an animated pipeline at the bottom:

```
Future<Job> ──── await ──── resolved ✓
     │
     └── then((job) => sendEmail(job))
```

The pipeline animates left-to-right with a travelling pulse dot. Initially shows `pending...`, then after 2s resolves to `✓`.

When the Hire button is clicked/hovered, it immediately resolves with a green `✓` and console: `[INFO] Future<Job> resolved! await is complete.`

---

### EGG-30 — Context Depth Meter

**Trigger:** Always-on overlay when DevMode is active. Shows in bottom-left corner of content area.

**Effect:** Small floating badge:
```
MaterialApp > Scaffold > SingleChildScrollView > Hero > Column > Text
depth: 6
```

Updates as user scrolls through sections (depth changes based on nearest section). Text scrolls horizontally if overflow.

```css
.dt-context-meter {
  position: sticky;
  bottom: 8px;
  left: 8px;
  background: rgba(30, 34, 39, 0.9);
  border: 1px solid var(--dt-border);
  font-family: var(--dt-font);
  font-size: 9px;
  color: var(--dt-text-dim);
  padding: 3px 8px;
  border-radius: 4px;
  pointer-events: none;
  max-width: 400px;
  overflow: hidden;
  white-space: nowrap;
}
```

---

### EGG-31 — Hot Reload (`r` key)

**Trigger:** Press `r` key while in DevMode (not while typing in console)

**Effect:**
1. Yellow flash overlay on content area (100ms, then fades)
2. Console:
```
> r
Performing hot reload... 🔥
Reloaded 1 of 847 libraries in 234ms.
```
3. Content area has a subtle `translateY(0 → 3px → 0)` shake (CSS keyframe, 200ms)

```css
@keyframes hot-reload-shake {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(3px); }
}
.hot-reloading {
  animation: hot-reload-shake 0.2s ease;
}
```

**Yellow flash:**
```css
.hot-reload-flash {
  position: absolute;
  inset: 0;
  background: rgba(225, 192, 100, 0.15);
  animation: flash-out 0.3s ease forwards;
  pointer-events: none;
}
@keyframes flash-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

---

### EGG-32 — Hot Restart (`R` key)

**Trigger:** Press `Shift+R` (capital R) while in DevMode

**Effect:**
1. Full white flash overlay (300ms, covers entire shell)
2. Console clears, then shows full restart sequence:
```
> R
Performing hot restart...
Restarting application...
Initializing DevTools connection...
[INFO] Portfolio initialised. Rendering 847 widgets...
[INFO] DevTools connected. Inspector active.
[INFO] Welcome back, visitor. All state reset.
```
3. All panel states reset (no selected nodes, no active overlays)
4. Widget tree collapses all expanded nodes
5. Properties panel returns to default (App info) state

---

### EGG-33 — Isolate Viewer

**Trigger:** Click `Memory` tab → `Isolates` sub-section

**Effect:** Below the heap treemap, a section shows:

```
Isolates
─────────────────────────────────────────────
● main          [active]     847 objects    🟢
● image_decode  [active]      23 objects    🟢  
● portfolio_dreams [suspended] 1 object     🟡
  └─ Future<Dream> { getHired: pending }
─────────────────────────────────────────────
```

The `portfolio_dreams` isolate has a small blinking `⏳` icon. Hover: `"This isolate is awaiting external input (recruiter). Resume by calling hire()."`.

---

### EGG-34 — Animation Controller Scrubber

**Trigger:** Automatically appears at bottom of content area when **Slow Animations (EGG-12)** is ON

**Effect:** A horizontal scrubber slider (0% → 100%) appears at the very bottom of `#dt-content-area`:

```css
.dt-anim-scrubber {
  position: sticky;
  bottom: 0;
  left: 0; right: 0;
  background: rgba(30, 34, 39, 0.95);
  border-top: 1px solid var(--dt-border);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-text-dim);
}
```

Dragging the slider sets `document.documentElement.style.setProperty('--anim-progress', value)` and pauses all CSS animations, setting `animation-delay` to `-{progress * duration}ms`.

Label left: `AnimationController`. Label right: `{value}%`.

---

### EGG-35 — Constraints Visualiser

**Trigger:** Toggle button `📐 Constraints` in Properties panel

**Effect ON:** Each portfolio section gets a small badge overlay in its top-right corner:

| Section | Badge text | Colour |
|---------|-----------|--------|
| Hero | `tight constraints` | `--dt-red` |
| Projects | `loose constraints` | `--dt-green` |
| About | `tight constraints` | `--dt-red` |
| Experience | `loose constraints` | `--dt-green` |
| Contact | `loose constraints` | `--dt-green` |

```css
.dt-constraints-badge {
  position: absolute;
  top: 8px; right: 8px;
  font-family: var(--dt-font);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
}
```

Hover tooltip: `"Tight: parent dictates exact size. Loose: child chooses within min/max bounds."`

---
## Category 4 — pub.dev & Dart Ecosystem

### EGG-36 — pubspec.yaml Skills View

**Trigger:** Click `Skills` section node in widget tree → Properties panel shows a `pubspec.yaml` toggle button `📦 pubspec view`

**Effect:** The Skills section in the content area re-renders as a syntax-highlighted `pubspec.yaml` block:

```yaml
name: vatsal_jaganwala
description: Flutter developer with a passion for clean architecture.
version: 2.3.1+42
publish_to: 'hired'

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: '>=3.19.0'

dependencies:
  flutter_bloc: ^8.1.3       # State management (preferred)
  riverpod: ^2.4.9           # Reactive state, second opinion
  go_router: ^13.2.0         # Navigation
  dio: ^5.4.0                # HTTP client
  hive_flutter: ^1.1.0       # Local storage
  freezed: ^2.4.5            # Immutable models

dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.3
  bloc_test: ^9.1.5
  self_doubt: any            # Currently: 0.0.0 (resolved)
```

Rendered as a `pre` code block with syntax colouring matching the DevTools palette. Toggle back restores the normal skills view.

---

### EGG-37 — pub.dev Package Card

**Trigger:** In the Projects section (dev mode), a `smartpub` card appears styled exactly like a pub.dev package card

**Visual structure:**
```
┌─────────────────────────────────────────────────────┐
│  📦 smartpub  v1.2.0                    [pub.dev ↗] │
│  A smart dependency auditor for Flutter projects.    │
│                                                      │
│  ★★★★★  Pub Points: 130/160  Likes: 47             │
│  Popularity: 72%   Platform: ✓ Dart ✓ Flutter       │
│                                                      │
│  [Flutter Favourite ⭐]  [Null Safe ✓]              │
└─────────────────────────────────────────────────────┘
```

Click `[pub.dev ↗]` → opens real pub.dev link for smartpub in new tab.

CSS matches pub.dev card aesthetic: white/off-white card with blue accent, pub.dev font.

---

### EGG-38 — Dependency Graph

**Trigger:** Toggle button `🕸 Dep Graph` in Properties panel when Skills node selected

**Effect:** An animated SVG/Canvas graph replaces the Skills section content:
- Central node: `Flutter` (large, `--dt-blue`)
- Orbiting nodes: `flutter_bloc`, `riverpod`, `go_router`, `dio`, `hive`, `freezed`, `jaspr`
- Edges: animated dashed lines connecting Flutter to each package
- Hover a node → tooltip: `{package}: {version} — {Vatsal's experience level}`

Nodes orbit slowly using CSS `animation: orbit {n}s linear infinite` with different durations.

**Console:** `[DEBUG] Rendering dependency graph. 8 nodes, 8 edges. No circular dependencies detected.`

---

### EGG-39 — Version Conflict Simulator

**Trigger:** Type `pub upgrade --major-versions` → Enter

**Console output:**
```
> pub upgrade --major-versions
Resolving dependencies...
  Because riverpod >=2.0.0 requires dart >=3.0.0
  And your_hesitation ^1.0.0 requires dart <2.0.0,
  version solving failed.

The following packages are incompatible:
  your_hesitation: ^1.0.0
  dart_confidence: >=3.0.0

Suggestion: Remove your_hesitation from pubspec.yaml.
Run ./hire.sh to resolve all conflicts.
```

`./hire.sh` is a clickable link → triggers EGG-79.

---

### EGG-40 — CHANGELOG Career View

**Trigger:** Click the version pill `v2.3.1+42` anywhere in the DevTools UI (tab bar or Properties panel)

**Effect:** A modal overlay appears:

```
╔══════════════════════════════════════════════════╗
║  CHANGELOG.md — Vatsal Jaganwala Career Edition  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  ## [2.3.1+42] — 2024-09-01                     ║
║  - feat: shipped TaskFlow to production          ║
║  - feat: published smartpub to pub.dev           ║
║  - fix: reduced impostor syndrome by 40%         ║
║  - perf: coffee intake optimised (3→2 cups/day)  ║
║                                                  ║
║  ## [2.2.0+38] — 2023-06-15                     ║
║  - feat: mastered flutter_bloc pattern           ║
║  - feat: first enterprise Flutter app (Prestige) ║
║  - fix: removed all setState() from ViewModels   ║
║  - chore: migrated 3 apps to null safety         ║
║                                                  ║
║  ## [2.0.0+20] — 2022-08-01                     ║
║  - feat!: BREAKING — switched from GetX to Bloc  ║
║  - feat: first Flutter production deployment     ║
║  - fix: stopped force-unwrapping optionals       ║
║  - docs: wrote first technical blog post         ║
║                                                  ║
║  ## [1.0.0+1] — 2021-01-01                     ║
║  - feat: initial release — Hello, Flutter!       ║
║  - feat: survived first StatefulWidget           ║
║                                                  ║
║                              [✕ Close]           ║
╚══════════════════════════════════════════════════╝
```

Rendered as a modal with `backdrop-filter: blur(4px)`, monospace font, syntax-highlighted version numbers in `--dt-orange`.

---

### EGG-41 — Pub Points Breakdown

**Trigger:** Click the `smartpub` package card (EGG-37) → Properties panel updates to show pub points breakdown

**Properties panel content:**
```
pubPoints: 130 / 160

Follows Dart conventions    ✓   30 / 30
Provides documentation      ✓   20 / 20
Passes static analysis      ✓   50 / 50
Has up-to-date deps         ✓   20 / 20
Supports multiple platforms ⚠   10 / 20
  → Add Windows/Linux tests
```

Checkmarks in `--dt-green`, warning in `--dt-yellow`.

---

### EGG-42 — DartPad Embed

**Trigger:** Hover any code snippet in dev mode → a `▶ Open in DartPad` button appears

**Click effect:** A modal expands with a fake DartPad UI:
- Left panel: code editor (read-only `pre` block, monospace, line numbers)
- Right panel: fake output area
- `▶ Run` button at top

**Clicking Run:**
- Fake compile animation: `Compiling...` (800ms)
- Then output appears:
```
Dart SDK 3.5.0
Hello, Flutter! ✓
Build time: 234ms
```

The specific code shown depends on which snippet was hovered (skill snippet, project snippet, etc.).

---
## Category 5 — State Management Showcase

### EGG-43 — State Management Selector

**Trigger:** A segmented control appears in the Properties panel header when any project node is selected.

**Options:** `Bloc` | `Riverpod` | `Provider` | `GetX` | `setState`

**Effect on switch:**
- Widget tree node args update: `stateLib: "Riverpod"` etc.
- Console logs a state-specific message (see EGG-44, EGG-45)
- Properties panel `stateLib` value updates with colour-coded badge

**GetX selection:** Console: `[WARNING] GetX selected. Consider migrating to Bloc for testability.`
**setState selection:** Console: `[WARNING] setState() in production? Bold choice. setState storm incoming...` → triggers EGG-25 after 500ms.

---

### EGG-44 — Bloc Event Log

**Trigger:** Select `Bloc` in the state management selector (EGG-43)

**Console output (staggered, 300ms apart):**
```
[Bloc] ProjectsBloc: ProjectsFetchEvent → ProjectsLoading
[Bloc] ProjectsBloc: ProjectsLoaded { count: 3 }
[Bloc] SkillsBloc: SkillsLoadEvent → SkillsLoaded
[Bloc] ContactBloc: HireEvent { from: "recruiter" } → HireSuccess
[Bloc] NavigationBloc: RouteChangedEvent → Route('/projects/taskflow')
```

Each line styled with `[Bloc]` prefix in `--dt-purple`. Mimics `flutter_bloc`'s exact debug output format.

---

### EGG-45 — Riverpod Provider Graph

**Trigger:** Select `Riverpod` in the state management selector

**Effect:** Properties panel shows a provider dependency graph:

```
portfolioProvider
  └── projectsProvider
        └── apiProvider
              └── dioProvider
  └── skillsProvider
  └── contactProvider
        └── Future<Job>  ← pending
```

Each provider node is a clickable item. Clicking shows: `ProviderScope > ProviderContainer > {name}`.

**Console:** `[Riverpod] All providers initialised. 0 circular dependencies. portfolioProvider: AsyncData<Portfolio>.`

---

### EGG-46 — State Wars Modal

**Trigger:** Click `?` icon next to the state management selector

**Effect:** A modal titled **"The State Management Wars"**:

```
╔══════════════════════════════════════════════════════╗
║         ⚔️  The State Management Wars  ⚔️            ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Feature          Bloc    Riverpod  Provider  GetX   ║
║  ─────────────────────────────────────────────────   ║
║  Testability       ★★★★★   ★★★★★    ★★★☆☆   ★☆☆☆☆  ║
║  Learning curve    steep   steep    gentle   easy    ║
║  Boilerplate       high    medium   low      none    ║
║  Community         ★★★★★   ★★★★☆    ★★★☆☆   ★★★☆☆  ║
║  Opinion-free      no      mostly   yes      lol no  ║
║  Vatsal uses       ✓ yes   ✓ yes    ✓ older  ✗ past  ║
║                                                      ║
║  Verdict: "Use Bloc or Riverpod. Fight me." — Vatsal ║
║                                                      ║
║                                        [✕ Close]    ║
╚══════════════════════════════════════════════════════╝
```

---
## Category 6 — Platform & Device Features

### EGG-47 — Platform Switcher

**Trigger:** Dropdown in the DevTools tab bar right side: `🌐 Web` | `🤖 Android` | `🍎 iOS` | `🖥 macOS` | `🪟 Windows` | `🐧 Linux`

**Effect:** The phone mockup frames around project screenshots change. The Properties panel updates `platform` value. Console logs:
```
[INFO] Platform switched to Android. Running on Pixel 8 emulator.
[INFO] Material 3 design system active.
```

**iOS selection:** Console: `[INFO] Platform switched to iOS. Running on iPhone 15 simulator. Cupertino widgets active.`

**Visual:** A small platform badge appears in the tab bar after selection.

---

### EGG-48 — Adaptive UI Preview

**Trigger:** Toggle button `⬛⬛ Split View` in tab bar

**Effect:** The Projects section shows a side-by-side split:
- Left half: Android (Material 3) style — filled buttons, FAB, card elevation shadows
- Right half: iOS (Cupertino) style — text buttons, nav bar, no shadows

Labels `Android` and `iOS` appear at top of each column. A vertical divider separates them.

On narrow screens (< 768px), tabs to switch between Android/iOS views instead of splitting.

**Console:** `[INFO] Adaptive layout preview active. Same content, different design systems.`

---

### EGG-49 — Device Frame Selector

**Trigger:** Click any project card mockup image → a dropdown appears:

**Options:** `Pixel 8` | `iPhone 15` | `Galaxy S24` | `iPad Pro` | `Pixel Tablet`

**Effect:** The mockup frame SVG changes to match the selected device. Aspect ratio adjusts accordingly. Uses SVG device frame silhouettes.

**Console:** `[INFO] Device frame: ${device}. Resolution: ${width}×${height}dp. Pixel density: ${dpi}x.`

---

### EGG-50 — Screen Size Breakpoints

**Trigger:** Toggle button `📏 Breakpoints`

**Effect:** Horizontal dashed lines appear over content area marking breakpoint widths, plus a badge on each line:

```
xs: 0px ─────────────────────────────────
sm: 600px ────────────────────────────────  ← current (highlighted)
md: 1024px ───────────────────────────────
lg: 1440px ───────────────────────────────
```

The currently active breakpoint line is `--dt-blue`; others are `--dt-text-dim`. A floating badge shows `Active: sm (600–1023px)`.

**CSS:**
```css
.dt-breakpoint-line {
  position: absolute;
  left: 0; right: 0;
  border-top: 1px dashed var(--dt-text-dim);
  pointer-events: none;
}
.dt-breakpoint-line.active {
  border-color: var(--dt-blue);
}
```

---

### EGG-51 — Platform Channel Visualiser

**Trigger:** Click `Network` tab → `Platform Channels` sub-section

**Effect:** A table of fake platform channel calls:

| Channel | Direction | Method | Result |
|---------|-----------|--------|--------|
| `MethodChannel('biometric')` | → native iOS | `authenticate()` | `true` |
| `MethodChannel('camera')` | → native Android | `takePicture()` | `File(...)` |
| `EventChannel('battery')` | ← native | `batteryLevel` | `87` |
| `BasicMessageChannel('config')` | ↔ bidirectional | `getTheme()` | `'dark'` |

Shows you understand native-Dart bridge communication.

---

### EGG-52 — Safe Area Overlay

**Trigger:** Toggle button `🛡 Safe Area` (visible when a phone mockup is in view)

**Effect:** On phone mockup images, green overlay shows safe area insets; red overlay shows unsafe/notch areas:
- Top 44px: red (notch/dynamic island)
- Bottom 34px: red (home indicator)
- Content area: green

Small labels: `Safe Area ✓` and `Unsafe ✗`.

---

## Category 7 — Testing & CI/CD

### EGG-53 — Test Runner Panel

**Trigger:** Type `flutter test` → Enter (already defined in EGG-07)

Additional: In the `Logging` tab, a persistent test runner panel shows the last test run results with pass/fail dots.

---

### EGG-54 — Code Coverage Map

**Trigger:** Toggle button `🎨 Coverage` in tab bar

**Effect:** Each portfolio section gets a colour overlay:

| Section | Coverage | Colour | Tooltip |
|---------|----------|--------|---------|
| Hero | 100% | green | `All animations tested` |
| Projects | 87% | yellow-green | `3 edge cases untested` |
| Skills | 0% | red | `TODO: add tests for impostor syndrome handling` |
| Experience | 100% | green | `Timeline fully covered` |
| Contact | 74% | yellow | `async hire flow partially tested` |

Coverage overlays use `rgba` colours on top of sections. Tooltip appears on hover.

---

### EGG-55 — Golden Test Failure

**Trigger:** Double-click any section in the content area

**Effect:** A split-screen modal appears:
- Left: "Current" — screenshot of the section (or a styled recreation)
- Right: "Expected" — same but with a slightly shifted layout (CSS `transform: translateX(8px)`)
- Banner: `FAIL: 47 pixels differ. Golden test mismatch.`
- Diff count badge: red `● 47px`

```css
.dt-golden-diff {
  position: fixed;
  inset: 10%;
  background: var(--dt-bg);
  border: 1px solid var(--dt-border);
  z-index: 9000;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 8px;
}
```

**Close:** `[✕ Close]` button or `Escape` key. Console: `[DEBUG] Golden test dismissed. Run flutter test --update-goldens to accept.`

---

### EGG-56 — CI Pipeline Status

**Trigger:** Always-on status pill in right side of tab bar

**Visual:**
```
✓ Build  ✓ Tests  ✓ Pub ready
```

Clicking opens a fake GitHub Actions log modal:
```
Run flutter test
  ✓ All tests passed (5 tests)
Run flutter analyze
  ✓ No issues found
Run flutter build web
  ✓ Built build/web (2.4MB)
Run pub publish --dry-run
  ✓ Package is ready to publish
```

Each line appears with a 200ms stagger. Total duration badge: `45s`.

---

### EGG-57 — Lint Rules Overlay

**Trigger:** Toggle button `〰 Lint` in Properties panel

**Effect:** Coloured squiggly underlines appear under text content (like IDE lint warnings):
- Blue squiggle under main heading: `prefer_const_constructors`
- Yellow squiggle under skill labels: `avoid_underpricing_yourself: Senior skills detected`
- Green squiggle under "Hire" text: `lint_passed: This call is safe`

Hover a squiggle → tooltip with the lint rule name and description.

```css
.dt-lint-warning {
  text-decoration: underline wavy var(--dt-yellow);
  text-underline-offset: 3px;
  cursor: help;
}
.dt-lint-error {
  text-decoration: underline wavy var(--dt-red);
  text-underline-offset: 3px;
}
.dt-lint-info {
  text-decoration: underline wavy var(--dt-blue);
  text-underline-offset: 3px;
}
```

---
## Category 8 — Community & Culture

### EGG-58 — Flutter Favourite Badge

**Trigger:** Automatic — appears on the `smartpub` pub.dev card (EGG-37)

**Visual:** A gold star badge in the top-right corner of the package card:
```
[⭐ Flutter Favourite]
```

```css
.dt-flutter-fav {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  font-family: var(--dt-font);
  font-size: 9px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 99px;
}
```

Hover tooltip: `"Flutter Favourite: Packages that demonstrate high quality, active maintenance, and community trust."`

---

### EGG-59 — Flutter Weekly Feature

**Trigger:** Automatic banner when Projects section enters viewport in DevMode

**Visual:** A small banner pill appears above the Projects section:
```
📰 As seen in Flutter Weekly #312  →
```

Styled as a blue pill. Clicking opens `https://flutterweekly.net` in a new tab.

---

### EGG-60 — Stack Overflow Mode

**Trigger:** Type `stackoverflow` → Enter

**Console output:**
```
> stackoverflow
Searching Stack Overflow for Flutter solutions...

Top questions answered by Vatsal Jaganwala:

  Q: How to center a Widget in Flutter?
  A: [Vatsal Jaganwala] ✓ Accepted — 847 upvotes
  → Center(child: YourWidget())

  Q: setState vs Bloc — when to use which?
  A: [Vatsal Jaganwala] ✓ Accepted — 312 upvotes

  Q: How to handle null safety migration?
  A: [Vatsal Jaganwala] ✓ Accepted — 234 upvotes

  Q: Best practices for Flutter architecture?
  A: [Vatsal Jaganwala] ✓ Accepted — 189 upvotes

  Q: How to parse DWG files in Flutter?
  A: [Vatsal Jaganwala] ✓ Accepted — 42 upvotes
     (only answer in existence)
```

Accepted answers in `--dt-green`. The DWG answer has a wink.

---

### EGG-61 — GPT vs Flutter Dev

**Trigger:** Hidden toggle — click the `Connected` status pill in tab bar 3 times rapidly

**Effect:** The Properties panel replaces its content with a fake chat:

```
╔══════════════════════════════════════╗
║   ChatGPT vs. Real Flutter Dev       ║
╠══════════════════════════════════════╣
║                                      ║
║ ChatGPT: "Use setState everywhere.   ║
║  It's simpler and works fine."       ║
║                                      ║
║ Vatsal: "No. setState for leaf       ║
║  widgets only. Bloc for anything     ║
║  that crosses widget boundaries."   ║
║                                      ║
║ ChatGPT: "Just wrap in FutureBuilder"║
║                                      ║
║ Vatsal: "Please don't."              ║
║                                      ║
║ ChatGPT: "Use a global variable for  ║
║  state management."                  ║
║                                      ║
║ Vatsal: *exits chat*                 ║
╚══════════════════════════════════════╝
```

ChatGPT lines in `--dt-yellow`, Vatsal lines in `--dt-green`.

---

### EGG-62 — Flutter Discord Status

**Trigger:** Automatic — always shown in right side of tab bar

**Visual:** Small status pill:
```
🟢 Online — Flutter Discord
```

Clicking opens the Flutter Discord invite link or Vatsal's GitHub profile. Pill turns grey (`⚫ Away`) after 5 minutes of idle.

---

### EGG-63 — Discord Channel Log

**Trigger:** Type `discord` → Enter

**Console output (fake Flutter Discord #general messages scrolling by):**
```
> discord
Connecting to Flutter Discord #general...

[TimoEr]: anyone else still hate Navigator 1.0?
[RemiR]: go_router exists, move on
[VatsalJaganwala]: shipped my smartpub package today 🎉
[RemiR]: nice! pub points?
[VatsalJaganwala]: 130/160. Working on the last 30.
[filiph]: just use Jaspr for your portfolio 😉
[VatsalJaganwala]: already on it
[TimoEr]: setState is fine for small apps
[VatsalJaganwala]: *prepares bloc lecture*
[RemiR]: oh no
```

Lines appear with 400ms stagger. `[VatsalJaganwala]` in `--dt-blue`, others in `--dt-text-dim`.

---

### EGG-64 — DartPad Challenge

**Trigger:** Type `dart challenge` → Enter

**Console output:**
```
> dart challenge
══ Dart Challenge ══════════════════════
Fix the following code to pass null safety:

  String? name = null;
  print(name.length);  // ← broken

Options:
  A) print(name!.length)
  B) print(name?.length ?? 0)
  C) print(name.toString().length)

Type A, B, or C:
```

**If user types `B` (correct):**
```
> B
✓ Correct! B is the safe choice.
?? operator provides a fallback. ! would throw.
[INFO] You think like a Dart developer.
```
Confetti fires.

**If wrong:**
```
> A
✗ Not ideal. ! will throw if name is null at runtime.
  Use ?. and ?? for true null safety.
```

---
## Category 9 — Personal & Career-specific

### EGG-65 — smartpub Live Stats

**Trigger:** Automatic — on DevMode entry, fetch real pub.dev API stats for smartpub

**API call:**
```js
fetch('https://pub.dev/api/packages/smartpub')
  .then(r => r.json())
  .then(data => updateSmartpubStats(data));
```

**Properties panel update (smartpub node):**
```
pubPoints    : 130 / 160        (live)
likes        : 47               (live)
popularity   : 72%              (live)
downloads    : 1,234            (live)
lastPublished: 2024-08-15       (live)
```

All values have the `--dt-red` pulsing dot (live indicator). If API fails, falls back to hardcoded values with `[cached]` label.

**Console:** `[INFO] Fetching live stats for smartpub from pub.dev API...`
then: `[INFO] smartpub v1.2.0 — 130 pub points, 47 likes. Real numbers.`

---

### EGG-66 — DWG Parser Easter Egg

**Trigger:** Type `dwg` → Enter

**Console output (staggered):**
```
> dwg
Parsing .dwg file...

00000000: 4143 3139 3135 0000 0000 0000 0000 0500  AC1915..........
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................

DWG file version: AC1015 (AutoCAD 2000)
Entities found: 2,847
Block definitions: 12

Rendering floor plan...
```

Then a tiny ASCII floor plan renders in the console:
```
┌─────────────────┐
│  Living Room    │
│                 ├──┐
│                 │  │ Bath
├────────┬────────┤  │
│ Bed 1  │ Bed 2  ├──┘
│        │        │
└────────┴────────┘
  Flutter HQ — Floor 3
```

**Console:** `[INFO] DWG parsing complete. This is a niche skill. Not many Flutter devs can do this.`

---

### EGG-67 — Jaspr Meta-Reference

**Trigger:** Click the `body` node (`SingleChildScrollView`) in the widget tree

**Effect:** A special comment appears in Properties panel at the top:

```
// Built with Jaspr — Dart web framework
// jaspr.site — Dart for the web
```

In `--dt-text-dim`, italic. Rendered as a clickable link — clicking opens `https://jaspr.site` in a new tab.

**Console:** `[INFO] Portfolio rendered by Jaspr. Dart from server to client. No JS required.`

---

### EGG-68 — Git Log Timeline

**Trigger:** Type `git log` → Enter

**Console output (staggered, formatted like real git log):**
```
> git log --oneline --graph

* f71c304  (HEAD → main) feat: built portfolio in Jaspr
* 3b9e821  feat: published smartpub to pub.dev
* a4f2c1d  feat: shipped TaskFlow to production
* 9d2e831  feat: joined enterprise Flutter team (Prestige/Godrej)
* 77fa210  fix: stopped using StatefulWidget for everything
* 2c3a891  feat: mastered flutter_bloc pattern
* 8b4c120  refactor: migrated all apps to null safety
* 1d5f803  perf: coffee intake optimised
* 0a2b9c1  feat: first Flutter production deployment
* c7e4d12  fix: stopped force-unwrapping optionals (!)
* b3f8a01  chore: graduated college
* a1b2c3d  feat: hello, Flutter 🎉
* 0000001  init: Hello, World
```

Commit hashes in `--dt-orange`, messages in `--dt-text`. The `HEAD` ref in `--dt-blue`.

---

### EGG-69 — about_me.dart Hover Docs

**Trigger:** In the About section (DevMode active), hover any line of the displayed code or data

**Effect:** A VS Code-style tooltip appears with a Dart doc comment:

| Hovered element | Tooltip |
|----------------|---------|
| Years of experience | `/// Years of professional Flutter experience.\n/// Increases annually. Currently: 2.` |
| Location | `/// Current base: Ahmedabad, India.\n/// Open to remote opportunities worldwide.` |
| Flutter logo | `/// Framework of choice since 2021.\n/// null safety enthusiast.` |
| Name | `/// String name = 'Vatsal Jaganwala';\n/// final String profession = 'Flutter Developer';` |

```css
.dt-dart-doc {
  position: fixed;
  max-width: 320px;
  background: #1a1d23;
  border: 1px solid var(--dt-border);
  border-radius: 4px;
  padding: 8px 12px;
  font-family: var(--dt-font);
  font-size: 11px;
  color: var(--dt-text);
  z-index: 9000;
  pointer-events: none;
  line-height: 1.6;
}
.dt-dart-doc .doc-comment { color: var(--dt-green); }
```

---

### EGG-70 — Prestige/Godrej Project Node

**Trigger:** A hidden tree node `EnterpriseClient` in the widget tree (collapsed under `experience` node by default, not immediately visible)

**Expanding `EnterpriseClient`:**
```
EnterpriseClient
  └── PrestigeGroup
  │     args: 'floors: 847, units: 312'
  └── GodrejProperties
        args: 'projects: ["Meridian", "Golf Links"]'
```

**Click `PrestigeGroup`:** Properties panel shows:
```
clientName  : "Prestige Group"       string
projectType : "Floor plan digitiser"  string
techStack   : "[Flutter, DWG Parser]" string
scale       : "Enterprise"            enum
delivered   : true                    bool
nda         : true                    bool
```

**Console:** `[INFO] Enterprise client loaded. Details available upon request (NDA).`

---
## Category 10 — Delightful Micro-moments

### EGG-71 — Konami Code → God Mode

**Trigger:** ↑ ↑ ↓ ↓ ← → ← → B A (keyboard arrow keys + B + A)

**Implementation:**
```js
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiProgress = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiSequence[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konamiSequence.length) {
      activateGodMode();
      konamiProgress = 0;
    }
  } else {
    konamiProgress = 0;
  }
});
```

**Effect:**
1. All performance bars in Performance tab jump to 100% / 60fps instantly
2. Matrix-style falling code overlay (green characters falling, `canvas` fullscreen, 3s then fades)
3. Console:
```
[INFO] ↑↑↓↓←→←→BA detected.
[INFO] God mode enabled. All systems optimal.
[INFO] Performance: 60fps sustained. Memory: clean.
[INFO] Imposter syndrome: deleted.
```
4. Confetti burst
5. Properties panel: `godMode: true  bool` added at top

---

### EGG-72 — Jank Frame Spike

**Trigger:** Automatic — fires once after 60 seconds of DevMode being open with no interaction (idle)

**Effect:** One red bar spike appears in the Performance Overlay (EGG-13) or in the Performance tab bars:
- A single frame bar in the UI thread shoots to 120ms (red, far above 16ms threshold)
- Label: `⚠ Jank frame: "thinking about refactoring"`

After 2 seconds, the spike returns to normal. Console: `[DEBUG] Frame spike detected at t=60s. Cause: cognitive overhead. Fix: ship it.`

---

### EGG-73 — CHANGELOG Career View

*(This is the same as EGG-40 — clicking version pill. Registered as separate egg counter entry.)*

**Additional trigger:** Type `changelog` → Enter → opens the same modal.

---

### EGG-74 — Time-Based Console Greeting

**Trigger:** Automatic — first log line on DevMode entry

**Logic:**
```js
const hour = new Date().getHours();
let greeting;
if (hour >= 5 && hour < 12)       greeting = 'Good morning! Portfolio ready for inspection.';
else if (hour >= 12 && hour < 17) greeting = 'Good afternoon! DevTools connected and ready.';
else if (hour >= 17 && hour < 21) greeting = 'Good evening! Hope the portfolio impresses.';
else                               greeting = 'Late night coding session? Portfolio ready. ☕';
```

`[INFO] ${greeting}` — always the very first log entry, before the staggered initialisation logs.

---

### EGG-75 — Visitor Fake Analytics

**Trigger:** Automatic — Properties panel shows analytics when no node is selected (default state)

**Additional row in build metadata:**
```
activeVisitors  : 2          live num
totalVisits     : 1,247      live num
```

Both have `--dt-red` pulsing live dot.

`totalVisits` increments by 1 every 45–90 seconds (random). When it increments:
```
[DEBUG] New visitor from Berlin. Total: 1,248.
```

Random cities: Berlin, Tokyo, San Francisco, London, Mumbai, Singapore, Sydney, Toronto.

`activeVisitors` randomly fluctuates between 1–3 every 2 minutes.

---

### EGG-76 — Credits Modal

**Trigger:** Click the Flutter `F` logo in the tab bar 5 times rapidly (within 3 seconds)

**Effect:** A modal appears:

```
╔═════════════════════════════════════╗
║                                     ║
║   void main() {                     ║
║     runApp(Portfolio());            ║
║   }                                 ║
║                                     ║
║   Built with ❤️ by Vatsal Jaganwala║
║                                     ║
║   Stack:                            ║
║   • Jaspr — Dart web framework      ║
║   • Flutter DevTools aesthetic      ║
║   • JetBrains Mono font             ║
║   • 847 widgets (approx)            ║
║   • Excessive attention to detail   ║
║                                     ║
║   [GitHub ↗]  [LinkedIn ↗]  [✕]   ║
╚═════════════════════════════════════╝
```

**Console:** `[INFO] void main() { runApp(Portfolio()); } // It all starts here.`

---

### EGG-77 — Theme Switcher

**Trigger:** Type `theme` → Enter (cycles through themes on each call)

**4 themes:**

| Index | Name | Primary colour | Description |
|-------|------|----------------|-------------|
| 0 | default | `#61AFEF` cyan | Original DevTools palette |
| 1 | material-you | `#C678DD` purple | Material You inspired |
| 2 | hacker | `#98C379` green | Matrix/terminal green |
| 3 | dart | `#E5C07B` orange | Dart brand orange |

**Implementation:** Override `--dt-blue` CSS variable:
```js
const themes = ['#61AFEF', '#C678DD', '#98C379', '#E5C07B'];
document.documentElement.style.setProperty('--dt-blue', themes[themeIndex]);
```

**Console:**
```
> theme
[INFO] Theme switched to: material-you (purple)
[DEBUG] --dt-blue: #C678DD applied to 47 elements.
```

---

### EGG-78 — Easter Egg Counter

**Trigger:** Automatic — updates whenever an egg is triggered

**Visual:** Small badge permanently in the tab bar right side:
```
🥚 3/15 found
```

**Implementation:**
```js
function markEggFound(eggId) {
  if (!easterEggState.found.has(eggId)) {
    easterEggState.found.add(eggId);
    easterEggState.foundCount++;
    updateEggCounter();
    if (easterEggState.foundCount === 15) {
      triggerAllEggsFound();
    }
  }
}
```

**All eggs found (15/15):** Console:
```
[INFO] 🥚 All 15 easter eggs found!
[INFO] You are a Flutter detective. Impressive.
[INFO] Unlocking: hire.sh auto-execute in 3... 2... 1...
```
Then automatically triggers EGG-79.

---

### EGG-79 — hire.sh execution

**Trigger:** Type `./hire.sh` → Enter  
*(Also triggered by EGG-78 completion and clickable link in EGG-01 and EGG-39)*

**Console output (staggered, 300ms per line):**
```
> ./hire.sh
#!/bin/bash
# hire.sh — Vatsal Jaganwala Hire Script v1.0

echo "Validating candidate..."
  → Checking Flutter expertise...       ✓
  → Checking pub.dev packages...        ✓ (smartpub published)
  → Checking null safety compliance...  ✓
  → Checking Bloc/Riverpod mastery...   ✓
  → Checking enterprise experience...   ✓ (Prestige, Godrej)
  → Checking self-awareness...          ✓ (this portfolio exists)

echo "All checks passed."
echo "Opening email client..."

Launching: mailto:vatsal@example.com
Subject: "Re: Flutter Developer Role — You passed hire.sh"
```

After the final line, `window.open('mailto:vatsal@example.com?subject=Re: Flutter Developer Role — You passed hire.sh')` is called.

**Console final line:** `[INFO] hire.sh exited with code 0. See you in the interview.`

---

### EGG-80 — 404 Widget Not Found

**Trigger:** Any unrecognised command typed in console

**Console output:**
```
> {user_input}
[ERROR] WidgetNotFoundException: No widget found for command '{user_input}'.
  Did you mean: 'help'?

Stack trace:
  #0  ConsoleRouter.dispatch (console_router.dart:42)
  #1  DevModeShell.handleCommand (dev_mode_shell.dart:89)
  
Type 'help' to see all available commands.
```

`[ERROR]` in `--dt-red`. Stack trace lines in `--dt-text-dim`. `'help'` is a clickable span that runs the help command.

---
---

## Bonus Easter Eggs (New Additions)

### EGG-81 — Recruiter Mode

**Trigger:** Type `recruiter` → Enter

**Effect:** The Properties panel switches to a simplified "recruiter-friendly" view, replacing all technical Dart/Flutter jargon with plain language:

```
Before (dev mode):
  stateLib     : "flutter_bloc"
  buildMode    : "debug"

After (recruiter mode):
  experience   : "3+ years Flutter"
  availability : "Open to opportunities"
  salary       : "Competitive (open to discuss)"
  notice       : "2 weeks"
  relocate     : "Yes (remote preferred)"
  timezone     : "IST (GMT+5:30)"
```

**Console:** `[INFO] Recruiter mode activated. Translating tech jargon to English...`

Toggle off by typing `recruiter` again.

---

### EGG-82 — Vim Mode

**Trigger:** Type `vim` → Enter

**Effect:** The console input prompt changes to show vim modal indicator:
```
-- NORMAL --
```

Press `i` → switches to `-- INSERT --` mode (normal typing resumes).
Press `Esc` → back to `-- NORMAL --`.
Type `:wq` → exits vim and logs: `[INFO] Vim exited gracefully. A miracle.`
Type `:q!` → same exit, log: `[DEBUG] Force quit vim. The file was modified. Probably fine.`

This is a pure community in-joke about the difficulty of exiting Vim.

---

### EGG-83 — Dependency Injection Visualiser

**Trigger:** Type `di` → Enter

**Effect:** The widget tree temporarily shows decorative `@injectable` and `@lazySingleton` annotations next to nodes:

```
MaterialApp
  Scaffold
    PortfolioBody
      @lazySingleton ProjectRepository
      @injectable ProjectsBloc
      @singleton NavigationService
      ContactSection
        @injectable HireService  ← Future<Job> pending
```

**Console:** `[INFO] Dependency injection graph visualised. get_it + injectable pattern detected.`

Reverts after 5 seconds.

---

### EGG-84 — Code Review Comment

**Trigger:** Right-click any section in the content area while DevMode is active

**Effect:** A context menu appears (blocking browser default) with:
```
┌──────────────────────────────┐
│  📝 Leave Code Review Comment │
│  🔍 Inspect Element           │
│  ❤️  Approve this section     │
│  ✗  Request changes          │
└──────────────────────────────┘
```

**"Approve this section":** Confetti + console: `[INFO] LGTM ✓ — Section approved by reviewer.`

**"Request changes":** Console: `[WARNING] Reviewer requested changes: "Needs more coffee-driven development."`

**"Leave Code Review Comment":** A small input appears — type anything → it appears in the console as:
```
[DEBUG] Code review comment: "{your text}"
[INFO] Comment added to PR #42.
```

---

### EGG-85 — Stack Trace Explorer

**Trigger:** Click any `[ERROR]` log entry in the console

**Effect:** The entry expands to show a full formatted stack trace:

```
[ERROR] Clicked at 20:08:02
══════ Exception Details ══════════════
  Type: RecruiterNotFoundException
  Message: No recruiter found in current context

  Stack trace:
  #0  Vatsal.awaitJobOffer (career.dart:47)
  #1  Portfolio.build (portfolio.dart:23)
  #2  Element.rebuild (element.dart:891)
  #3  BuildOwner.buildScope (owner.dart:342)
  ════════════════════════════════════

  Suggestion: Call hire() to resolve.
  → [Copy] [Report] [Open hire.sh]
```

`[Open hire.sh]` triggers EGG-79.

---

## Phase 5 — Easter Eggs Implementation Checklist

### Console Command Router

All CLI easter eggs flow through a single `handleConsoleCommand(input)` function in `devmode.js`:

```js
const commands = {
  'flutter doctor':          () => eggFlutterDoctor(),
  'flutter clean':           () => eggFlutterClean(),
  'flutter pub get':         () => eggPubGet(),
  'flutter build web':       () => eggBuildWeb(),
  'flutter upgrade':         () => eggUpgrade(),
  'flutter analyze':         () => eggAnalyze(),
  'flutter test':            () => eggTest(),
  'flutter run --release':   () => eggRunRelease(),
  'help':                    () => eggHelp(),
  'dart --version':          () => eggDartVersion(),
  'git log':                 () => eggGitLog(),
  './hire.sh':               () => eggHireSh(),
  'null':                    () => eggNullCrash(),
  'stackoverflow':           () => eggStackOverflow(),
  'discord':                 () => eggDiscord(),
  'theme':                   () => eggTheme(),
  'dwg':                     () => eggDwg(),
  'pub upgrade --major-versions': () => eggVersionConflict(),
  'changelog':               () => eggChangelog(),
  'dart challenge':          () => eggDartChallenge(),
  'recruiter':               () => eggRecruiterMode(),
  'vim':                     () => eggVimMode(),
  'di':                      () => eggDiVisualiser(),
};

function handleConsoleCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  addCommandLine(raw); // echo input
  const handler = commands[cmd];
  if (handler) {
    handler();
    markEggFound(cmd);
  } else {
    eggNotFound(raw); // EGG-80
  }
}
```

---

### Toggle Button Registry

Add these toggle buttons to `devtools_tab_bar.dart` right-side area, or as a toolbar row beneath the tab bar:

| ID | Label | Default | Egg |
|----|-------|---------|-----|
| `repaint-rainbow` | `🌈 Repaint` | OFF | EGG-11 |
| `slow-animations` | `🐢 3×` | OFF | EGG-12 |
| `perf-overlay` | `📊 Perf` | OFF | EGG-13 |
| `semantics` | `♿ A11y` | OFF | EGG-14 |
| `debug-banner` | `🏴 DEBUG` | ON | EGG-17 |
| `constraints` | `📐 Const` | OFF | EGG-35 |
| `coverage` | `🎨 Cov` | OFF | EGG-54 |
| `lint` | `〰 Lint` | OFF | EGG-57 |
| `breakpoints` | `📏 BP` | OFF | EGG-50 |
| `data-flow` | `🔗 Flow` | OFF | EGG-27 |

All toggles share a common CSS class `.dt-toggle-btn` and `.dt-toggle-btn.active`.

```css
.dt-toggle-btn {
  font-family: var(--dt-font);
  font-size: 10px;
  padding: 2px 8px;
  background: transparent;
  border: 1px solid var(--dt-border);
  border-radius: 3px;
  color: var(--dt-text-dim);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.dt-toggle-btn.active {
  background: rgba(97, 175, 239, 0.15);
  border-color: rgba(97, 175, 239, 0.4);
  color: var(--dt-blue);
}
.dt-toggle-btn:hover:not(.active) {
  border-color: var(--dt-text-dim);
  color: var(--dt-text);
}
```

---

### Easter Egg Counter Implementation

```js
const ALL_EGGS = [
  'flutter-doctor', 'flutter-clean', 'flutter-pub-get',
  'flutter-build-web', 'flutter-test', 'flutter-analyze',
  'git-log', 'hire-sh', 'null-crash', 'konami',
  'repaint-rainbow', 'slow-animations', 'network-tab',
  'stackoverflow', 'state-wars',
];
const TOTAL_EGGS = ALL_EGGS.length; // shown as X/15 in badge

const foundEggs = new Set();

function markEggFound(eggId) {
  if (!foundEggs.has(eggId)) {
    foundEggs.add(eggId);
    updateEggBadge();
    if (foundEggs.size === TOTAL_EGGS) onAllEggsFound();
  }
}

function updateEggBadge() {
  const badge = document.getElementById('dt-egg-counter');
  if (badge) badge.textContent = `🥚 ${foundEggs.size}/${TOTAL_EGGS} found`;
}
```

Badge element in `devtools_tab_bar.dart`:
```html
<span id="dt-egg-counter" class="dt-egg-badge">🥚 0/15 found</span>
```

```css
.dt-egg-badge {
  font-family: var(--dt-font);
  font-size: 10px;
  color: var(--dt-text-dim);
  padding: 2px 8px;
  border: 1px solid var(--dt-border);
  border-radius: 99px;
  cursor: default;
  transition: color 0.3s;
}
.dt-egg-badge.has-found {
  color: var(--dt-yellow);
  border-color: rgba(225, 192, 100, 0.3);
}
```

---

### Confetti Implementation

Use [canvas-confetti](https://github.com/catdad/canvas-confetti) CDN for confetti bursts:

```html
<!-- in web/index.html -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
```

```js
function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#61AFEF', '#C678DD', '#98C379', '#E5C07B', '#E06C75'],
  });
}
```

Called by: EGG-04 (build web), EGG-64 (dart challenge correct), EGG-71 (Konami), EGG-78 (all eggs found), EGG-79 (hire.sh).

---

### Phase 5 Checklist

#### CLI Commands
- [ ] EGG-01: `flutter doctor` with clickable `./hire.sh`
- [ ] EGG-02: `flutter clean` with page flash effect
- [ ] EGG-03: `flutter pub get` with staggered packages
- [ ] EGG-04: `flutter build web` with confetti
- [ ] EGG-05: `flutter upgrade` with version diff
- [ ] EGG-06: `flutter analyze` with lint hints + hire() link
- [ ] EGG-07: `flutter test` with animated test runner
- [ ] EGG-08: `flutter run --release` exits DevMode
- [ ] EGG-09: `help` shows full command table
- [ ] EGG-10: `dart --version` with cheeky message

#### DevTools Toggles
- [ ] EGG-11: Repaint rainbow toggle + CSS animation
- [ ] EGG-12: Slow animations toggle (3×) + scrubber reveal
- [ ] EGG-13: Performance overlay (canvas bars)
- [ ] EGG-14: Semantic debugger (label injection)
- [ ] EGG-15: Checkerboard raster cache
- [ ] EGG-16: Baseline painting (red underlines)
- [ ] EGG-17: Debug banner toggle (default ON)
- [ ] EGG-18: Widget size tooltip (always on in DevMode)
- [ ] EGG-19: Network tab with pending POST /api/hire
- [ ] EGG-20: Memory tab heap treemap
- [ ] EGG-21: CPU profiler flame chart
- [ ] EGG-22: Layout explorer in properties panel

#### Framework Concepts
- [ ] EGG-23: Build variant dropdown (debug/profile/release)
- [ ] EGG-24: RenderFlex overflow on narrow viewport
- [ ] EGG-25: setState storm on triple-click
- [ ] EGG-26: Null crash red screen + R to restart
- [ ] EGG-27: InheritedWidget data flow lines
- [ ] EGG-28: Key inspector per node
- [ ] EGG-29: Future/Stream pipeline in contact section
- [ ] EGG-30: Context depth meter overlay
- [ ] EGG-31: Hot reload r key + yellow flash
- [ ] EGG-32: Hot restart R key + full reset
- [ ] EGG-33: Isolate viewer in memory tab
- [ ] EGG-34: Animation scrubber (shows when slow mode ON)
- [ ] EGG-35: Constraints badges per section

#### pub.dev Ecosystem
- [ ] EGG-36: pubspec.yaml skills view toggle
- [ ] EGG-37: pub.dev package card for smartpub
- [ ] EGG-38: Dependency graph toggle
- [ ] EGG-39: `pub upgrade --major-versions` conflict
- [ ] EGG-40: CHANGELOG modal on version click
- [ ] EGG-41: Pub points breakdown in properties
- [ ] EGG-42: DartPad embed on code snippet hover

#### State Management
- [ ] EGG-43: State management selector segmented control
- [ ] EGG-44: Bloc event log on Bloc selection
- [ ] EGG-45: Riverpod provider graph
- [ ] EGG-46: State Wars modal

#### Platform & Device
- [ ] EGG-47: Platform switcher dropdown
- [ ] EGG-48: Adaptive UI split view
- [ ] EGG-49: Device frame selector on mockup
- [ ] EGG-50: Breakpoint markers toggle
- [ ] EGG-51: Platform channel table in Network tab
- [ ] EGG-52: Safe area overlay on mockups

#### Testing & CI
- [ ] EGG-53: Test runner panel in Logging tab
- [ ] EGG-54: Code coverage colour overlay
- [ ] EGG-55: Golden test diff modal on double-click
- [ ] EGG-56: CI pipeline status pill + GitHub Actions log
- [ ] EGG-57: Lint rules squiggle underlines

#### Community
- [ ] EGG-58: Flutter Favourite badge on smartpub card
- [ ] EGG-59: Flutter Weekly banner on projects scroll
- [ ] EGG-60: `stackoverflow` command
- [ ] EGG-61: GPT vs Flutter Dev panel (triple-click Connected)
- [ ] EGG-62: Discord status pill
- [ ] EGG-63: `discord` command chat log
- [ ] EGG-64: `dart challenge` interactive quiz

#### Personal
- [ ] EGG-65: smartpub live pub.dev API stats
- [ ] EGG-66: `dwg` command + ASCII floor plan
- [ ] EGG-67: Jaspr meta-reference on body node
- [ ] EGG-68: `git log` career timeline
- [ ] EGG-69: about_me.dart hover docs
- [ ] EGG-70: EnterpriseClient hidden tree node

#### Micro-moments
- [ ] EGG-71: Konami code → God mode
- [ ] EGG-72: Jank spike after 60s idle
- [ ] EGG-74: Time-based console greeting
- [ ] EGG-75: Fake visitor analytics in properties
- [ ] EGG-76: Credits modal (5× Flutter logo clicks)
- [ ] EGG-77: `theme` command (4 themes)
- [ ] EGG-78: Easter egg counter badge
- [ ] EGG-79: `./hire.sh` → opens mailto
- [ ] EGG-80: `WidgetNotFoundException` on unknown command

#### Bonus
- [ ] EGG-81: `recruiter` mode toggle
- [ ] EGG-82: `vim` mode in console
- [ ] EGG-83: `di` dependency injection visualiser
- [ ] EGG-84: Right-click code review menu
- [ ] EGG-85: Expandable stack trace on error clicks

---

*Document version: 3.0 — Phase 5 Easter Eggs complete reference added.*

---

## Phase 5 — Additional Easter Eggs (New Features)

> These are new features not in the original 80-item list. They extend the easter egg system with deeper Flutter tooling references, more interactivity, and developer community humour.

---

### EGG-86 — Console Tab Autocomplete

**Trigger:** Press `Tab` while typing in the console input

**Effect:** The input autocompletes to the nearest matching command. If multiple matches exist, cycles through them with each `Tab` press.

**Matching table:**
```
"fl"         → "flutter "         (then next Tab cycles flutter sub-commands)
"flutter d"  → "flutter doctor"
"flutter p"  → "flutter pub get"
"flutter b"  → "flutter build web"
"flutter a"  → "flutter analyze"
"flutter t"  → "flutter test"
"flutter r"  → "flutter run --release"
"flutter u"  → "flutter upgrade"
"git"        → "git log"
"./"         → "./hire.sh"
"da"         → "dart --version"
"st"         → "stackoverflow"
"di"         → "discord"
"th"         → "theme"
"nu"         → "null"
```

**Implementation:**
```js
const ALL_COMMANDS = Object.keys(commands);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const val = input.value;
    const matches = ALL_COMMANDS.filter(c => c.startsWith(val));
    if (matches.length === 1) {
      input.value = matches[0];
    } else if (matches.length > 1) {
      // cycle on repeated Tab
      const idx = (tabCycleIndex + 1) % matches.length;
      input.value = matches[idx];
      tabCycleIndex = idx;
    }
  } else {
    tabCycleIndex = -1; // reset cycle on any other key
  }
});
```

**Console:** No log emitted — autocomplete is silent, just like a real terminal.

---

### EGG-87 — flutter pub outdated

**Trigger:** Type `flutter pub outdated` → Enter

**Console output (staggered):**
```
> flutter pub outdated
Showing outdated packages.
[*] indicates versions that support null safety.

Package                Current  Upgradable  Resolvable  Latest
flutter_bloc           8.1.3    8.1.3       9.0.0       9.0.0
riverpod               2.4.9    2.5.1       3.0.0       3.0.0
go_router              13.2.0   14.0.0      14.0.0      14.0.0
your_confidence        0.1.0    0.1.0       2.0.0       2.0.0  ← update recommended

4 packages have newer versions incompatible with dependency constraints.
Run `flutter pub upgrade --major-versions` to update.
(Or just: ./hire.sh — upgrades everything instantly)
```

Last two lines in `--dt-yellow`. `./hire.sh` is clickable → triggers EGG-79.

---

### EGG-88 — Accessibility Audit

**Trigger:** Type `audit` → Enter

**Console output (fake Lighthouse-style accessibility audit):**
```
> audit
Running accessibility audit on portfolio...

╔══════════════════════════════════════════════════════╗
║  Accessibility Audit — portfolio.vatsal.dev          ║
╠══════════════════════════════════════════════════════╣
║  Score: 98 / 100                               🟢    ║
╠══════════════════════════════════════════════════════╣
║  ✓  ARIA labels on all interactive elements          ║
║  ✓  Colour contrast ratio ≥ 4.5:1 (WCAG AA)         ║
║  ✓  Keyboard navigation fully supported              ║
║  ✓  Focus indicators visible                         ║
║  ✓  Images have alt text                             ║
║  ✓  Headings hierarchy correct (h1 → h2 → h3)       ║
║  ⚠  1 issue: hire button lacks urgency ARIA label    ║
║     Fix: aria-label="Hire Vatsal immediately"        ║
╚══════════════════════════════════════════════════════╝

Tip: Run flutter build web --profile to measure real perf.
```

Score `98/100` in `--dt-green`. Warning line in `--dt-yellow`. The suggested `aria-label` value is intentionally funny.

---

### EGG-89 — Bundle Size Analyser

**Trigger:** Type `flutter build web --analyze-size` → Enter

**Console output then a treemap modal:**
```
> flutter build web --analyze-size
Building release bundle...
Analysing bundle size...

✓  Built build/web (2.4MB total)
```

Then a modal opens with a **bundle size treemap** (similar to EGG-20 memory heap):

| Segment | Size | Colour |
|---------|------|--------|
| `dart2js compiled output` | 1.2MB | `--dt-blue` |
| `assets/fonts` | 580KB | `--dt-green` |
| `assets/images` | 420KB | `--dt-purple` |
| `canvaskit` | 140KB | `--dt-cyan` |
| `service_worker.js` | 42KB | `--dt-orange` |
| `regrets.json` | 0KB | `--dt-text-dim` |

Hover each block → tooltip with size + description. `regrets.json` tooltip: `"Empty. Tree-shaken at build time."`.

**Modal title:** `Bundle Size Analyser — Total: 2.4MB (Lighthouse score: 98)`

---

### EGG-90 — Breakpoint Debugger

**Trigger:** Click the line number gutter of any code block shown in DevMode (e.g., DartPad embed EGG-42, or the pubspec.yaml view EGG-36)

**Effect:** A red dot 🔴 appears on the clicked line number. Then a debugger toolbar slides in below the code block:

```
⏸ Paused at breakpoint  ▶ Continue  ⏭ Step over  ⬇ Step into  ⬆ Step out
```

**Console output:**
```
[DEBUG] Breakpoint hit: portfolio.dart:47
[DEBUG] Execution paused at buildPortfolio()
[DEBUG] Local variables:
  visitor    : BuildContext (depth: 6)
  isHired    : false          ← you can change this
  projects   : List<Project> [3 items]
```

**"Continue" button:** Removes breakpoint, console: `[DEBUG] Execution resumed. buildPortfolio() returned Widget.`

`isHired : false` is rendered in `--dt-red`. It pulses — a subtle hint that it should be `true`.

---

### EGG-91 — Mobile App Preview

**Trigger:** Toggle button `📱 App Preview` in the tab bar

**Effect:** A phone mockup frame (Pixel 8 by default) appears as a floating panel over the right side of the content area, containing a miniature live preview of the portfolio. The phone frame has:
- Status bar: `9:41 · Vatsal.dev`
- The portfolio content scaled to fit inside
- Tap targets highlighted
- Bottom nav bar (fake): `Home | Projects | About | Contact`

```css
.dt-phone-preview {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 240px;
  height: 480px;
  background: #1a1d23;
  border: 3px solid #3a3d45;
  border-radius: 36px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
  z-index: 50;
}
.dt-phone-preview iframe {
  width: 375px;
  height: 812px;
  transform: scale(0.64);
  transform-origin: top left;
  border: none;
  pointer-events: none;
}
```

Phone frame renders as a CSS-only device silhouette (notch at top, home bar at bottom, side buttons).

**Console:** `[INFO] App preview active. Rendering portfolio at 375×812dp (Pixel 8 equivalent).`

---

### EGG-92 — Live Share Session

**Trigger:** Type `liveshare` → Enter

**Console output (staggered, mimics VS Code Live Share startup):**
```
> liveshare
Starting VS Code Live Share...
Authenticating with GitHub...  ✓
Initialising session...        ✓
Sharing workspace: portfolio_site
Generating session URL...

Session URL: https://vscode.dev/liveshare/f71c304a9d2e831
Participants: Vatsal Jaganwala (host), Guest (you)

[Guest has joined the session]
[Guest is viewing: devmode.js — line 847]
[Guest typed: "this is impressive"]
[Vatsal: "thanks, hire me?"]
[Guest has left the session]
```

The session URL is styled as a clickable `--dt-blue` link (goes nowhere, but looks authentic). Guest messages appear at 800ms intervals with a typing animation.

---

### EGG-93 — Shader Warm-up

**Trigger:** Toggle button `⚡ Shaders` in the tab bar

**Effect ON:** A warm-up progress sequence plays in the console, then a "shaders compiled" badge appears in the tab bar:

```
[INFO] Warming up shaders...
[DEBUG] Compiling shader: material_ink_ripple (1/12)
[DEBUG] Compiling shader: text_run_rounded (2/12)
[DEBUG] Compiling shader: image_filter_blur (3/12)
[DEBUG] Compiling shader: elevation_shadow (4/12)
...
[DEBUG] Compiling shader: hire_button_glow (12/12)
[INFO] Shader compilation complete. First frame will no longer jank.
[INFO] 12 shaders compiled. App is smooth. Just like the developer.
```

Each line appears 150ms apart. After completion, a small `⚡ Shaders: warm` badge in `--dt-green` appears in the tab bar.

**Toggle OFF:** `[DEBUG] Shader cache cleared. Cold start will jank. Refresh to re-warm.`

---

### EGG-94 — Memory Leak Detector

**Trigger:** Automatic — fires after 3 minutes of DevMode being continuously open

**Effect:** A `[WARNING]` appears in console:
```
[WARNING] Potential memory leak detected.
[WARNING] StreamSubscription in ContactSection not cancelled in dispose().
[WARNING] GlobalKey<FloatingActionButtonState> held by GC root.
[WARNING] Retained objects: 3. Consider calling dispose().

Hint: In this portfolio, the leak is intentional.
      It's retaining hope that you'll call hire().
```

A small 🔴 indicator appears next to the Memory tab label: `Memory 🔴`.

Clicking the Memory tab shows the leak highlighted in red in the heap treemap.

---

### EGG-95 — flutter run Logs (Live Tail)

**Trigger:** Type `tail` → Enter (simulates `tail -f` on flutter run output)

**Effect:** The console enters a "tailing" mode — new fake log lines stream in continuously at random intervals (1–4 seconds each), mimicking a live flutter run session:

```
> tail
Tailing flutter run output... (Ctrl+C to stop)

[  +2ms] Reloaded 0 libraries in 41ms.
[ +847ms] [DevTools] User scrolled to ProjectsSection
[ +312ms] [Bloc] ProjectsBloc → ProjectsLoaded
[+1204ms] [Navigator] Route '/projects/taskflow' pushed
[  +89ms] [DevTools] Widget tree updated. 3 dirty nodes.
[+2100ms] [Network] GET /api/github/stats → 200 (34ms)
[ +445ms] [Memory] Current heap: 24.7MB / 512MB available
[+1800ms] [DevTools] User hovered HireButton. isHovered: true
[  +23ms] [Bloc] ContactBloc → HireEvent dispatched
[+3001ms] [Future] Future<Job> status: pending...
```

Lines appear with realistic variable delays. `Ctrl+C` (detected via keyboard) stops the tail:
```
^C
[INFO] Tail stopped. Portfolio continues running in background.
```

---

### EGG-96 — Widget Rebuild Counter

**Trigger:** Always-on counter badge in top-right of Properties panel header when DevMode is active

**Effect:** A small counter increments every time any user interaction happens (hover, click, scroll):

```
🔄 Rebuilds: 0
```

Counter increments on every `mousemove`, `click`, `scroll`, `keydown` event. After 50 rebuilds:

```
[WARNING] 50 rebuilds detected. Consider using const constructors.
```

After 100:
```
[WARNING] 100 rebuilds. This widget tree needs a const audit.
[INFO]    In practice: Vatsal uses const everywhere. This counter is for show.
```

CSS badge:
```css
.dt-rebuild-counter {
  font-family: var(--dt-font);
  font-size: 10px;
  color: var(--dt-text-dim);
  padding: 1px 6px;
  border: 1px solid var(--dt-border);
  border-radius: 3px;
}
.dt-rebuild-counter.warn { color: var(--dt-yellow); border-color: rgba(225, 192, 100, 0.3); }
.dt-rebuild-counter.high { color: var(--dt-red);    border-color: rgba(224, 108, 117, 0.3); }
```

---

### EGG-97 — Dart Observatory

**Trigger:** Type `observatory` → Enter

**Console output:**
```
> observatory
Observatory debugger and profiler available at:
http://127.0.0.1:9102/yourPortfolioToken=/

Connecting to VM service...  ✓
VM version: 3.5.0
Isolates: 3 (main, image_decode, portfolio_dreams)

Timeline events: enabled
CPU samples: collecting at 1000Hz
```

A fake "Observatory" mini-panel appears in the Properties panel area with:
- Timeline event stream (animated dots scrolling past)
- CPU sample rate: `1000Hz`
- GC events: `Minor GC: 12  Major GC: 0`

Hover GC counts → tooltip: `"0 major GCs. The code is clean. Hire the developer."`

---

### EGG-98 — flutter create

**Trigger:** Type `flutter create` → Enter

**Console output:**
```
> flutter create
Creating project hire_vatsal...
  lib/main.dart (created)
  lib/screens/home_screen.dart (created)
  lib/services/hire_service.dart (created)
  pubspec.yaml (created)
  README.md (created)

All done!
Run: cd hire_vatsal && flutter run

Your new project is ready. It has one screen:
  HireScreen — displays Vatsal's contact info
  and a big green "Send Offer" button.
```

**console:** `[INFO] Project hire_vatsal created. Don't forget to flutter pub get.`

---

### EGG-99 — Localization Preview

**Trigger:** Toggle dropdown `🌍 Locale` in tab bar. Options: `en (English)` | `hi (हिंदी)` | `ja (日本語)` | `de (Deutsch)`

**Effect:** Section headings and labels in the content area swap to the selected locale's version of the text. Fake translations — intentionally rough to signal this is a demo:

| Key | en | hi | ja | de |
|-----|----|----|----|----|
| "About Me" | About Me | मेरे बारे में | 私について | Über mich |
| "Projects" | Projects | परियोजनाएँ | プロジェクト | Projekte |
| "Hire Me" | Hire Me | मुझे काम पर रखें | 採用してください | Stellen Sie mich ein |

**Console on switch:**
```
[INFO] Locale changed to: ja (日本語)
[INFO] AppLocalizations.of(context).locale = const Locale('ja')
[DEBUG] Loaded 47 translation keys. 0 missing.
```

**Console on English restore:** `[INFO] Locale restored to en. No translation keys missing — just a job offer.`

---

### EGG-100 — The Final Egg

**Trigger:** Type `hire vatsal` → Enter *(the only two-word command with a space)*

**Console output (with dramatic stagger, 500ms per section):**
```
> hire vatsal

  Executing hire sequence...

  ████████████████████████████████████ 100%

  ✓  Flutter expertise:        verified
  ✓  Bloc/Riverpod mastery:    verified
  ✓  Enterprise experience:    verified
  ✓  Open source contributions:verified
  ✓  Attention to detail:      EXCEPTIONAL (built this easter egg)
  ✓  Self-awareness:           verified (named this EGG-100)

  Status: HIRED ✓

  Opening email client...
```

After the last line:
1. Confetti burst (biggest one — `particleCount: 300`)
2. The entire DevTools tab bar flashes green briefly
3. `window.open('mailto:vatsal@example.com?subject=You\'re Hired!')` executes
4. Easter egg counter badge updates: `🥚 ∞/15 found`
5. Console final line: `[INFO] hire vatsal exited with code 0. Best decision today.`

This is the **canonical "you've discovered everything"** egg. Deliberately placed at #100 as the milestone.

---

## New Features — Implementation Additions

### Console Input Enhancement

The console input field gains these new capabilities for the new eggs:

```js
// Console input state
let tabCycleIndex = -1;
let tailMode = false;
let tailInterval = null;
let dartChallengeActive = false;
let dartChallengeAnswer = null;
let vimMode = false;
let vimInsertMode = false;

// Stop tail mode on Ctrl+C
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'c' && tailMode) {
    stopTailMode();
    e.preventDefault();
  }
});

function stopTailMode() {
  clearInterval(tailInterval);
  tailMode = false;
  addLog('info', 'Tail stopped. Portfolio continues running in background.');
}
```

### New Tab Bar Items

Add these to `devtools_tab_bar.dart` right-side area:

| Element | ID | Notes |
|---------|----|-------|
| `📱 App Preview` toggle | `dt-app-preview-btn` | EGG-91 |
| `⚡ Shaders` toggle | `dt-shaders-btn` | EGG-93 |
| `🌍 Locale` dropdown | `dt-locale-select` | EGG-99 |
| `📦 Build Variants` dropdown | `dt-build-variant-select` | EGG-23 |

### Updated `help` Command Output

Append these to EGG-09's help table:

```
  flutter pub outdated    Show package update status
  flutter build web --analyze-size  Bundle size treemap
  flutter create          Create project hire_vatsal
  tail                    Live-tail flutter run output
  observatory             Open Dart Observatory
  audit                   Run accessibility audit
  liveshare               Start VS Code Live Share
  hire vatsal             [FINAL EGG]
```

### Updated Easter Egg Counter

Total eggs increased from 15 to **20** (the most discoverable ones):

```js
const TRACKED_EGGS = [
  'flutter-doctor',      // EGG-01
  'flutter-clean',       // EGG-02
  'flutter-test',        // EGG-07
  'hire-sh',             // EGG-79
  'null-crash',          // EGG-26
  'konami',              // EGG-71
  'git-log',             // EGG-68
  'stackoverflow',       // EGG-60
  'changelog',           // EGG-40/73
  'state-wars',          // EGG-46
  'repaint-rainbow',     // EGG-11
  'slow-animations',     // EGG-12
  'dart-challenge',      // EGG-64
  'smartpub-live',       // EGG-65
  'dwg',                 // EGG-66
  'flutter-outdated',    // EGG-87
  'audit',               // EGG-88
  'bundle-analyser',     // EGG-89
  'tab-autocomplete',    // EGG-86 (counts when Tab is first used)
  'hire-vatsal',         // EGG-100
];
const TOTAL_EGGS = 20;
```

Badge shows: `🥚 0/20 found`

---

## New Features Checklist

- [ ] EGG-86: Tab autocomplete in console input
- [ ] EGG-87: `flutter pub outdated` command
- [ ] EGG-88: `audit` accessibility audit command
- [ ] EGG-89: `flutter build web --analyze-size` bundle treemap
- [ ] EGG-90: Breakpoint debugger on code line click
- [ ] EGG-91: `📱 App Preview` floating phone mockup
- [ ] EGG-92: `liveshare` command with fake session
- [ ] EGG-93: `⚡ Shaders` warm-up toggle
- [ ] EGG-94: Memory leak detector (3 min auto-fire)
- [ ] EGG-95: `tail` live log streaming mode
- [ ] EGG-96: Widget rebuild counter badge in properties
- [ ] EGG-97: `observatory` Dart Observatory panel
- [ ] EGG-98: `flutter create` command
- [ ] EGG-99: `🌍 Locale` switcher dropdown
- [ ] EGG-100: `hire vatsal` final canonical egg

---

*Document version: 4.0 — 15 new features added (EGG-86 through EGG-100). Total egg catalogue: 100 features.*
