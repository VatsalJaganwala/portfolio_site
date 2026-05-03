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

### Task 3 — DevTools Shell
- [x] Shell covers full screen (`position: fixed; inset: 0; z-index: 500`)
- [x] Slide-in animation plays on mount (`devtools-slide-in` keyframe; shell starts hidden, shown by JS)
- [x] 4-zone CSS grid renders correctly (`flex-direction: column` shell with grid main row)
- [x] Middle row uses `grid-template-columns: 280px 1fr 260px`
- [x] Custom scrollbars applied (`.devtools-shell ::-webkit-scrollbar` rules)
- [x] Exit animation plays before unmount (`exiting` class adds `devtools-slide-out` keyframe; shell hidden after 350ms)

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
- [x] Console renders at bottom, `180px` height (`.dt-console` CSS)
- [x] Console header renders with all elements (label, filter pills, clear, toggle)
- [x] ALL/INFO/DEBUG/WARNING/ERROR filter pills render
- [x] Default filter is `ALL` (`.active` class on ALL pill in `debug_console.dart`)
- [x] Filter click updates active pill (JS `consoleFilter` state + class toggle)
- [x] Collapsed/expanded toggle works (`#dt-console-toggle` click toggles `.collapsed`)
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
- [x] View renders when Performance tab clicked (JS `switchTab('performance')` shows `#dt-perf-view`)
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

### Phase 2 Checklist

#### Scroll Sync
- [ ] Content scroll updates active tree node
- [ ] Tree node click scrolls to section smoothly
- [ ] Active node auto-scrolls into view in tree panel
- [ ] Scroll offset accounts for fixed headers

#### Bounding Boxes
- [ ] Boxes appear on tree node hover
- [ ] Boxes appear on content section hover
- [ ] Box positions update on window resize
- [ ] Labels render correctly at top-left
- [ ] Fade in/out transitions smooth

#### Reactive Logs
- [ ] All 16 interaction triggers implemented
- [ ] Idle timer works correctly
- [ ] Console auto-scrolls to bottom
- [ ] Timestamps accurate
- [ ] No duplicate log entries

#### Live Properties
- [ ] `isHovered` updates on project card hover
- [ ] `animProgress` animates smoothly
- [ ] Pulsing dot renders for live properties
- [ ] Properties reset when hover ends

#### Annotations
- [ ] Section labels render in dev mode only
- [ ] Git commit badges render on experience entries
- [ ] Labels don't break normal mode layout

#### Mobile
- [ ] Zone switching works smoothly
- [ ] Touch targets are 44px minimum
- [ ] Exit button always visible
- [ ] All zones scrollable
- [ ] No horizontal overflow

---

## Phase 3 — Advanced Features

**Goal**: Add sophisticated features that enhance the developer experience and showcase technical depth.

### Phase 3 Deliverables

#### 3.1 — Functional Widget Tree Search

**Features:**
- Real-time filtering as user types
- Fuzzy matching on widget names
- Highlight matching text in results
- Show parent path for context
- Clear button to reset search

**Implementation:**
```dart
String _searchQuery = '';
List<TreeNode> _filteredNodes = [];

void _filterNodes(String query) {
  if (query.isEmpty) {
    _filteredNodes = _allNodes;
  } else {
    _filteredNodes = _allNodes.where((node) {
      return node.label.toLowerCase().contains(query.toLowerCase());
    }).toList();
  }
  setState(() => _searchQuery = query);
}
```

#### 3.2 — Collapsible Console Sections

**Features:**
- Group logs by time period (last minute, last 5 min, earlier)
- Collapsible sections with expand/collapse icons
- Preserve scroll position when toggling
- Show log count per section

#### 3.3 — Performance Metrics Overlay

**Features:**
- Real FPS counter (fake, but animated)
- Memory usage graph (decorative)
- Network request timeline (fake API calls)
- Widget rebuild counter

#### 3.4 — Enhanced Animations

**Features:**
- Staggered tree node reveal on first load
- Smooth panel resize transitions
- Micro-interactions on hover (scale, glow)
- Loading skeleton for properties panel

#### 3.5 — Keyboard Shortcuts Panel

**Trigger:** Press `?` key to show shortcuts overlay

**Shortcuts:**
- `q` — Exit DevTools
- `r` — Refresh widget tree (cosmetic)
- `c` — Clear console
- `f` — Focus search
- `/` — Toggle console
- `Esc` — Close overlays

#### 3.6 — Theme Variations

**Options:**
- Dark theme (default)
- Light theme (toggle via hidden button)
- High contrast mode
- Persist preference in localStorage

### Phase 3 Checklist

- [ ] Widget tree search functional
- [ ] Console sections collapsible
- [ ] Performance overlay renders
- [ ] All animations smooth at 60fps
- [ ] Keyboard shortcuts work
- [ ] Theme switching functional
- [ ] No performance degradation

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
