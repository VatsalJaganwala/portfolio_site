# TestCase.md — Vatsal Jaganwala Portfolio
### Manual QA Test Suite — All Features

---

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Suite 1 — Normal Mode: Navbar](#suite-1--normal-mode-navbar)
3. [Suite 2 — Normal Mode: Hero Section](#suite-2--normal-mode-hero-section)
4. [Suite 3 — Normal Mode: Projects Section](#suite-3--normal-mode-projects-section)
5. [Suite 4 — Normal Mode: About Section](#suite-4--normal-mode-about-section)
6. [Suite 5 — Normal Mode: Skills Section](#suite-5--normal-mode-skills-section)
7. [Suite 6 — Normal Mode: Experience Section](#suite-6--normal-mode-experience-section)
8. [Suite 7 — Normal Mode: Open Source Section](#suite-7--normal-mode-open-source-section)
9. [Suite 8 — Normal Mode: Education Section](#suite-8--normal-mode-education-section)
10. [Suite 9 — Normal Mode: Achievements Section](#suite-9--normal-mode-achievements-section)
11. [Suite 10 — Normal Mode: Contact Section](#suite-10--normal-mode-contact-section)
12. [Suite 11 — Normal Mode: WhatsApp Widget](#suite-11--normal-mode-whatsapp-widget)
13. [Suite 12 — Normal Mode: Animations & Scroll](#suite-12--normal-mode-animations--scroll)
14. [Suite 13 — Normal Mode: Responsive Design](#suite-13--normal-mode-responsive-design)
15. [Suite 14 — Dev Mode: Entry & Exit](#suite-14--dev-mode-entry--exit)
16. [Suite 15 — Dev Mode: DevTools Shell Layout](#suite-15--dev-mode-devtools-shell-layout)
17. [Suite 16 — Dev Mode: Widget Tree Panel](#suite-16--dev-mode-widget-tree-panel)
18. [Suite 17 — Dev Mode: Properties Panel](#suite-17--dev-mode-properties-panel)
19. [Suite 18 — Dev Mode: Debug Console & Commands](#suite-18--dev-mode-debug-console--commands)
20. [Suite 19 — Dev Mode: Performance Tab](#suite-19--dev-mode-performance-tab)
21. [Suite 20 — Dev Mode: Memory & Network Tabs](#suite-20--dev-mode-memory--network-tabs)
22. [Suite 21 — Dev Mode: Toggle Buttons](#suite-21--dev-mode-toggle-buttons)
23. [Suite 22 — Dev Mode: Easter Eggs — Keyboard](#suite-22--dev-mode-easter-eggs--keyboard)
24. [Suite 23 — Dev Mode: Easter Eggs — CLI Commands](#suite-23--dev-mode-easter-eggs--cli-commands)
25. [Suite 24 — Dev Mode: Easter Eggs — Click Triggers](#suite-24--dev-mode-easter-eggs--click-triggers)
26. [Suite 25 — Dev Mode: Easter Eggs — Automatic](#suite-25--dev-mode-easter-eggs--automatic)
27. [Suite 26 — Dev Mode: Mobile Layout](#suite-26--dev-mode-mobile-layout)
28. [Suite 27 — Dev Mode: Stability & Edge Cases](#suite-27--dev-mode-stability--edge-cases)
29. [Suite 28 — Cross-Browser Compatibility](#suite-28--cross-browser-compatibility)

---

## Test Environment Setup

| Item | Detail |
|------|--------|
| Browsers | Chrome 124+, Firefox 125+, Safari 17+ |
| Viewports | 320px, 480px, 768px, 1024px, 1280px, 1440px, 1920px |
| OS | Windows 11, macOS Sonoma, iOS 17, Android 14 |
| Network | Online (CDN scripts required for QR, confetti, qr-code-styling) |
| Prerequisites | Site built and served (`jaspr serve` or Firebase Hosting) |

---

## Suite 1 — Normal Mode: Navbar

---

**TC-NM-001**
- **Feature:** Navbar — Desktop layout
- **Scenario:** Navbar renders correctly on desktop
- **Preconditions:** Site loaded at ≥ 769px viewport
- **Steps:** 1. Open site. 2. Observe navbar at top.
- **Expected:** Fixed navbar with logo `vatsal_jaganwala`, links (work, about, experience, contact), "Open to work" pill visible
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-002**
- **Feature:** Navbar — Scroll behaviour
- **Scenario:** Navbar stays fixed on scroll
- **Preconditions:** Desktop viewport
- **Steps:** 1. Scroll down 500px. 2. Observe navbar position.
- **Expected:** Navbar remains fixed at top with blur backdrop. Does not scroll away.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-003**
- **Feature:** Navbar — Anchor navigation
- **Scenario:** Clicking nav links scrolls to correct section
- **Preconditions:** Desktop viewport, page fully loaded
- **Steps:** 1. Click "work". 2. Observe scroll. 3. Repeat for "about", "experience", "contact".
- **Expected:** Page smooth-scrolls to the corresponding section for each link.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-004**
- **Feature:** Navbar — Mobile bottom nav
- **Scenario:** Bottom nav replaces top links on mobile
- **Preconditions:** Viewport ≤ 768px
- **Steps:** 1. Resize to 375px. 2. Observe navbar.
- **Expected:** Top nav links hidden. Bottom nav bar visible with work/about/experience/contact.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-005**
- **Feature:** Navbar — "Open to work" pill
- **Scenario:** Pill links to email
- **Preconditions:** Desktop viewport
- **Steps:** 1. Click "Open to work" pill.
- **Expected:** Opens `mailto:vatsaljaganwala@gmail.com` in email client.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 2 — Normal Mode: Hero Section

---

**TC-NM-010**
- **Feature:** Hero — Content rendering
- **Scenario:** Hero section displays correct personal info
- **Preconditions:** Page loaded
- **Steps:** 1. Observe hero section.
- **Expected:** Name "vatsal" + "jaganwala." in large heading. Subtitle "Flutter Developer". Summary text visible. Stats: 3+ years, 6+ projects, 2+ packages.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-011**
- **Feature:** Hero — CTA buttons
- **Scenario:** "View my work" scrolls to projects
- **Steps:** 1. Click "View my work →".
- **Expected:** Page scrolls to Projects section.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-012**
- **Feature:** Hero — CTA buttons
- **Scenario:** "Contact ↗" scrolls to contact
- **Steps:** 1. Click "Contact ↗".
- **Expected:** Page scrolls to Contact section.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-013**
- **Feature:** Hero — Code card
- **Scenario:** Code card visible on desktop, hidden on mobile
- **Preconditions:** Test at 1440px and 375px
- **Steps:** 1. At 1440px observe right side. 2. Resize to 375px.
- **Expected:** Code card with `developer_profile.dart` snippet visible at 1440px. Hidden at 375px.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-NM-014**
- **Feature:** Hero — Scroll indicator
- **Scenario:** "↓ SCROLL" text visible
- **Steps:** 1. Observe bottom of hero section.
- **Expected:** "↓  SCROLL" text visible in muted colour.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 3 — Normal Mode: Projects Section

---

**TC-NM-020**
- **Feature:** Projects — Card rendering
- **Scenario:** All 6 project cards render with correct data
- **Steps:** 1. Scroll to Projects section. 2. Count cards. 3. Verify each card has platform, title, description, tech pills.
- **Expected:** 6 project cards in 3 rows of 2. Each has platform badge, title, description, and at least one tech pill.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-021**
- **Feature:** Projects — Card hover
- **Scenario:** Cards lift on hover
- **Preconditions:** Desktop viewport
- **Steps:** 1. Hover over any project card.
- **Expected:** Card border brightens and card lifts slightly (translateY -2px).
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-NM-022**
- **Feature:** Projects — Responsive grid
- **Scenario:** Cards stack to single column on mobile
- **Preconditions:** Viewport ≤ 680px
- **Steps:** 1. Resize to 375px. 2. Observe project grid.
- **Expected:** Each row shows one card per row (single column layout).
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 4 — Normal Mode: About Section

---

**TC-NM-030**
- **Feature:** About — Content
- **Scenario:** About section displays correct info
- **Steps:** 1. Scroll to About section.
- **Expected:** Heading "About Vatsal Jaganwala.", role label, blockquote, body text, stat cards (Current Role, Company, Since), code block, status card "Available for new opportunities".
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-031**
- **Feature:** About — Status card
- **Scenario:** Status dot animates
- **Steps:** 1. Observe green dot in status card.
- **Expected:** Green dot pulses with CSS animation.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 5 — Normal Mode: Skills Section

---

**TC-NM-040**
- **Feature:** Skills — Pill rendering
- **Scenario:** All skill pills render in correct groups
- **Steps:** 1. Scroll to Skills section. 2. Verify three groups: technical_skills, soft_skills, languages.
- **Expected:** 8 technical skills, 4 soft skills, 3 languages. Each as a pill with hover effect.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-041**
- **Feature:** Skills — Pill hover
- **Scenario:** Pills highlight on hover
- **Steps:** 1. Hover over any skill pill.
- **Expected:** Border turns accent-green, text turns accent-green.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 6 — Normal Mode: Experience Section

---

**TC-NM-050**
- **Feature:** Experience — Timeline
- **Scenario:** Experience entry renders correctly
- **Steps:** 1. Scroll to Experience section.
- **Expected:** Timeline with green dot, duration "08/2023 — Present", title "Associate Flutter Developer", company "Instance IT Solutions · Full-time · Surat, India", 6 responsibility items.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-051**
- **Feature:** Experience — CTA button
- **Scenario:** "Open to new opportunities" button opens email
- **Steps:** 1. Click "● Open to new opportunities" button.
- **Expected:** Opens `mailto:vatsaljaganwala@gmail.com`.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 7 — Normal Mode: Open Source Section

---

**TC-NM-060**
- **Feature:** Open Source — Cards
- **Scenario:** Both packages render with correct data
- **Steps:** 1. Scroll to Open Source section.
- **Expected:** Two cards: `smartpub` and `flutter_logger_pro`. Each with role badge, description, key features, tech pills.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 8 — Normal Mode: Education Section

---

**TC-NM-070**
- **Feature:** Education — Entries
- **Scenario:** All 3 education entries render
- **Steps:** 1. Scroll to Education section.
- **Expected:** B.E. IT (SVIT, 08/2020–08/2024, CGPA 8.23), HSC (Riverdale Academy, 03/2020), SSC (S.D.R. Umrigar School, 03/2018).
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 9 — Normal Mode: Achievements Section

---

**TC-NM-080**
- **Feature:** Achievements — Cards
- **Scenario:** Both achievement cards render
- **Steps:** 1. Scroll to Achievements section.
- **Expected:** "Silent Achiever Award" (01/04/2025) and "On The Spot Award" (01/05/2024) cards with org, date, description.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 10 — Normal Mode: Contact Section

---

**TC-NM-090**
- **Feature:** Contact — Links
- **Scenario:** All contact links work
- **Steps:** 1. Click "Send an email". 2. Click "LinkedIn". 3. Click "GitHub". 4. Verify info cards show correct data.
- **Expected:** Email opens mailto. LinkedIn opens linkedin.com/in/vatsaljaganwala in new tab. GitHub opens github.com/vatsaljaganwala in new tab. Info cards show email, phone, LinkedIn, GitHub.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-091**
- **Feature:** Contact — Footer
- **Scenario:** Footer renders with correct year
- **Steps:** 1. Scroll to bottom.
- **Expected:** Footer with "Built with Jaspr" and current year.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 11 — Normal Mode: WhatsApp Widget

---

**TC-NM-100**
- **Feature:** WhatsApp — Desktop QR card
- **Scenario:** QR card visible on desktop
- **Preconditions:** Viewport > 768px, online (qrserver.com accessible)
- **Steps:** 1. Load site. 2. Observe bottom-right corner.
- **Expected:** QR card with styled SVG QR code (dark theme), WhatsApp logo in centre, "Scan to chat" label.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-101**
- **Feature:** WhatsApp — QR click
- **Scenario:** Clicking QR card opens WhatsApp
- **Steps:** 1. Click the QR card.
- **Expected:** Opens `https://wa.me/917041355506` in new tab.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-102**
- **Feature:** WhatsApp — Mobile FAB
- **Scenario:** FAB visible on mobile, QR hidden
- **Preconditions:** Viewport ≤ 768px
- **Steps:** 1. Resize to 375px. 2. Observe bottom-right.
- **Expected:** Green circular FAB with WhatsApp logo. QR card not visible.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-103**
- **Feature:** WhatsApp — FAB click
- **Scenario:** FAB opens WhatsApp on mobile
- **Steps:** 1. Tap FAB on mobile.
- **Expected:** Opens WhatsApp app or `wa.me` link.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-104**
- **Feature:** WhatsApp — Hidden in Dev Mode
- **Scenario:** Widget hidden when Dev Mode active
- **Steps:** 1. Enter Dev Mode. 2. Observe bottom-right.
- **Expected:** Both QR card and FAB are not visible.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 12 — Normal Mode: Animations & Scroll

---

**TC-NM-110**
- **Feature:** Scroll animations
- **Scenario:** Sections animate in on scroll
- **Steps:** 1. Load page. 2. Slowly scroll down. 3. Observe each section.
- **Expected:** Each section fades in and slides up (opacity 0→1, translateY 20px→0) when it enters the viewport.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-NM-111**
- **Feature:** Scroll animations — Replay
- **Scenario:** Animations do not replay on scroll back up
- **Steps:** 1. Scroll down past hero. 2. Scroll back up. 3. Scroll down again.
- **Expected:** Sections that already animated stay visible. No re-animation on second scroll.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 13 — Normal Mode: Responsive Design

---

**TC-NM-120**
- **Feature:** Responsive — 320px
- **Scenario:** Site usable at minimum width
- **Steps:** 1. Set viewport to 320px. 2. Scroll through all sections.
- **Expected:** No horizontal overflow. All text readable. No elements clipped. Bottom nav visible.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-121**
- **Feature:** Responsive — 768px (tablet)
- **Scenario:** Tablet layout correct
- **Steps:** 1. Set viewport to 768px. 2. Check navbar, hero, projects.
- **Expected:** Bottom nav visible. Hero single column. Project cards may stack.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-NM-122**
- **Feature:** Responsive — 1440px (large desktop)
- **Scenario:** Wide layout correct
- **Steps:** 1. Set viewport to 1440px. 2. Check max-width container.
- **Expected:** Content centred with max-width 960px. No excessive stretching.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

---

## Suite 14 — Dev Mode: Entry & Exit

---

**TC-DM-001**
- **Feature:** Dev Mode — Entry via debug pill
- **Scenario:** Clicking debug pill starts flutter run overlay
- **Preconditions:** Normal mode active, desktop viewport
- **Steps:** 1. Locate debug pill at bottom-center. 2. Click it.
- **Expected:** Flutter run overlay appears full-screen. Progress bar animates. Log lines appear staggered. Cursor blinks at 4s.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-002**
- **Feature:** Dev Mode — Overlay auto-dismiss
- **Scenario:** Overlay auto-dismisses after ~4.3s
- **Steps:** 1. Click debug pill. 2. Wait without clicking Skip.
- **Expected:** After ~4.3s overlay disappears and DevTools shell slides in.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-003**
- **Feature:** Dev Mode — Skip button
- **Scenario:** Skip button immediately enters Dev Mode
- **Steps:** 1. Click debug pill. 2. Click "Skip →" immediately.
- **Expected:** Overlay dismissed instantly. DevTools shell appears.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-004**
- **Feature:** Dev Mode — Exit via q key
- **Scenario:** Pressing q exits Dev Mode
- **Preconditions:** Dev Mode active, not typing in console
- **Steps:** 1. Press `q` key.
- **Expected:** Console shows "> flutter stop". Exit button appears. Shell slides out after ~600ms. Normal mode restored.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-005**
- **Feature:** Dev Mode — Exit via button
- **Scenario:** Exit button click exits Dev Mode
- **Steps:** 1. Press `q` to show exit button. 2. Click "✕ Exit DevTools — Back to normal view".
- **Expected:** Shell slides out. Normal portfolio visible. Debug pill restored.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-006**
- **Feature:** Dev Mode — Re-entry
- **Scenario:** Dev Mode can be entered a second time
- **Steps:** 1. Enter Dev Mode. 2. Exit. 3. Click debug pill again.
- **Expected:** Flutter run overlay plays again with fresh animations. DevTools shell opens cleanly.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-007**
- **Feature:** Dev Mode — `flutter run --release` exit
- **Scenario:** Premium exit via console command
- **Steps:** 1. Enter Dev Mode. 2. Type `flutter run --release` in console. 3. Press Enter.
- **Expected:** Console shows build sequence. After ~1.5s shell exits elegantly.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-008**
- **Feature:** Dev Mode — Debug pill hidden
- **Scenario:** Debug pill not visible during Dev Mode
- **Steps:** 1. Enter Dev Mode. 2. Look for debug pill.
- **Expected:** Debug pill not visible anywhere on screen.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 15 — Dev Mode: DevTools Shell Layout

---

**TC-DM-010**
- **Feature:** Shell — 4-zone layout
- **Scenario:** All 4 zones render correctly
- **Preconditions:** Dev Mode active, desktop ≥ 1024px
- **Steps:** 1. Observe shell layout.
- **Expected:** Tab bar (top, 36px), Widget Tree (left, ~280px), Content Area (centre), Properties Panel (right, ~260px), Console (bottom, ~180px).
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-011**
- **Feature:** Shell — Console collapse
- **Scenario:** Console collapses and expands
- **Steps:** 1. Click ▼ toggle in console header. 2. Click ▲ to re-expand.
- **Expected:** Console body collapses to 0 height. Header stays visible. Re-expands on click.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-012**
- **Feature:** Shell — Slide-in animation
- **Scenario:** Shell animates in on entry
- **Steps:** 1. Enter Dev Mode via Skip.
- **Expected:** Shell slides up from bottom with fade-in (0.35s).
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-013**
- **Feature:** Shell — Slide-out animation
- **Scenario:** Shell animates out on exit
- **Steps:** 1. Press q and confirm exit.
- **Expected:** Shell slides down with fade-out (0.35s) before disappearing.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 16 — Dev Mode: Widget Tree Panel

---

**TC-DM-020**
- **Feature:** Widget Tree — Node rendering
- **Scenario:** All tree nodes render with correct structure
- **Steps:** 1. Observe widget tree panel.
- **Expected:** MaterialApp at root. Scaffold, AppBar, SingleChildScrollView as children. Hero, ProjectsSection, AboutSection, ExperienceTimeline, ContactSection, FloatingActionButton as leaf/branch nodes.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-021**
- **Feature:** Widget Tree — Expand/collapse
- **Scenario:** Clicking parent node expands children
- **Steps:** 1. Click MaterialApp node. 2. Observe children. 3. Click again.
- **Expected:** Children appear on first click. Collapse on second click.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-022**
- **Feature:** Widget Tree — Scroll sync
- **Scenario:** Active node updates as content scrolls
- **Steps:** 1. Scroll content area to Projects section. 2. Observe tree.
- **Expected:** ProjectsSection node highlighted with blue left border.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-023**
- **Feature:** Widget Tree — Click navigation
- **Scenario:** Clicking section node scrolls content
- **Steps:** 1. Click ContactSection node.
- **Expected:** Content area scrolls to Contact section.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-024**
- **Feature:** Widget Tree — Search
- **Scenario:** Search filters nodes in real time
- **Steps:** 1. Click search box (or press F). 2. Type "Project".
- **Expected:** Only ProjectsSection and ProjectCard nodes visible. Others hidden. Matching text highlighted in blue.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-025**
- **Feature:** Widget Tree — Search clear
- **Scenario:** Clearing search restores full tree
- **Steps:** 1. Search "Hero". 2. Click × clear button.
- **Expected:** Full tree restored to previous accordion state.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 17 — Dev Mode: Properties Panel

---

**TC-DM-030**
- **Feature:** Properties — Default state
- **Scenario:** App info shown when nothing inspected
- **Steps:** 1. Open Dev Mode. 2. Observe properties panel without hovering tree.
- **Expected:** "App info" section with app, version, dartSDK, flutterVer, buildMode, platform, theme, locale rows.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-031**
- **Feature:** Properties — Node inspection
- **Scenario:** Hovering tree node shows node properties
- **Steps:** 1. Hover over `hero` node in tree.
- **Expected:** Properties panel updates to show hero-specific properties (tag, isHovered, child, crossAxis, renderSize).
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-032**
- **Feature:** Properties — Live dot
- **Scenario:** Live properties show pulsing red dot
- **Steps:** 1. Hover `contact` node. 2. Observe `hiringSignal` property.
- **Expected:** Red pulsing dot next to `hiringSignal: true`.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-033**
- **Feature:** Properties — Layout Explorer
- **Scenario:** Box model diagram appears on node click
- **Steps:** 1. Click any tree node.
- **Expected:** Layout Explorer section appears at bottom of properties with margin/padding/content nested boxes.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-034**
- **Feature:** Properties — Key Inspector
- **Scenario:** Key shown for nodes with defined keys
- **Steps:** 1. Click `hero` node.
- **Expected:** Key section shows `ValueKey('hero')`.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-035**
- **Feature:** Properties — Jaspr meta
- **Scenario:** Framework meta shown for body node
- **Steps:** 1. Click `body` (SingleChildScrollView) node.
- **Expected:** Framework Meta section shows Jaspr version, renderMode, language, hosting, devMode.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 18 — Dev Mode: Debug Console & Commands

---

**TC-DM-040**
- **Feature:** Console — Initial logs
- **Scenario:** 7 staggered logs fire on Dev Mode entry
- **Steps:** 1. Enter Dev Mode. 2. Observe console.
- **Expected:** 7 log entries appear staggered: Portfolio initialised, Theme: dark, Hot restart not available, DevTools connected, setState warning, Scroll controller, Welcome message. Plus time-based greeting.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-041**
- **Feature:** Console — Filter pills
- **Scenario:** Filter pills hide/show entries by level
- **Steps:** 1. Click "WARNING" pill. 2. Observe console. 3. Click "ALL".
- **Expected:** Only WARNING entries visible when WARNING selected. All entries visible when ALL selected.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-042**
- **Feature:** Console — Clear button
- **Scenario:** Clear button empties console
- **Steps:** 1. Click 🗑 button.
- **Expected:** All log entries removed from console.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-043**
- **Feature:** Console — Input field
- **Scenario:** Console input accepts commands
- **Steps:** 1. Click console input. 2. Type `help`. 3. Press Enter.
- **Expected:** `> help` command line appears in orange. Help table with all commands appears.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-044**
- **Feature:** Console — Suggestion panel
- **Scenario:** Suggestions appear on focus
- **Steps:** 1. Click console input (without typing).
- **Expected:** Dropdown panel shows all 32+ commands with descriptions.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-045**
- **Feature:** Console — Suggestion filtering
- **Scenario:** Typing filters suggestions
- **Steps:** 1. Type "flutter" in console input.
- **Expected:** Only flutter-prefixed commands shown. "flutter" text highlighted in blue in each result.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-046**
- **Feature:** Console — Arrow key navigation
- **Scenario:** Arrow keys navigate suggestions
- **Steps:** 1. Focus console input. 2. Press ArrowDown 3 times. 3. Press Enter.
- **Expected:** Third suggestion highlighted. Enter executes that command.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-047**
- **Feature:** Console — Tab autocomplete
- **Scenario:** Tab completes partial command
- **Steps:** 1. Type "flutter d". 2. Press Tab.
- **Expected:** Input completes to "flutter doctor".
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-048**
- **Feature:** Console — Unknown command
- **Scenario:** Unknown command shows WidgetNotFoundException
- **Steps:** 1. Type `foobar`. 2. Press Enter.
- **Expected:** Error log: `WidgetNotFoundException: No widget found for command 'foobar'.` with stack trace lines.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-049**
- **Feature:** Console — Rapid commands
- **Scenario:** Multiple commands in quick succession don't crash
- **Steps:** 1. Type and submit: `flutter doctor`, `flutter clean`, `flutter pub get`, `flutter test`, `git log` in rapid succession.
- **Expected:** All commands execute. Console shows all outputs. No crash or freeze.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 19 — Dev Mode: Performance Tab

---

**TC-DM-050**
- **Feature:** Performance Tab — Switch
- **Scenario:** Clicking Performance tab shows flame graph
- **Steps:** 1. Click "Performance" tab in tab bar.
- **Expected:** Content area hidden. Performance view shows "Frame rendering timeline" header, 8 bar rows, footer notes.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-051**
- **Feature:** Performance Tab — Bar animation
- **Scenario:** Bars animate from 0% to target width
- **Steps:** 1. Switch to Performance tab. 2. Observe bars.
- **Expected:** All 8 bars start at 0% and animate to their target widths with staggered delays. Flutter/Dart reaches 100%, Attending meetings reaches 13%.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-052**
- **Feature:** Performance Tab — Bar colours
- **Scenario:** Bar colours match fps ranges
- **Steps:** 1. Observe bar colours.
- **Expected:** Flutter/Dart, State Management, UI/Animations = green. Firebase, REST APIs, Unit Testing = yellow. Writing Docs, Attending meetings = red.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-053**
- **Feature:** Performance Tab — CPU Profile button
- **Scenario:** 🔥 CPU Profile button appears and toggles flame chart
- **Steps:** 1. Switch to Performance tab. 2. Click "🔥 CPU Profile".
- **Expected:** Flame chart appears below bar graph showing buildPortfolio() → renderProjects() → buildProjectCard() → animateHero() → awaitJobOffer() with widths proportional to time. awaitJobOffer() has pulsing dot.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-054**
- **Feature:** Performance Tab — Return to Inspector
- **Scenario:** Switching back to Inspector restores content area
- **Steps:** 1. Switch to Performance. 2. Click "Flutter Inspector" tab.
- **Expected:** Performance view hidden. Content area restored with portfolio content.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 20 — Dev Mode: Memory & Network Tabs

---

**TC-DM-060**
- **Feature:** Memory Tab — Heap treemap
- **Scenario:** Memory tab shows heap blocks
- **Steps:** 1. Click "Memory" tab.
- **Expected:** Heap snapshot view with 7 coloured blocks (ambition 847KB, flutter_bloc 234KB, etc.) and Isolates section showing 3 isolates.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-061**
- **Feature:** Memory Tab — Isolates
- **Scenario:** portfolio_dreams isolate shows suspended state
- **Steps:** 1. Click Memory tab. 2. Observe Isolates section.
- **Expected:** `portfolio_dreams` isolate shows yellow dot (suspended) with `Future<Dream> { getHired: pending }`.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-062**
- **Feature:** Network Tab — Panel
- **Scenario:** Network tab shows fake requests
- **Steps:** 1. Click "Logging" tab (or if Network tab added, click it).
- **Expected:** Network panel with 6 rows. POST /api/hire shows 202 ⏳ in yellow, pulsing.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-063**
- **Feature:** Network Tab — Hire row click
- **Scenario:** Clicking POST /api/hire row logs message
- **Steps:** 1. Open Network tab. 2. Click the POST /api/hire row.
- **Expected:** Console logs: `[INFO] POST /api/hire is pending. Have you considered clicking "Hire"?`
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 21 — Dev Mode: Toggle Buttons

---

**TC-DM-070**
- **Feature:** Toggle — 🌈 Repaint Rainbow
- **Scenario:** Toggle adds rainbow outlines to content
- **Steps:** 1. Click 🌈 button in tab bar.
- **Expected:** Button turns blue/active. All elements in content area get cycling rainbow outline animation.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-071**
- **Feature:** Toggle — 🐢 Slow Animations
- **Scenario:** Toggle slows all transitions
- **Steps:** 1. Click 🐢 button. 2. Hover a skill pill in content area.
- **Expected:** Pill hover transition visibly slower (3× duration). Animation scrubber appears at bottom of content area.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-072**
- **Feature:** Toggle — Animation Scrubber
- **Scenario:** Scrubber controls animation progress
- **Steps:** 1. Enable 🐢 slow mode. 2. Drag scrubber slider.
- **Expected:** Scrubber value updates (0%–100%). `--anim-progress` CSS variable changes.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-073**
- **Feature:** Toggle — 📊 Performance Overlay
- **Scenario:** Toggle shows canvas bar charts
- **Steps:** 1. Click 📊 button.
- **Expected:** Two canvas bars appear at top of content area (UI Thread green, Raster blue). Bars animate every 100ms.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-074**
- **Feature:** Toggle — ♿ Semantic Debugger
- **Scenario:** Toggle labels interactive elements
- **Steps:** 1. Click ♿ button.
- **Expected:** Blue labels appear over links, buttons, headings, images (max 30). Labels show element type and text.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-075**
- **Feature:** Toggle — ♟ Checkerboard Cache
- **Scenario:** Toggle adds cyan outline to images
- **Steps:** 1. Click ♟ button.
- **Expected:** All `<img>` elements get cyan outline.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-076**
- **Feature:** Toggle — — Baseline Painting
- **Scenario:** Toggle adds red underlines to text
- **Steps:** 1. Click — button.
- **Expected:** Red bottom border on all p, span, h1, h2, h3, li elements in content area.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-077**
- **Feature:** Toggle — 📐 Constraints Badges
- **Scenario:** Toggle shows tight/loose badges per section
- **Steps:** 1. Click 📐 button.
- **Expected:** Red "tight constraints" badge on Hero and About. Green "loose constraints" badge on Projects, Skills, Experience, etc.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-078**
- **Feature:** Toggle — 📏 Breakpoint Markers
- **Scenario:** Toggle shows dashed breakpoint lines
- **Steps:** 1. Click 📏 button.
- **Expected:** Dashed horizontal lines at xs/sm/md/lg breakpoints. Current breakpoint line is blue.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-079**
- **Feature:** Toggle — 🔗 InheritedWidget Flow
- **Scenario:** Toggle shows data flow in tree panel
- **Steps:** 1. Click 🔗 button.
- **Expected:** "DevModeState flowing ↓" label with animated dotted lines connecting MaterialApp → Scaffold → Body → sections in tree panel.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-080**
- **Feature:** Toggle — All toggles off on exit
- **Scenario:** All toggle states reset when Dev Mode exits
- **Steps:** 1. Enable 🌈, 🐢, 📊. 2. Exit Dev Mode. 3. Re-enter Dev Mode.
- **Expected:** All toggles start in OFF state on re-entry. No leftover overlays.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 22 — Dev Mode: Easter Eggs — Keyboard

---

**TC-DM-090**
- **Feature:** EGG-31 — Hot Reload (`r` key)
- **Scenario:** r key triggers hot reload
- **Preconditions:** Dev Mode active, not typing in console
- **Steps:** 1. Press `r` key.
- **Expected:** Yellow flash on content area. Console: `[INFO] Performing hot reload... 🔥` then reload time log.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-091**
- **Feature:** EGG-32 — Hot Restart (`R` key)
- **Scenario:** R key triggers full restart
- **Steps:** 1. Press `R` (Shift+R).
- **Expected:** White flash covers shell. Console clears. Restart sequence logs appear. Tree collapses. Properties resets.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-092**
- **Feature:** EGG-71 — Konami Code
- **Scenario:** Konami sequence activates God Mode
- **Steps:** 1. Press ↑ ↑ ↓ ↓ ← → ← → B A (not in console input).
- **Expected:** Matrix rain animation on shell. Console: `[INFO] Cheat code activated. God mode enabled.` All perf bars jump to 100%. Confetti fires.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-093**
- **Feature:** EGG-86 — Tab Autocomplete
- **Scenario:** Tab key completes commands
- **Steps:** 1. Focus console. 2. Type "git". 3. Press Tab.
- **Expected:** Input completes to "git log".
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-094**
- **Feature:** Keyboard — ? key shortcuts panel
- **Scenario:** ? key opens shortcuts panel
- **Steps:** 1. Press `?` (not in console).
- **Expected:** Shortcuts modal appears with all 7 shortcuts listed.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-095**
- **Feature:** Keyboard — Escape closes panels
- **Scenario:** Escape closes shortcuts panel
- **Steps:** 1. Open shortcuts panel. 2. Press Escape.
- **Expected:** Panel closes.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 23 — Dev Mode: Easter Eggs — CLI Commands

---

**TC-DM-100**
- **Feature:** EGG-01 — `flutter doctor`
- **Scenario:** Command outputs health check
- **Steps:** 1. Type `flutter doctor`. 2. Press Enter.
- **Expected:** 8 staggered lines. `[!] Your hesitation to hire Vatsal` in red. `! Doctor found issues in 1 category.` in warning.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-101**
- **Feature:** EGG-02 — `flutter clean`
- **Scenario:** Command flashes content area
- **Steps:** 1. Type `flutter clean`. 2. Press Enter.
- **Expected:** Deletion lines appear. Content area briefly flashes white. "847mb freed." logged.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-102**
- **Feature:** EGG-04 — `flutter build web`
- **Scenario:** Command fires confetti
- **Steps:** 1. Type `flutter build web`. 2. Press Enter.
- **Expected:** Build output lines. After ~1.6s confetti fires. "Deploying personality..." logged.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-103**
- **Feature:** EGG-79 — `./hire.sh`
- **Scenario:** hire.sh opens email client
- **Steps:** 1. Type `./hire.sh`. 2. Press Enter.
- **Expected:** Staggered validation lines. After ~5.2s: confetti fires, email client opens with subject "Re: Flutter Developer Role — You passed hire.sh".
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-104**
- **Feature:** EGG-26 — `null`
- **Scenario:** null command shows crash screen
- **Steps:** 1. Type `null`. 2. Press Enter.
- **Expected:** Red crash screen covers shell with NullPointerException details and "Press R to hot restart."
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-105**
- **Feature:** EGG-26 — Null crash dismiss
- **Scenario:** R key dismisses crash screen
- **Steps:** 1. Trigger null crash. 2. Press R.
- **Expected:** Crash screen removed. Console: `[INFO] Hot restart performed. Null resolved.`
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-106**
- **Feature:** EGG-77 — `theme`
- **Scenario:** Theme cycles through 4 options
- **Steps:** 1. Type `theme` 4 times.
- **Expected:** Each call cycles: default (blue) → material-you (purple) → hacker (green) → dart (orange) → back to default. Tab bar accent colour changes each time.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-107**
- **Feature:** EGG-82 — `vim`
- **Scenario:** Vim mode activates and exits
- **Steps:** 1. Type `vim`. 2. Press Enter. 3. Type `:wq`. 4. Press Enter.
- **Expected:** Console shows `-- NORMAL --`. Prompt changes to `vim>`. `:wq` exits with "Vim exited gracefully. A miracle."
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-108**
- **Feature:** EGG-64 — `dart challenge`
- **Scenario:** Quiz runs 3 questions
- **Steps:** 1. Type `dart challenge`. 2. Answer each question with 1–4.
- **Expected:** 3 questions appear sequentially. Score shown at end. Perfect score fires confetti.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-109**
- **Feature:** EGG-46 — `state wars`
- **Scenario:** State Wars modal opens
- **Steps:** 1. Type `state wars`. 2. Press Enter.
- **Expected:** Modal with comparison table (Bloc vs Riverpod vs Provider vs GetX). Verdict line at bottom.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-110**
- **Feature:** EGG-100 — `hire vatsal`
- **Scenario:** Ultimate command opens email
- **Steps:** 1. Type `hire vatsal`. 2. Press Enter.
- **Expected:** Email client opens immediately with "You're Hired" subject. Staggered validation logs appear. Confetti fires after logs complete.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-111**
- **Feature:** EGG-93 — `shaders`
- **Scenario:** Shader warm-up runs without freezing
- **Steps:** 1. Type `shaders`. 2. Press Enter. 3. Continue interacting with console.
- **Expected:** 14 shader compilation lines appear at 80ms intervals (~1.1s total). Page remains responsive throughout. "⚡ Shaders: warm" badge appears in tab bar.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-112**
- **Feature:** EGG-40 — `changelog`
- **Scenario:** Changelog modal opens
- **Steps:** 1. Type `changelog`. 2. Press Enter.
- **Expected:** Modal with career CHANGELOG.md showing 4 version entries. Scrollable.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-113**
- **Feature:** EGG-81 — `recruiter`
- **Scenario:** Recruiter mode toggles properties panel
- **Steps:** 1. Type `recruiter`. 2. Press Enter. 3. Observe properties panel. 4. Type `recruiter` again.
- **Expected:** Properties panel shows candidate summary (experience, availability, salary, notice, relocate, timezone). Second call restores normal view.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 24 — Dev Mode: Easter Eggs — Click Triggers

---

**TC-DM-120**
- **Feature:** EGG-76 — Flutter logo × 5
- **Scenario:** 5 rapid clicks on Flutter logo opens credits
- **Steps:** 1. Click the Flutter diamond icon in tab bar 5 times within 3 seconds.
- **Expected:** Credits modal appears with "Built with ❤️ by Vatsal Jaganwala", stack list, GitHub and LinkedIn links.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-121**
- **Feature:** EGG-61 — Triple-click "Connected"
- **Scenario:** Triple-clicking Connected text opens GPT panel
- **Steps:** 1. Triple-click "Connected" text in tab bar right side.
- **Expected:** "GPT vs Flutter Developer" modal opens with comparison table.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-122**
- **Feature:** EGG-70 — Triple-click fab node
- **Scenario:** Triple-clicking fab node reveals hidden tree node
- **Steps:** 1. Click `fab` (FloatingActionButton) node 3 times rapidly.
- **Expected:** `EnterpriseClient(status: "interested")` node appears below fab with "👀 hidden" badge. Console logs discovery message.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-123**
- **Feature:** EGG-84 — Right-click code review
- **Scenario:** Right-clicking content shows code review menu
- **Steps:** 1. Right-click any section in content area.
- **Expected:** Custom context menu with: Code Review header, Approve, Request changes, Leave a comment, Inspect element.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-124**
- **Feature:** EGG-84 — Approve action
- **Scenario:** Approve fires confetti
- **Steps:** 1. Right-click content. 2. Click "✅ Approve this section".
- **Expected:** Confetti fires. Console: `[INFO] LGTM ✓ — {section} approved by reviewer.`
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-125**
- **Feature:** EGG-25 — Triple-click setState storm
- **Scenario:** Triple-clicking content spams warnings
- **Steps:** 1. Triple-click any section in content area.
- **Expected:** 8 warning lines: "setState() called during build. (1/8)" through (8/8). Content flickers. After 500ms: "setState storm resolved."
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-126**
- **Feature:** EGG-73 — App name click changelog
- **Scenario:** Clicking app name in tab bar opens changelog
- **Steps:** 1. Click "portfolio | Flutter DevTools" text in tab bar.
- **Expected:** Changelog modal opens.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

## Suite 25 — Dev Mode: Easter Eggs — Automatic

---

**TC-DM-130**
- **Feature:** EGG-74 — Time-based greeting
- **Scenario:** Greeting matches time of day
- **Steps:** 1. Enter Dev Mode at different times of day.
- **Expected:** Morning (5–11): "Good morning!". Afternoon (12–16): "Good afternoon!". Evening (17–20): "Good evening!". Night (21–4): "Burning the midnight oil?"
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-131**
- **Feature:** EGG-75 — Fake visitor analytics
- **Scenario:** Visitor count increments over time
- **Steps:** 1. Enter Dev Mode. 2. Wait 90+ seconds.
- **Expected:** Console logs: `[DEBUG] New visitor from {City}. Total: {n}.` City is a real city name (including Indian cities like Surat, Ahmedabad).
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-132**
- **Feature:** EGG-56 — CI pipeline pill
- **Scenario:** CI pill appears after 5s
- **Steps:** 1. Enter Dev Mode. 2. Wait 5 seconds.
- **Expected:** "CI: passing" pill with green dot appears in tab bar. After 3 more seconds briefly shows "CI: running..." then returns to "CI: passing".
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-133**
- **Feature:** EGG-62 — Discord status pill
- **Scenario:** Discord pill appears on entry
- **Steps:** 1. Enter Dev Mode. 2. Observe tab bar.
- **Expected:** Discord pill with blurple dot and "Discord: online" text visible in tab bar.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-134**
- **Feature:** EGG-72 — Jank spike after 60s idle
- **Scenario:** Jank spike fires after 60s no interaction
- **Steps:** 1. Enter Dev Mode. 2. Do not interact for 60+ seconds.
- **Expected:** Console: `[DEBUG] ⚠ Frame spike detected at t=60s.` One perf bar briefly spikes to 100% red then returns.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-135**
- **Feature:** EGG-59 — Flutter Weekly banner
- **Scenario:** Banner appears when scrolling to projects
- **Steps:** 1. Enter Dev Mode. 2. Scroll content area to Projects section.
- **Expected:** "Featured in Flutter Weekly #312" banner appears above projects. Has × close button.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-136**
- **Feature:** EGG-18 — Widget size tooltip
- **Scenario:** Hovering section shows RenderBox tooltip
- **Steps:** 1. Hover over any section in content area.
- **Expected:** Tooltip appears near cursor: `RenderBox(size: W.0 × H.0)` with actual dimensions.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-137**
- **Feature:** EGG-30 — Context depth meter
- **Scenario:** Depth meter updates on scroll
- **Steps:** 1. Enter Dev Mode. 2. Scroll to different sections.
- **Expected:** Sticky badge at bottom of content area shows widget path and depth. Updates as sections change.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-138**
- **Feature:** EGG-96 — Rebuild counter
- **Scenario:** Counter increments on interaction
- **Steps:** 1. Enter Dev Mode. 2. Click and scroll several times.
- **Expected:** "🔄 Rebuilds: N" badge in properties panel header increments. At 50: warning log. At 100: second warning.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-139**
- **Feature:** EGG-85 — Expandable stack trace
- **Scenario:** Clicking error log entry expands stack trace
- **Steps:** 1. Trigger any error (e.g. type unknown command). 2. Click the [ERROR] log entry.
- **Expected:** Stack trace expands below the entry with exception details and "[Open hire.sh]" link.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

## Suite 26 — Dev Mode: Mobile Layout

---

**TC-DM-140**
- **Feature:** Mobile — Bottom tab bar
- **Scenario:** Bottom tabs visible on mobile
- **Preconditions:** Viewport ≤ 1023px
- **Steps:** 1. Enter Dev Mode on mobile.
- **Expected:** Bottom tab bar with 🌳 Tree, 📱 UI, ⚙️ Props, 🖥 Console. UI tab active by default.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-141**
- **Feature:** Mobile — Tab switching
- **Scenario:** Tapping tabs switches zones
- **Steps:** 1. Tap 🌳 Tree tab. 2. Tap ⚙️ Props tab.
- **Expected:** Widget tree panel visible on Tree tab. Properties panel visible on Props tab.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-142**
- **Feature:** Mobile — Exit button always visible
- **Scenario:** Exit button visible without pressing q
- **Steps:** 1. Enter Dev Mode on mobile.
- **Expected:** Exit button visible in tab bar immediately on entry (no q key required).
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-143**
- **Feature:** Mobile — Console input
- **Scenario:** Console input usable on mobile
- **Steps:** 1. Tap Console tab. 2. Tap input field. 3. Type `help`. 4. Submit.
- **Expected:** Keyboard opens. Command executes. Suggestion panel appears on focus.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 27 — Dev Mode: Stability & Edge Cases

---

**TC-DM-150**
- **Feature:** Stability — Rapid entry/exit
- **Scenario:** Entering and exiting Dev Mode 5 times rapidly
- **Steps:** 1. Click debug pill. 2. Click Skip. 3. Press q. 4. Repeat 5 times.
- **Expected:** No crash. Each cycle works correctly. No duplicate DOM elements. No stale timers.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-151**
- **Feature:** Stability — All CLI commands in sequence
- **Scenario:** Run every CLI command without crashing
- **Steps:** 1. Enter Dev Mode. 2. Run each command: flutter doctor, flutter clean, flutter pub get, flutter build web, flutter upgrade, flutter analyze, flutter test, dart --version, git log, ./hire.sh, null (then R), stackoverflow, discord, theme, dwg, pub upgrade --major-versions, changelog, recruiter, vim (:wq), di, audit, tail (then tail again), liveshare, observatory, state wars, dart challenge (answer 1,1,1), shaders.
- **Expected:** All commands execute without page crash. Console shows appropriate output for each.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-152**
- **Feature:** Stability — All toggles simultaneously
- **Scenario:** Enable all toggle buttons at once
- **Steps:** 1. Click 🌈, 🐢, 📊, ♿, ♟, —, 📐, 📏, 🔗 in sequence.
- **Expected:** All toggles activate. No crash. Content area may look busy but remains scrollable.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-153**
- **Feature:** Stability — Exit with active toggles
- **Scenario:** Exit Dev Mode with all toggles on
- **Steps:** 1. Enable all toggles. 2. Exit Dev Mode.
- **Expected:** All overlays removed. Normal mode clean. No leftover CSS classes or DOM elements.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-154**
- **Feature:** Stability — Null crash + exit
- **Scenario:** Exit Dev Mode while null crash screen is showing
- **Steps:** 1. Type `null`. 2. Immediately press q (not R).
- **Expected:** Dev Mode exits cleanly. Crash screen removed. Normal mode restored.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-155**
- **Feature:** Stability — Tail + exit
- **Scenario:** Exit Dev Mode while tail is running
- **Steps:** 1. Type `tail`. 2. Wait for 2 log lines. 3. Press q to exit.
- **Expected:** Tail timer stops. No further logs after exit. No console errors.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-156**
- **Feature:** Stability — Dart challenge + exit
- **Scenario:** Exit mid-quiz
- **Steps:** 1. Type `dart challenge`. 2. Answer Q1. 3. Press q to exit.
- **Expected:** Dev Mode exits. Quiz state reset. Re-entering Dev Mode allows fresh quiz.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-157**
- **Feature:** Stability — Memory/Network tab + Inspector switch
- **Scenario:** Switching between all tabs works
- **Steps:** 1. Click Memory. 2. Click Network. 3. Click Performance. 4. Click Flutter Inspector.
- **Expected:** Each tab shows correct view. Inspector restores content area correctly.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-DM-158**
- **Feature:** Edge case — Empty console submit
- **Scenario:** Pressing Enter with empty input
- **Steps:** 1. Focus console input. 2. Press Enter without typing.
- **Expected:** Nothing happens. No error logged. No crash.
- **Actual Result:**
- **Status:**
- **Priority:** Medium

---

**TC-DM-159**
- **Feature:** Edge case — Very long command
- **Scenario:** Typing 200+ characters in console
- **Steps:** 1. Type a 200-character string. 2. Press Enter.
- **Expected:** `WidgetNotFoundException` shown. No crash. Input cleared.
- **Actual Result:**
- **Status:**
- **Priority:** Low

---

**TC-DM-160**
- **Feature:** Edge case — Special characters in console
- **Scenario:** Typing `<script>alert(1)</script>`
- **Steps:** 1. Type `<script>alert(1)</script>`. 2. Press Enter.
- **Expected:** Treated as unknown command. HTML escaped in console output. No XSS execution.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

## Suite 28 — Cross-Browser Compatibility

---

**TC-CB-001**
- **Feature:** Chrome — Full site
- **Scenario:** All features work in Chrome
- **Steps:** 1. Open in Chrome 124+. 2. Test normal mode. 3. Test Dev Mode entry/exit. 4. Run 5 CLI commands.
- **Expected:** All features functional. No console errors.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-CB-002**
- **Feature:** Firefox — Full site
- **Scenario:** All features work in Firefox
- **Steps:** 1. Open in Firefox 125+. 2. Repeat TC-CB-001 steps.
- **Expected:** All features functional. `backdrop-filter` may not apply in older Firefox but layout intact.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-CB-003**
- **Feature:** Safari — Full site
- **Scenario:** All features work in Safari
- **Steps:** 1. Open in Safari 17+. 2. Repeat TC-CB-001 steps.
- **Expected:** All features functional. `-webkit-backdrop-filter` applied for blur effects.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-CB-004**
- **Feature:** Mobile Chrome — Android
- **Scenario:** Site usable on Android Chrome
- **Steps:** 1. Open on Android device. 2. Test normal mode scroll. 3. Enter Dev Mode. 4. Use bottom tabs.
- **Expected:** No horizontal overflow. Bottom nav works. Dev Mode mobile layout correct.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-CB-005**
- **Feature:** Mobile Safari — iOS
- **Scenario:** Site usable on iOS Safari
- **Steps:** 1. Open on iPhone. 2. Test normal mode. 3. Enter Dev Mode.
- **Expected:** No layout issues. WhatsApp FAB visible. Dev Mode mobile layout correct.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

**TC-CB-006**
- **Feature:** CDN dependencies
- **Scenario:** External scripts load correctly
- **Steps:** 1. Open browser DevTools Network tab. 2. Load site. 3. Check: qr-code-styling, canvas-confetti, Google Fonts.
- **Expected:** All CDN resources return 200. No 404s. QR code renders. Confetti available.
- **Actual Result:**
- **Status:**
- **Priority:** High

---

---

*TestCase.md — Version 1.0 | Generated for Vatsal Jaganwala Portfolio*
*Total test cases: 160+ | Suites: 28 | Coverage: Normal Mode + Dev Mode + Easter Eggs + Cross-browser*
