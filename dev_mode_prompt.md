=======================================================================
DEVELOPER MODE IMPLEMENTATION PROMPT — FLUTTER PORTFOLIO (JASPR)
=======================================================================

You are implementing a "Developer Mode" feature on an existing dark-themed
portfolio website built with Jaspr — a Dart web framework that renders native
HTML and CSS using a Flutter-like component model (StatelessComponent,
StatefulComponent, InheritedComponent). The framework uses standard HTML
elements (div, span, p, ul, li, etc.) styled with CSS, NOT Flutter widgets.
There is no Column, Row, or Stack. Layouts are done with CSS flexbox and grid.

Read every section of this prompt fully before writing a single line of code.
Do not make assumptions. Every behaviour, visual, and interaction is specified
below. If something is unclear, re-read the relevant section before proceeding.

=======================================================================
SECTION 1 — TECHNOLOGY CONSTRAINTS & JASPR-SPECIFIC RULES
=======================================================================

Framework: Jaspr (https://jaspr.site)
Language: Dart only. No JavaScript files, no JS interop unless absolutely
          unavoidable for keyboard event listeners.
Styling: CSS written in Jaspr's Styles API or inline style attributes on
         components. Match the existing site's CSS variable naming conventions
         and dark theme colour tokens already in use.
State: Use a top-level StatefulComponent (e.g., AppShell or PortfolioApp)
       to hold a single bool `isDevMode`. Pass it down via InheritedComponent
       or direct prop drilling to all child components. Do NOT use a global
       variable. Use setState() to toggle the mode.
Keyboard events: Use document-level event listeners registered in initState()
       of a StatefulComponent and disposed in dispose(). In Jaspr you do this
       via dart:html's document.onKeyDown.listen(...). Store the StreamSubscription
       and cancel it in dispose().
Animations: Use CSS transitions and CSS @keyframes. Do not rely on Dart timers
       for visual animations — use CSS `animation` and `transition` properties
       triggered by class toggling on DOM elements.
CSS class toggling: Use Jaspr's `classes` attribute on components. Toggle
       classes by changing state and rebuilding.
File structure: Create new files for each major component. Do not dump
       everything into one file. Suggested structure:
         lib/
           components/
             dev_mode/
               dev_mode_shell.dart          ← outer container
               widget_tree_panel.dart       ← left sidebar
               properties_panel.dart        ← right sidebar
               debug_console.dart           ← bottom panel
               devtools_tab_bar.dart        ← top tab row
               flutter_run_overlay.dart     ← transition animation
               dev_mode_pill.dart           ← activation trigger (normal mode)
               dev_mode_exit_button.dart    ← exit button (appears on q press)
             portfolio/                     ← existing normal mode components
           state/
             dev_mode_state.dart            ← InheritedComponent for mode state
             console_log_controller.dart    ← manages log entries list

=======================================================================
SECTION 2 — VISUAL DESIGN SYSTEM (MATCH EXISTING DARK THEME)
=======================================================================

The existing site is dark-themed. All dev mode UI must feel like it belongs
in the same visual universe. Use the existing site's CSS variables for base
colours. The DevTools chrome introduces these additional colours which you
must define as new CSS variables:

--devtools-bg:          #1E2227   ← DevTools panel background
--devtools-sidebar-bg:  #21252B   ← Widget tree and properties background
--devtools-border:      #3E4451   ← Panel dividers and borders
--devtools-tab-bg:      #282C34   ← Inactive tab background
--devtools-tab-active:  #1E2227   ← Active tab background
--devtools-text:        #ABB2BF   ← Default text inside DevTools panels
--devtools-text-dim:    #5C6370   ← Dimmed/secondary text
--devtools-blue:        #61AFEF   ← Widget names, selected items, bounding boxes
--devtools-orange:      #E5C07B   ← Property keys, highlighted elements
--devtools-green:       #98C379   ← String values, success logs
--devtools-purple:      #C678DD   ← Type names, keywords
--devtools-red:         #E06C75   ← Error logs, warning accents
--devtools-cyan:        #56B6C2   ← Info logs, links
--devtools-selection:   rgba(97,175,239,0.15) ← Selected node background

Typography inside DevTools panels:
  Font family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace
  Base size: 12px
  Line height: 1.6

All DevTools panel text uses monospace. The main content area keeps the
existing site's typography unchanged.

=======================================================================
SECTION 3 — THE ACTIVATION TRIGGER (NORMAL MODE)
=======================================================================

In normal mode, display a persistent floating pill element in the
BOTTOM-CENTER of the viewport. This is fixed-position, not inline.

PILL APPEARANCE:
  position: fixed
  bottom: 24px
  left: 50%
  transform: translateX(-50%)
  z-index: 1000
  background: rgba(30, 34, 39, 0.85)
  backdrop-filter: blur(8px)
  border: 1px solid rgba(97, 175, 239, 0.35)
  border-radius: 999px
  padding: 6px 16px 6px 12px
  display: flex
  align-items: center
  gap: 8px
  cursor: pointer
  font-family: JetBrains Mono, monospace
  font-size: 11px
  color: #ABB2BF
  user-select: none
  transition: border-color 0.2s, box-shadow 0.2s

PILL CONTENT (left to right):
  1. A filled circle div: width 8px, height 8px, border-radius 50%,
     background #98C379 (green). This circle has a CSS pulse animation:
     @keyframes pulse {
       0%, 100% { box-shadow: 0 0 0 0 rgba(152,195,121,0.5); }
       50%       { box-shadow: 0 0 0 5px rgba(152,195,121,0); }
     }
     animation: pulse 2s ease-in-out infinite;
  2. Text: "● debug" — colour #E5C07B (orange)
  3. A vertical separator: 1px solid rgba(255,255,255,0.1), height 14px
  4. Text: "v2.3.1+42" — colour #5C6370 (dim)

PILL HOVER STATE:
  border-color: rgba(97,175,239,0.7)
  box-shadow: 0 0 16px rgba(97,175,239,0.2)

PILL TOOLTIP:
  On hover after 600ms delay, show a small tooltip ABOVE the pill:
  "Open Flutter DevTools"
  Position: centered above the pill, 8px gap
  Style: same bg as pill, 10px font, border same as pill, border-radius 6px,
         padding 4px 10px
  Use CSS ::after pseudo-element or a child div with absolute positioning.

PILL CLICK ACTION:
  Clicking the pill triggers the transition sequence described in Section 5.
  Wrap the click handler in Jaspr's onClick event attribute.

=======================================================================
SECTION 4 — GLOBAL STATE ARCHITECTURE
=======================================================================

Create lib/state/dev_mode_state.dart:

  class DevModeState extends InheritedComponent {
    final bool isDevMode;
    final void Function() enterDevMode;
    final void Function() exitDevMode;

    const DevModeState({
      required this.isDevMode,
      required this.enterDevMode,
      required this.exitDevMode,
      required super.child,
    });

    static DevModeState of(BuildContext context) {
      return context.dependOnInheritedComponentOfExactType<DevModeState>()!;
    }

    @override
    bool updateShouldNotify(DevModeState oldWidget) {
      return oldWidget.isDevMode != isDevMode;
    }
  }

The top-level StatefulComponent wrapping the entire app holds:
  bool _isDevMode = false;
  bool _isTransitioning = false;  ← true during the flutter run animation

enterDevMode() sets _isTransitioning = true, rebuilds, and after the
animation completes (use a Future.delayed matching the animation duration),
sets _isDevMode = true and _isTransitioning = false.

exitDevMode() immediately sets _isDevMode = false (the exit animation plays
via CSS transitions on the DevTools chrome sliding away).

=======================================================================
SECTION 5 — THE TRANSITION ANIMATION (flutter run overlay)
=======================================================================

When the user clicks the debug pill, a full-screen overlay appears that
simulates `flutter run -d chrome --debug`. This plays for approximately
4.5 seconds before the dev mode layout appears.

Create lib/components/dev_mode/flutter_run_overlay.dart

OVERLAY CONTAINER:
  position: fixed
  inset: 0
  z-index: 9999
  background: #0D1117  (near-black, slightly different from site bg)
  display: flex
  flex-direction: column
  justify-content: flex-end
  padding: 32px 48px 48px
  font-family: JetBrains Mono, monospace
  font-size: 13px
  line-height: 1.8
  color: #ABB2BF

  CSS entry animation:
    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    animation: overlayFadeIn 0.25s ease forwards;

AT THE TOP of the overlay (fixed within overlay at top: 0):
  A thin progress bar, 3px height, full width:
  background: linear-gradient(90deg, #61AFEF, #C678DD)
  @keyframes progressBar {
    from { width: 0%; }
    to   { width: 100%; }
  }
  animation: progressBar 4s cubic-bezier(0.4,0,0.2,1) forwards;

LOG LINES (rendered as an ordered list of spans inside a div):
  Each line appears with a staggered CSS animation delay.
  Use animation-fill-mode: both on each line.
  @keyframes logLineAppear {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  The lines, delays, and colours are:

  Delay 0.1s  — colour #5C6370  — "$ flutter run -d chrome --debug"
  Delay 0.4s  — colour #ABB2BF  — "Launching lib/main.dart on Chrome in debug mode..."
  Delay 0.8s  — colour #5C6370  — "Running Gradle task 'assembleDebug'..."
  Delay 1.2s  — colour #98C379  — "✓  Built build/web/main.dart.js"
  Delay 1.6s  — colour #ABB2BF  — "Syncing files to device Chrome..."
  Delay 2.0s  — colour #5C6370  — ""   ← empty line for breathing room
  Delay 2.1s  — colour #ABB2BF  — "Flutter run key commands."
  Delay 2.3s  — colour #E5C07B  — "r  Hot reload. 🔥🔥🔥"
  Delay 2.5s  — colour #E5C07B  — "R  Hot restart."
  Delay 2.7s  — colour #61AFEF  — "v  Open Flutter DevTools."
  Delay 2.9s  — colour #ABB2BF  — "q  Quit (terminate the application)."
  Delay 3.2s  — colour #5C6370  — ""   ← empty line
  Delay 3.3s  — colour #5C6370  — "An Observatory debugger and profiler on"
               "Chrome is available at:"
  Delay 3.5s  — colour #61AFEF  — "http://127.0.0.1:9102/yourPortfolioToken=/"
  Delay 3.7s  — colour #5C6370  — ""   ← empty line
  Delay 3.8s  — colour #ABB2BF  — "Opening DevTools in the browser..."

  At delay 4.0s, a blinking cursor appears on a new line (empty string +
  a span with class 'cursor' that blinks via CSS):
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .cursor { display: inline-block; width: 8px; height: 14px;
            background: #61AFEF; animation: cursorBlink 1s step-end infinite; }

  At delay 4.2s, use a Dart Future.delayed in initState to call the
  parent's callback which dismisses the overlay and shows dev mode.

OVERLAY DISMISSAL:
  Add a small "Skip →" button in the top-right corner of the overlay.
  position: absolute; top: 20px; right: 24px;
  font-family: monospace; font-size: 11px; color: #5C6370;
  background: transparent; border: none; cursor: pointer;
  On click: immediately dismiss overlay and enter dev mode.

=======================================================================
SECTION 6 — DEV MODE LAYOUT (DESKTOP — viewport width ≥ 1024px)
=======================================================================

When isDevMode is true, the normal portfolio content is replaced by the
DevTools shell layout. The shell is a 4-zone layout:

┌────────────────────────────────────────────────────────────────────┐
│  DevTools Tab Bar (height: 36px, full width)                       │
├────────────────┬──────────────────────────┬───────────────────────┤
│                │                          │                        │
│  Widget Tree   │  Main Content Area       │  Properties Panel      │
│  Panel         │  (portfolio content)     │  (right)               │
│  (left)        │                          │                        │
│  width: 280px  │  flex: 1 (takes rest)    │  width: 260px          │
│                │                          │                        │
├────────────────┴──────────────────────────┴───────────────────────┤
│  Debug Console (height: 180px, collapsible, full width)            │
└────────────────────────────────────────────────────────────────────┘

The outer shell container:
  position: fixed
  inset: 0
  z-index: 500
  display: flex
  flex-direction: column
  background: var(--devtools-bg)
  CSS entry animation:
    @keyframes devtoolsSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    animation: devtoolsSlideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards;

The middle row (tree + content + properties) uses CSS grid:
  display: grid
  grid-template-columns: 280px 1fr 260px
  flex: 1
  overflow: hidden
  border-top: 1px solid var(--devtools-border)
  border-bottom: 1px solid var(--devtools-border)

All three panels have:
  overflow-y: auto
  height: 100%

Scrollbar styling (apply globally for dev mode):
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #3E4451; border-radius: 3px; }

=======================================================================
SECTION 7 — DEVTOOLS TAB BAR (TOP)
=======================================================================

Height: 36px
Background: var(--devtools-tab-bg)
Border-bottom: 1px solid var(--devtools-border)
Display: flex, align-items: center

LEFT SIDE — App title:
  A small Flutter logo SVG (use the official Flutter "F" mark SVG, blue)
  width 14px, height 14px, margin-right 8px, margin-left 12px
  Followed by text: "portfolio | Flutter DevTools" in 11px, colour #5C6370

TABS (rendered as a row after the title, separated by a flex-spacer):
  Four tabs: "Flutter Inspector", "Performance", "Memory", "Logging"
  
  Each tab:
    padding: 0 16px
    height: 100%
    display: flex; align-items: center
    font-family: JetBrains Mono, monospace
    font-size: 12px
    cursor: pointer
    border-bottom: 2px solid transparent
    transition: color 0.15s, border-color 0.15s
    colour (inactive): #5C6370
    colour (active): #ABB2BF
    border-bottom-colour (active): #61AFEF
    background (active): var(--devtools-tab-active)

  Currently only "Flutter Inspector" tab is functional (Phase 1).
  Other tabs show the tab but clicking them does nothing in Phase 1.
  Use a local state variable `_activeTab` (String) defaulting to 'inspector'.

RIGHT SIDE — Connection info:
  Small green dot (6px circle, background #98C379) + text "Connected"
  font-size: 11px; colour: #5C6370
  margin-right: 16px

EXIT BUTTON (visible only after user presses 'q' or flutter stop):
  Shows a button: "✕ Exit DevTools"
  Style: transparent bg, border: 1px solid #E06C75, colour: #E06C75,
         border-radius: 4px, font-size: 11px, padding: 3px 10px,
         cursor: pointer, margin-right: 12px
  On click: trigger exitDevMode() — described in Section 10.
  This button is HIDDEN by default (`_showExitButton = false`) and becomes
  visible when the user presses 'q' on the keyboard.

=======================================================================
SECTION 8 — WIDGET TREE PANEL (LEFT SIDEBAR)
=======================================================================

Width: 280px
Background: var(--devtools-sidebar-bg)
Border-right: 1px solid var(--devtools-border)
Padding-top: 8px

PANEL HEADER:
  Height: 32px; padding: 0 12px; display: flex; align-items: center
  Text: "Widget tree" in 11px, font-weight: 600, colour: #5C6370,
        letter-spacing: 0.8px, text-transform: uppercase
  A refresh icon (↻) button on the right: 16px, colour #5C6370, cursor pointer

SEARCH BAR (below header):
  An input element: full width, padding 6px 10px 6px 28px
  background: rgba(255,255,255,0.05); border: 1px solid #3E4451
  border-radius: 4px; font-family: monospace; font-size: 11px; colour: #ABB2BF
  placeholder: "Filter widgets..." colour: #5C6370
  A search icon (🔍 or CSS SVG) absolutely positioned inside on the left
  In Phase 1: the input is visible but non-functional (cosmetic only)

TREE NODE STRUCTURE:
  The widget tree is a flat list of div elements representing nodes.
  Each node has a specific indent level, an expand/collapse toggle, and text.

  Node component structure (one div per node):
    classes: 'tree-node' + (if selected: 'tree-node--selected') +
             (if hovered: 'tree-node--hovered')
    padding-left: {indentLevel * 16}px
    height: 24px; display: flex; align-items: center; gap: 4px
    cursor: pointer; user-select: none

  NODE COLOURS:
    ▶/▼ toggle arrow: colour #5C6370, font-size: 8px, width: 12px
    Widget name: colour #61AFEF (blue), font-size: 12px, font-family: monospace
    Parentheses: colour #5C6370
    Inner text/args: colour #E5C07B (orange), font-size: 11px

  NODE STATES:
    Hover: background rgba(97,175,239,0.08)
    Selected/Active: background var(--devtools-selection),
                     border-left: 2px solid #61AFEF

  ACCORDION BEHAVIOUR:
    Only one node can be expanded at a time at each tree depth level.
    When you click a collapsed node's arrow, it expands and its sibling
    nodes at the same level collapse.
    Use a Map<String, bool> `_expandedNodes` in state, where keys are
    node IDs (strings) and values are expanded state (bool).
    When a node is expanded, render its children immediately below it
    in the flat list with indentLevel + 1.

  SCROLL SYNC (bidirectional):
    The main content area has scroll event listeners. As the user scrolls
    the portfolio content, the active section is detected by checking which
    section's top offset is closest to the viewport top.
    When the active section changes, update a `_activeSection` string in state.
    The widget tree auto-scrolls to make the matching node visible and
    applies the selected style to it.
    Conversely, clicking a tree node scrolls the main content to the
    matching section using scrollIntoView().

  THE TREE NODES (complete definition):

  Node ID: 'material-app'
    Label: MaterialApp
    Indent: 0, has children: true, default: collapsed

  Node ID: 'scaffold'
    Label: Scaffold
    Indent: 1, has children: true, default: collapsed
    Parent: 'material-app'

  Node ID: 'app-bar'
    Label: AppBar
    Indent: 2, args: 'title: Text("YourName.dev")'
    Has children: false
    Parent: 'scaffold'

  Node ID: 'body'
    Label: SingleChildScrollView
    Indent: 2, has children: true, default: collapsed
    Parent: 'scaffold'

  Node ID: 'hero-section'
    Label: Hero
    Indent: 3, args: 'tag: "flutter-developer"'
    Has children: false
    Section: 'hero' (used for scroll sync)
    Parent: 'body'

  Node ID: 'projects-section'
    Label: ProjectsSection
    Indent: 3, args: 'itemCount: 3'
    Has children: true, default: collapsed
    Section: 'projects'
    Parent: 'body'

  Node ID: 'project-card-1'
    Label: ProjectCard
    Indent: 4, args: 'title: "TaskFlow"'
    Has children: false
    Parent: 'projects-section'

  Node ID: 'project-card-2'
    Label: ProjectCard
    Indent: 4, args: 'title: "PulseAI"'
    Has children: false
    Parent: 'projects-section'

  Node ID: 'project-card-3'
    Label: ProjectCard
    Indent: 4, args: 'title: "Vault"'
    Has children: false
    Parent: 'projects-section'

  Node ID: 'about-section'
    Label: AboutSection
    Indent: 3, args: ''
    Has children: false
    Section: 'about'
    Parent: 'body'

  Node ID: 'experience-section'
    Label: ExperienceTimeline
    Indent: 3, args: 'entries: 3'
    Has children: false
    Section: 'experience'
    Parent: 'body'

  Node ID: 'contact-section'
    Label: ContactSection
    Indent: 3, args: ''
    Has children: false
    Section: 'contact'
    Parent: 'body'

  Node ID: 'fab'
    Label: FloatingActionButton
    Indent: 2, args: 'onPressed: HireCallback'
    Has children: false
    Parent: 'scaffold'

=======================================================================
SECTION 9 — MAIN CONTENT AREA (CENTRE)
=======================================================================

The main content area renders the actual portfolio content — the same
components as normal mode. However, in dev mode, additional overlays are
applied on top of the existing content.

CONTAINER:
  overflow-y: auto; position: relative
  background: inherit from existing site (the dark theme bg)
  The existing portfolio sections render here without modification to
  their own components. The overlays are siblings inside a position:relative
  container.

WIDGET BOUNDING BOXES:
  Create a separate overlay div positioned absolute, inset:0, pointer-events:none,
  containing bounding box highlight divs.
  Each major section has a predefined bounding box (position and size).
  When a widget tree node is hovered OR when the mouse hovers the content
  area over a section, show the corresponding bounding box:

  Bounding box style:
    position: absolute
    border: 1.5px solid #61AFEF  (blue)
    border-radius: 2px
    pointer-events: none
    background: rgba(97,175,239,0.06)
    transition: opacity 0.15s
    opacity: 0 by default, 1 when active

  Each bounding box has a label chip positioned at its top-left corner:
    position: absolute; top: -18px; left: 0
    background: #61AFEF; colour: #000
    font-family: monospace; font-size: 10px; font-weight: 600
    padding: 1px 6px; border-radius: 3px 3px 0 0

  Labels match widget names: "Hero", "ProjectsSection", "AboutSection",
  "ExperienceTimeline", "ContactSection"

CONTENT LABELS IN DEV MODE:
  In dev mode, add a small monospace pill above each section's heading,
  rendered as a new child div inside the section's wrapper:
    text: "// {SectionName}.dart"
    font-family: JetBrains Mono, monospace; font-size: 10px
    colour: #5C6370; margin-bottom: 8px; letter-spacing: 0.3px
  This is achieved by wrapping section content in a DevModeAnnotation
  component that conditionally renders the label pill based on isDevMode.

  The experience section's timeline entries each get a git commit badge:
    Before each timeline item's heading, render:
    "commit {hash}  " in colour #5C6370 + the timeline title
    Fake hashes: 'a4f2c1d', '3b9e821', 'f71c304'
    Only show these when isDevMode is true.

=======================================================================
SECTION 10 — PROPERTIES PANEL (RIGHT SIDEBAR)
=======================================================================

Width: 260px
Background: var(--devtools-sidebar-bg)
Border-left: 1px solid var(--devtools-border)

PANEL HEADER:
  Same structure as widget tree panel header
  Text: "Properties" in 11px, uppercase, #5C6370

DEFAULT STATE (nothing selected or hovered):
  Show build metadata block:

  Section: "App info"
  Rendered as key-value pairs:

  Key colour: #E5C07B (orange/property key)
  Value colour: #98C379 (green/string)
  Separator " : " colour: #ABB2BF

  app         : "YourName Portfolio"
  version     : "2.3.1+42"
  dartSDK     : "3.3.0"
  flutterVer  : "3.19.0"
  buildMode   : "debug"
  platform    : "web"
  theme       : "dark"
  locale      : "en_IN"

  Below that, a dimmed separator line and:
  Text: "// Hover any widget to inspect"
  Colour: #5C6370; font-size: 11px; font-style: italic; padding: 12px

HOVER/SELECTED STATE:
  When a tree node is hovered or clicked, replace the default content with
  widget-specific properties. Store `_inspectedNodeId` in state.

  Use a Map<String, List<PropertyEntry>> where PropertyEntry is:
    { String key, String value, String type }
    type determines colour: 'bool' → #C678DD, 'string' → #98C379,
    'num' → #D19A66, 'enum' → #61AFEF, 'live' → #E06C75 with a
    pulsing dot indicator

  PROPERTIES PER NODE:

  'hero-section':
    tag          : "flutter-developer"  (string)
    isHovered    : false → true when hovered  (live bool)
    child        : Column  (type ref, colour #61AFEF)
    crossAxis    : CrossAxisAlignment.start  (enum)
    renderSize   : "1fr × auto"  (num)

  'projects-section':
    itemCount    : 3  (num)
    scrollDir    : Axis.vertical  (enum)
    padding      : EdgeInsets.all(24.0)  (type ref)
    isVisible    : true  (live bool)

  'project-card-1':
    title        : "TaskFlow"  (string)
    category     : "Productivity"  (string)
    isHovered    : false  (live bool — updates to true on hover)
    animProgress : 0.0  (live num — updates on hover to 0.73)
    platforms    : [iOS, Android]  (string)
    stateLib     : "Bloc"  (string)

  'project-card-2':
    title        : "PulseAI"  (string)
    category     : "Health & Wellness"  (string)
    isHovered    : false  (live)
    stateLib     : "Riverpod"  (string)
    platforms    : [iOS, Android, Web]  (string)

  'project-card-3':
    title        : "Vault"  (string)
    category     : "Fintech"  (string)
    isHovered    : false  (live)
    stateLib     : "GetX"  (string)
    platforms    : [iOS, Android]  (string)

  'about-section':
    yearsXP      : 2  (num)
    location     : "Ahmedabad, India"  (string)
    isAnimated   : true  (bool)

  'experience-section':
    entryCount   : 3  (num)
    layout       : "vertical timeline"  (string)

  'contact-section':
    hiringSignal : true  (live bool — green pulsing)
    email        : "[your email]"  (string)

  'fab':
    elevation    : 6.0  (num)
    tooltip      : "Hire me"  (string)
    onPressed    : HireCallback  (type ref, colour #C678DD)

  The "live" properties (isHovered, animProgress, hiringSignal) should
  show a small coloured pulsing dot (4px circle) before their key name
  to indicate they update in real time.

=======================================================================
SECTION 11 — DEBUG CONSOLE (BOTTOM)
=======================================================================

Height: 180px (when expanded), 0px when collapsed
Background: #0D1117
Border-top: 1px solid var(--devtools-border)
Transition: height 0.25s cubic-bezier(0.4,0,0.2,1)
Overflow: hidden

CONSOLE HEADER (always visible, 28px height):
  Background: #161B22
  Display: flex, align-items: center, padding: 0 12px, gap: 8px
  Left: "Console" text — 11px, uppercase, #5C6370, font-weight 600
  Buttons row (filter badges, each a small clickable pill):
    ALL  | INFO  | DEBUG  | WARNING  | ERROR
    Active filter pill: background rgba(97,175,239,0.15), colour #61AFEF,
                        border: 1px solid rgba(97,175,239,0.3)
    Inactive: colour #5C6370, background transparent, no border
    Default active: ALL
  Right side: collapse/expand arrow button (▼ when expanded, ▲ when collapsed)
    Clicking toggles `_consoleExpanded` boolean in state.
  Clear button (🗑 icon): 11px, colour #5C6370, cursor pointer
    On click: clear all log entries from the list.

CONSOLE BODY:
  Overflow-y: auto; padding: 8px 0
  Font-family: JetBrains Mono, monospace; font-size: 12px; line-height: 1.6

  LOG ENTRY STRUCTURE (one div per entry):
    display: flex; align-items: flex-start; padding: 1px 12px; gap: 8px

    1. Level badge: a span with the log level
       [INFO]    — colour #56B6C2 (cyan)
       [DEBUG]   — colour #5C6370 (dim)
       [WARNING] — colour #E5C07B (orange)
       [ERROR]   — colour #E06C75 (red)
       Width: 72px; flex-shrink: 0

    2. Source tag: always "flutter:" in colour #5C6370

    3. Message: colour #ABB2BF

    4. Timestamp: right-aligned (margin-left auto), colour #3E4451, font-size: 10px
       Format: "HH:MM:SS" using current time when log is added.

  When the active filter is not ALL, hide entries whose level doesn't match.
  Use CSS display:none on filtered entries.

  New entries appear at the BOTTOM. Auto-scroll to bottom when new entry added.
  Use a dart:html div.scrollTop = div.scrollHeight approach after setState.

INITIAL LOG ENTRIES (appear as dev mode loads, staggered by Future.delayed):

  +0.0s  [INFO]    Portfolio initialised. Rendering 847 widgets...
  +0.3s  [INFO]    Theme: dark. Platform: web.
  +0.6s  [DEBUG]   Hot restart not available in production build.
  +0.9s  [INFO]    DevTools connected. Inspector active.
  +1.2s  [WARNING] setState() called 3 times during build. Consider optimising.
  +1.5s  [DEBUG]   Scroll controller attached to SingleChildScrollView.
  +1.8s  [INFO]    Welcome, visitor. Portfolio ready for inspection.

=======================================================================
SECTION 12 — REACTIVE CONSOLE LOGS (user interaction triggers)
=======================================================================

All interactions with the portfolio content in dev mode trigger console logs.
Implement this by creating a ConsoleLogController that exposes an `addLog()`
method. Pass it down via InheritedComponent or as a callback prop.

USER ACTION → LOG ENTRY:

Hovers hero section:
  [DEBUG]   Hero widget entered hovered state. Rebuilding.

Clicks any project card:
  [INFO]    Navigator: pushed route '/projects/{projectTitle}'.

Mouse enters projects section viewport:
  [INFO]    ProjectsSection entered viewport. ListView rendering 3 items.

Mouse enters about section:
  [INFO]    about_me.dart loaded. Static analysis: 0 errors, 0 warnings.

Mouse hovers the contact/hire button:
  [WARNING] HireButton() tapped. Initiating contact sequence...

Mouse clicks GitHub link:
  [INFO]    Launching external URL: github.com/{yourusername}

Mouse clicks email link:
  [INFO]    mailto: triggered. Opening compose window...

Mouse enters experience section:
  [INFO]    ExperienceTimeline mounted. Entries: 3. Git log attached.

User is idle (no mouse movement) for 20 seconds:
  [DEBUG]   No interaction detected for 20s. Visitor still reading. Good sign.

User scrolls to the very bottom of the page:
  [INFO]    End of widget tree reached. ContactSection fully visible.
  [DEBUG]   hire.sh is ready to execute. Awaiting input.

User presses any key that is NOT 'q':
  [DEBUG]   Key event: '{keyCode}'. Did you mean 'q' to quit?

User opens the Performance tab (even though it's decorative):
  [DEBUG]   Collecting frame rendering data...
  [WARNING] High coffee dependency detected. Performance may vary.

IMPLEMENT THESE:
  Attach onMouseEnter callbacks on each major portfolio section div.
  Attach onMouseLeave to remove hover states.
  Attach onClick on project cards, links, and buttons.
  For idle detection: use a Timer that resets on any mousemove event
  on the document. Register and cancel via StreamSubscription in state.
  For scroll-to-bottom: check scrollTop + clientHeight >= scrollHeight - 10.

=======================================================================
SECTION 13 — EXIT MECHANIC (3-layer system)
=======================================================================

LAYER 1 — Hidden keyboard shortcut for Flutter developers:
  The keyboard event listener (registered in initState, cancelled in dispose)
  listens for the key 'q' (KeyboardEvent.key == 'q' or 'Q').
  When pressed:
    1. Set `_showExitButton = true` (setState)
    2. Log to console:
       [INFO]    Caught terminal signal. Application about to exit.
       [DEBUG]   Press the Exit button or wait...
    3. The exit button appears in the top-right of the tab bar (see Section 7)

LAYER 2 — Visible exit button (appears after 'q' is pressed):
  Clicking "✕ Exit DevTools" calls exitDevMode():
    1. Log: [INFO]    Exiting... Application finished.
    2. After 400ms delay: set isDevMode = false (setState)
    3. The DevTools shell has a CSS exit animation:
       @keyframes devtoolsSlideOut {
         from { opacity: 1; transform: translateY(0); }
         to   { opacity: 0; transform: translateY(12px); }
       }
       Apply this class before removing the component from the tree.
       Use a brief Future.delayed(Duration(milliseconds: 350)) before
       actually setting isDevMode = false, so the animation plays first.

LAYER 3 — The flutter stop text line in console:
  When 'q' is pressed, ALSO add a visually distinct "command" line to
  the console that looks like the user typed it:
    Render as: colour #E5C07B  "> flutter stop"
  followed by the system responses in Layer 1.
  This text is not a log entry — it's rendered differently (no level badge,
  no timestamp, just the command text in orange preceded by ">").

EXIT BUTTON LABEL: "✕ Exit DevTools — Back to normal view"
This label is intentionally long so both technical and non-technical visitors
can understand it. On smaller screens truncate to "✕ Exit DevTools".

=======================================================================
SECTION 14 — MOBILE LAYOUT (viewport width < 1024px)
=======================================================================

On mobile, the 4-zone DevTools layout collapses into a single-zone view
with a bottom tab bar switching between zones.

THE BOTTOM TAB BAR:
  position: fixed; bottom: 0; left: 0; right: 0
  height: 52px; background: var(--devtools-tab-bg)
  border-top: 1px solid var(--devtools-border)
  display: flex; z-index: 600

  Four tabs, each flex: 1:
    display: flex; flex-direction: column; align-items: center
    justify-content: center; gap: 3px; cursor: pointer

    Icon: 16px (use emoji or simple SVG)
    Label: 9px monospace, colour #5C6370 (inactive) or #ABB2BF (active)
    Active indicator: 2px top border on the tab, colour #61AFEF

    Tab 1: 🌳  "Tree"       → shows widget tree panel (full screen)
    Tab 2: 📱  "UI"         → shows main content (default active on load)
    Tab 3: ⚙️  "Props"      → shows properties panel (full screen)
    Tab 4: 🖥  "Console"    → shows debug console (full screen)

  State variable: `_activeMobileTab` (String) = 'ui' by default

MOBILE ZONE DISPLAY:
  Only one zone visible at a time. The active zone takes up:
    width: 100%; height: calc(100vh - 36px - 52px)
    (subtract: tab bar top (36px) + bottom tab bar (52px))
    overflow-y: auto

  DevTools tab bar (top, 36px) remains visible on mobile.
  The widget tree panel, properties panel, and debug console each
  expand to full width when active on mobile.

  Widget tree panel on mobile: same tree as desktop, but tree nodes
  are 32px height (slightly larger for touch targets).

  Properties panel on mobile: same content as desktop.

  Debug console on mobile: same content, but the filter pills are
  in a horizontally scrollable row.

MOBILE EXIT:
  On mobile, the exit button is always visible in the top-right of the
  DevTools tab bar. Do not wait for 'q' press. The `_showExitButton`
  is set to true immediately when dev mode activates on mobile.
  The 'q' keyboard listener is not registered on mobile (detect via
  dart:html window.innerWidth check in initState).

MOBILE ACTIVATION PILL:
  The debug pill in normal mode is the same on mobile but with smaller
  padding: 5px 12px 5px 10px, font-size: 10px.
  bottom: 80px on mobile to avoid overlap with any existing mobile nav.

=======================================================================
SECTION 15 — PERFORMANCE TAB (DECORATIVE)
=======================================================================

When the user clicks the "Performance" tab in the DevTools tab bar,
replace the main content area with the Performance view.

This view is purely decorative — no real data, no interaction.

LAYOUT:
  Full width/height of the main content zone.
  Background: var(--devtools-bg)
  Padding: 24px

FLAME GRAPH SECTION:
  Title: "Frame rendering timeline" — 12px, #5C6370, uppercase, monospace
  Subtitle: "Target: 60fps | Showing last 300ms"

  A visual bar chart rendered using CSS, showing skills as "frames":
  Each bar is a div with width: 100%, height: variable (% of max).
  Bars are horizontal (left to right), not vertical.
  Each bar row:
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px
    Label (left): 180px fixed width, font 11px monospace, colour #ABB2BF
    Bar track (right flex: 1): background #21252B; border-radius 2px; height 18px
      Inner fill div: height 100%, border-radius 2px, transition width 0.8s ease
      Fill colour depends on fps:
        ≥ 55fps: #98C379 (green)
        40–54fps: #E5C07B (orange)
        < 40fps: #E06C75 (red)
    FPS badge (far right): 40px, font 10px monospace, colour same as fill

  BARS (in order):

  Label: "Flutter / Dart"          Width: 100%   FPS: 60  Colour: green
  Label: "State Management"         Width: 100%   FPS: 60  Colour: green
  Label: "UI / Animations"          Width: 97%    FPS: 58  Colour: green
  Label: "Firebase / Backend"       Width: 80%    FPS: 48  Colour: orange
  Label: "REST APIs"                Width: 78%    FPS: 47  Colour: orange
  Label: "Unit Testing"             Width: 53%    FPS: 32  Colour: orange
  Label: "Writing Docs"             Width: 35%    FPS: 21  Colour: red
  Label: "Attending meetings"       Width: 13%    FPS: 8   Colour: red

  Below the last bar, a small italic note in #5C6370 12px:
  "// Performance data collected over 2+ years of Flutter development."
  "// Low fps values indicate room for growth, not skill gaps."

  The bars animate in on mount:
    Each bar's fill starts at 0% width and transitions to its target width.
    Use animation-delay: {index * 0.1s} for a staggered cascade effect.
    Trigger by adding a CSS class 'animate' after a 100ms delay in initState.

=======================================================================
SECTION 16 — STITCH AI DESIGN NOTES
=======================================================================

When using Stitch AI to generate visual references for the views, use
these prompts for each view:

Normal mode pill:
  "A dark-themed developer portfolio website with a dark background
  (#0D1117). At the bottom center of the screen, a small floating pill
  with a green pulsing dot, orange text '● debug', a divider, and grey
  text 'v2.3.1+42'. Monospace font. Subtle blue border glow."

Flutter run transition overlay:
  "A full-screen dark terminal overlay (#0D1117) showing a Flutter run
  command output. Green checkmarks, cyan URLs, orange hotkey hints.
  JetBrains Mono font. A thin blue-to-purple gradient progress bar at
  the top of the screen. A blinking blue cursor at the bottom left."

Dev mode desktop layout:
  "A Flutter DevTools-inspired dark IDE layout. Left: 280px widget tree
  sidebar with expandable blue monospace tree nodes on dark #21252B
  background. Center: a dark portfolio website with thin blue bounding
  box overlays on sections. Right: 260px properties panel with orange
  keys and green string values. Bottom: 180px dark console with coloured
  log level badges [INFO] [WARNING] [DEBUG]. Top: 36px tab bar with
  'Flutter Inspector', 'Performance', 'Memory', 'Logging' tabs."

Mobile dev mode:
  "Mobile dark portfolio with a top 36px DevTools tab bar and a bottom
  52px tab bar with four tabs: Tree, UI, Props, Console. The screen shows
  the UI tab active with the portfolio content. All on a very dark #1E2227
  background."

Performance tab:
  "A dark Flutter DevTools Performance tab with a horizontal flame graph.
  Skill rows with green/orange/red progress bars and FPS badges on the
  right. Dark background, monospace labels, no real charts — just styled
  CSS bars."

=======================================================================
SECTION 17 — IMPLEMENTATION CHECKLIST
=======================================================================

Complete these in order. Do not proceed to the next item until the
current one is tested and visually verified.

Phase 1a — State & structure:
  [ ] Create DevModeState InheritedComponent
  [ ] Add isDevMode, enterDevMode, exitDevMode to top-level app component
  [ ] Create DevModePill component with CSS as specified
  [ ] Verify pill appears in bottom-center in normal mode
  [ ] Verify pill hover state and tooltip work

Phase 1b — Transition overlay:
  [ ] Create FlutterRunOverlay component with all log lines
  [ ] Verify staggered animation timing matches spec
  [ ] Verify progress bar animates correctly
  [ ] Verify Skip button dismisses overlay immediately
  [ ] Verify overlay triggers enterDevMode callback on completion

Phase 1c — DevTools shell layout:
  [ ] Create DevModeShell with correct 4-zone CSS grid
  [ ] Create DevToolsTabBar with correct styling
  [ ] Verify tab bar renders correctly on desktop
  [ ] Verify the Performance tab switches the centre view

Phase 1d — Widget tree panel:
  [ ] Implement all tree nodes with correct indent levels
  [ ] Implement accordion expand/collapse with Map state
  [ ] Verify only one sibling expands at a time
  [ ] Implement scroll sync (content → tree highlight)
  [ ] Implement click-to-scroll (tree node → content)
  [ ] Verify bounding box appears on content when tree node is hovered

Phase 1e — Properties panel:
  [ ] Render default build metadata in empty state
  [ ] Implement per-node property maps
  [ ] Verify properties update when tree nodes are hovered
  [ ] Implement live property indicators (pulsing dots)

Phase 1f — Debug console:
  [ ] Render console with header and filter buttons
  [ ] Implement log entry rendering with level colours
  [ ] Implement initial staggered log entries on dev mode mount
  [ ] Implement all 14 reactive log triggers from Section 12
  [ ] Implement filter functionality
  [ ] Implement clear button
  [ ] Implement collapse/expand
  [ ] Verify auto-scroll to bottom on new entry

Phase 1g — Exit mechanic:
  [ ] Register keyboard listener for 'q' key
  [ ] Show exit button on 'q' press
  [ ] Show flutter stop console line on 'q' press
  [ ] Exit button triggers animated dismount
  [ ] Exit returns to normal mode cleanly
  [ ] Cancel all StreamSubscriptions in dispose()

Phase 1h — Mobile layout:
  [ ] Detect viewport width in initState
  [ ] Render bottom tab bar on mobile
  [ ] Implement zone switching via tab bar
  [ ] Exit button always visible on mobile
  [ ] Verify all 4 zones are accessible and scrollable on mobile

Phase 1i — Performance tab:
  [ ] Render all skill bars with correct colours
  [ ] Animate bars on mount with staggered delays
  [ ] Render footnote text below bars

Phase 1j — Final polish:
  [ ] All CSS variables defined at :root level
  [ ] Scrollbar styling applied in dev mode
  [ ] All transitions smooth at 60fps
  [ ] No console errors in browser
  [ ] Dev mode pill hidden when isDevMode is true
  [ ] All StreamSubscriptions cancelled in dispose()
  [ ] Verify on Chrome, Firefox, and Safari

