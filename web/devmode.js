/**
 * DevMode — Flutter DevTools Easter Egg
 * Phase 1 + Phase 2 + Phase 3 interactivity.
 *
 * Phase 3 additions:
 *  - Functional widget tree search (real-time filter + highlight)
 *  - Hot reload simulation (r key — flash + console logs)
 *  - Keyboard shortcuts panel (? key)
 *  - Time-based console greeting
 *
 * Data contract: window.__portfolio is injected by main.server.dart as an
 * inline <script> before this file loads. All personal/project data is read
 * from that object. If it is missing (e.g. stale build), DOM-based fallbacks
 * are used where possible.
 */
(function () {
  'use strict';

  // ─── Bootstrap: read portfolio data from <meta name="devmode-data"> ──────
  // main.server.dart embeds a JSON string in this meta tag at build time.
  // This is the only reliable way to pass Dart data to JS in Jaspr static mode
  // (script(content:) does not render inline JS in the static renderer).
  (function () {
    try {
      const el = document.querySelector('meta[name="devmode-data"]');
      if (el && el.content) {
        window.__portfolio = JSON.parse(el.content);
      }
    } catch (e) {
      console.warn('[devmode] Failed to parse devmode-data meta tag:', e);
      window.__portfolio = {};
    }
  })();

  // ─── State ───────────────────────────────────────────────────────────────
  let isDevMode = false;
  let isTransitioning = false;
  let activeTab = 'inspector';
  let showExitButton = false;
  let consoleFilter = 'ALL';
  let consoleExpanded = true;
  let inspectedNodeId = null;
  let idleTimer = null;
  let activeMobileTab = 'ui';

  // Phase 2 state
  let activeSection = null;          // currently visible section id
  let _activeBbox = null;            // currently shown bounding box section (internal)
  let bboxHideTimer = null;          // delayed hide timer for bboxes
  let scrollSub = null;              // content area scroll listener
  let sectionListeners = [];         // { el, enter, leave } for cleanup
  let projectCardListeners = [];     // { el, enter, leave } for cleanup
  let linkListeners = [];            // { el, click } for cleanup
  let scrollBottomFired = false;     // fire scroll-to-bottom log once per session
  let annotationsInjected = false;   // inject once per dev mode session
  let badgesInjected = false;

  // Phase 3 state
  let searchQuery = '';              // current widget tree search string
  let hotReloadCount = 0;            // number of hot reloads this session
  let shortcutsVisible = false;      // keyboard shortcuts overlay visible

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function isMobile() {
    return window.innerWidth < 1024;
  }

  function now() {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0'))
      .join(':');
  }

  // Scoped querySelector — always searches within #dt-content-area first,
  // falling back to document only when the shell is not active.
  // This prevents targeting the duplicate normal-site DOM that is always present.
  function scopedById(id) {
    const contentArea = document.getElementById('dt-content-area');
    if (contentArea) {
      const el = contentArea.querySelector(`#${CSS.escape(id)}`);
      if (el) return el;
    }
    return document.getElementById(id);
  }

  function scopedQuery(selector) {
    const contentArea = document.getElementById('dt-content-area');
    if (contentArea) return contentArea.querySelector(selector);
    return document.querySelector(selector);
  }

  function scopedQueryAll(selector) {
    const contentArea = document.getElementById('dt-content-area');
    if (contentArea) return contentArea.querySelectorAll(selector);
    return document.querySelectorAll(selector);
  }

  // ─── Console log controller ───────────────────────────────────────────────
  const logEntries = [];

  function addLog(level, message) {
    logEntries.push({ level, message, timestamp: now(), isCommand: false });
    renderConsole();
    scrollConsoleToBottom();
  }

  function addCommand(cmd) {
    logEntries.push({ level: 'command', message: cmd, timestamp: '', isCommand: true });
    renderConsole();
    scrollConsoleToBottom();
  }

  function clearLogs() {
    logEntries.length = 0;
    renderConsole();
  }

  function scrollConsoleToBottom() {
    const body = document.getElementById('dt-console-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  // ─── Enter DevMode ────────────────────────────────────────────────────────
  function enterDevMode() {
    if (isTransitioning || isDevMode) return;
    isTransitioning = true;

    // Hide pill
    const pill = document.getElementById('debug-pill');
    if (pill) pill.style.display = 'none';

    // Hide site chrome immediately (bottom-nav etc.)
    document.body.classList.add('devmode-active');

    // Show overlay — force CSS animations to replay on re-entry
    const overlay = document.getElementById('flutter-run-overlay');
    if (overlay) {
      // Step 1: make visible first so reflow is meaningful
      overlay.style.display = 'flex';
      // Step 2: collect all animated children
      const animated = [overlay, ...overlay.querySelectorAll('.overlay-progress, .log-line, .terminal-cursor')];
      // Step 3: freeze all animations by setting animation to none via inline style
      animated.forEach(el => { el.style.animationName = 'none'; });
      // Step 4: force a single reflow to flush the style change
      void overlay.offsetHeight;
      // Step 5: remove the inline override — browser restarts the CSS animations from scratch
      animated.forEach(el => { el.style.animationName = ''; });
    }

    // Auto-complete after 4.3s
    setTimeout(completeTransition, 4300);
  }

  // ─── Populate DevTools content area ──────────────────────────────────────
  // Clones the real page content into #dt-content-area at runtime.
  // This replaces the old approach of pre-rendering a duplicate Jaspr component
  // tree, which caused duplicate <h1>/<h2> tags in the static HTML.
  function populateContentArea() {
    const contentArea = document.getElementById('dt-content-area');
    if (!contentArea) return;

    // Only clone once per session — re-entry reuses the existing clone.
    if (contentArea.dataset.populated === 'true') return;

    // The real page content is the first child div of the app root.
    const realContent = document.querySelector('body > div > div.pt-navbar');
    if (!realContent) return;

    const clone = realContent.cloneNode(true);
    // Keep all IDs intact — scopedById() searches inside #dt-content-area first,
    // so it will find these cloned elements rather than the original page elements.
    // No prefixing needed; the scoping handles disambiguation.

    contentArea.appendChild(clone);
    contentArea.dataset.populated = 'true';
  }

  function completeTransition() {
    isTransitioning = false;
    isDevMode = true;

    // Reset per-session Phase 2 flags
    scrollBottomFired = false;
    annotationsInjected = false;
    badgesInjected = false;
    activeSection = null;
    _activeBbox = null;

    // Reset Phase 3 state
    searchQuery = '';
    hotReloadCount = 0;
    shortcutsVisible = false;

    // Hide overlay
    const overlay = document.getElementById('flutter-run-overlay');
    if (overlay) overlay.style.display = 'none';

    // Clone real page content into #dt-content-area.
    // The Dart server no longer pre-renders a duplicate component tree —
    // we clone the live DOM instead so the static HTML has no duplicate headings.
    populateContentArea();

    // Show shell with entrance animation
    const shell = document.getElementById('devtools-shell');
    if (shell) {
      shell.classList.remove('exiting', 'entering');
      shell.style.display = 'flex';
      // Force reflow so the animation replays on re-entry
      void shell.offsetWidth;
      shell.classList.add('entering');
      // Remove class after animation so it doesn't interfere with exiting
      setTimeout(() => shell.classList.remove('entering'), 400);
    }

    // Mark body so site chrome (bottom-nav etc.) can be hidden via CSS
    document.body.classList.add('devmode-active');

    // Exit button is always visible — no q key required to reveal it
    showExitButton = true;
    // Render after a tick so the shell DOM is painted first
    setTimeout(renderExitButton, 50);

    // Schedule initial console logs
    scheduleInitialLogs();

    // Setup key listener
    setupKeyListener();

    // Setup idle detection
    setupIdleDetection();

    // Phase 2: inject annotations + badges, wire section/card listeners, scroll sync
    injectAnnotations();
    injectCommitBadges();
    ensureBboxOverlay();
    setupScrollSync();
    setupSectionListeners();
    setupProjectCardListeners();
    setupLinkListeners();

    // Phase 3: wire search, show time-based greeting
    setupTreeSearch();
    showTimeBasedGreeting();

    // Phase 4: fire enter hooks (devmode_eggs.js)
    _enterHooks.forEach(fn => { try { fn(window.__devmode); } catch(e) {} });
    // Setup mobile tabs if needed
    if (isMobile()) setupMobileTabs();
  }

  // ─── Exit DevMode ─────────────────────────────────────────────────────────
  function exitDevMode() {
    addLog('info', 'Exiting... Application finished.');

    const shell = document.getElementById('devtools-shell');
    if (shell) shell.classList.add('exiting');

    setTimeout(() => {
      isDevMode = false;
      isTransitioning = false;
      showExitButton = false;
      inspectedNodeId = null;
      activeSection = null;
      activeTab = 'inspector';
      activeMobileTab = 'ui';

      // Reset mobile zone active states to default (ui active)
      document.querySelectorAll('.dt-mobile-zone').forEach(z =>
        z.classList.toggle('active', z.dataset.zone === 'ui'));
      document.querySelectorAll('.dt-mobile-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.zone === 'ui'));

      // Reset console state
      consoleExpanded = true;
      consoleFilter = 'ALL';
      const bodyWrap = document.getElementById('dt-console-body-wrap');
      if (bodyWrap) bodyWrap.classList.remove('collapsed');
      const toggleBtn = document.getElementById('dt-console-toggle');
      if (toggleBtn) toggleBtn.textContent = '▼';
      // Reset filter pills to ALL
      document.querySelectorAll('.dt-filter-pill').forEach(p =>
        p.classList.toggle('active', p.dataset.filter === 'ALL'));

      // Reset tab bar to inspector
      document.querySelectorAll('.dt-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.tab === 'inspector'));
      const contentArea = document.getElementById('dt-content-area');
      const perfView = document.getElementById('dt-perf-view');
      if (contentArea) contentArea.style.display = '';
      if (perfView) perfView.style.display = 'none';

      // Clear exit button container
      const exitContainer = document.getElementById('dt-exit-btn-container');
      if (exitContainer) exitContainer.innerHTML = '';

      if (shell) shell.style.display = 'none';

      // Remove devmode body class so site chrome reappears
      document.body.classList.remove('devmode-active');

      const pill = document.getElementById('debug-pill');
      if (pill) pill.style.display = '';

      clearLogs();
      removeKeyListener();
      clearIdleDetection();

      // Phase 2 cleanup
      teardownScrollSync();
      teardownSectionListeners();
      teardownProjectCardListeners();
      teardownLinkListeners();
      removeAnnotations();
      removeCommitBadges();
      hideBbox();
      const bboxOverlay = document.getElementById('dt-bbox-overlay');
      if (bboxOverlay) bboxOverlay.remove();

      // Phase 3 cleanup
      teardownTreeSearch();
      closeShortcutsPanel();
      searchQuery = '';
      hotReloadCount = 0;
      shortcutsVisible = false;
      // Reset nodeProps cache so it rebuilds from window.__portfolio on re-entry
      _nodeProps = null;

      // Phase 4: fire exit hooks (devmode_eggs.js)
      _exitHooks.forEach(fn => { try { fn(); } catch(e) {} });
    }, 350);
  }

  // ─── Key listener ─────────────────────────────────────────────────────────
  let keyHandler = null;

  function setupKeyListener() {
    keyHandler = function (e) {
      if (!isDevMode) return;

      // Escape closes shortcuts panel
      if (e.key === 'Escape') {
        if (shortcutsVisible) { closeShortcutsPanel(); return; }
      }

      // Don't fire shortcuts when typing in the search box
      const active = document.activeElement;
      const inInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

      if (e.key === 'q' || e.key === 'Q') {
        if (!inInput) handleQKey();
      } else if ((e.key === 'r' || e.key === 'R') && !inInput) {
        if (e.shiftKey || e.key === 'R') {
          handleHotRestart();
        } else {
          handleHotReload();
        }
      } else if (e.key === '?' && !inInput) {
        toggleShortcutsPanel();
      } else if ((e.key === 'c' || e.key === 'C') && !inInput) {
        clearLogs();
        addLog('debug', 'Console cleared.');
      } else if ((e.key === '/') && !inInput) {
        e.preventDefault();
        const bodyWrap = document.getElementById('dt-console-body-wrap');
        const toggleBtn = document.getElementById('dt-console-toggle');
        if (bodyWrap) {
          consoleExpanded = !consoleExpanded;
          bodyWrap.classList.toggle('collapsed', !consoleExpanded);
          if (toggleBtn) toggleBtn.textContent = consoleExpanded ? '▼' : '▲';
        }
      } else if ((e.key === 'f' || e.key === 'F') && !inInput) {
        e.preventDefault();
        const searchInput = document.querySelector('.dt-tree-search');
        if (searchInput) searchInput.focus();
      } else if (!inInput) {
        addLog('debug', `Key event: '${e.key}'. Did you mean 'q' to quit?`);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function removeKeyListener() {
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
  }

  function handleQKey() {
    showExitButton = true;
    renderExitButton();
    addCommand('> flutter stop');
    setTimeout(() => {
      addLog('info', 'Caught terminal signal. Application about to exit.');
      addLog('debug', 'Exiting DevTools...');
      // Auto-exit after the q key — no button click required
      exitDevMode();
    }, 600);
  }

  // ─── Idle detection ───────────────────────────────────────────────────────
  let mouseMoveHandler = null;

  function setupIdleDetection() {
    resetIdle();
    mouseMoveHandler = () => resetIdle();
    document.addEventListener('mousemove', mouseMoveHandler);
  }

  function clearIdleDetection() {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler);
      mouseMoveHandler = null;
    }
  }

  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (isDevMode) {
        addLog('debug', 'No interaction detected for 20s. Visitor still reading. Good sign.');
      }
    }, 20000);
  }

  // ─── Initial console logs ─────────────────────────────────────────────────
  function scheduleInitialLogs() {
    const p = window.__portfolio || {};
    // Widget count: rough estimate based on actual content size
    const widgetCount = 800 + (p.projectCount || 0) * 8 + (p.experienceCount || 0) * 6;
    const logs = [
      [0, 'info', `Portfolio initialised. Rendering ${widgetCount} widgets...`],
      [300, 'info', 'Theme: dark. Platform: web.'],
      [600, 'debug', 'Hot restart not available in production build.'],
      [900, 'info', 'DevTools connected. Inspector active.'],
      [1200, 'warning', 'setState() called 3 times during build. Consider optimising.'],
      [1500, 'debug', 'Scroll controller attached to SingleChildScrollView.'],
      [1800, 'info', 'Welcome, visitor. Portfolio ready for inspection.'],
    ];
    logs.forEach(([delay, level, msg]) => {
      setTimeout(() => { if (isDevMode) addLog(level, msg); }, delay);
    });
  }

  // ─── Render console ───────────────────────────────────────────────────────
  function renderConsole() {
    const body = document.getElementById('dt-console-body');
    if (!body) return;

    body.innerHTML = logEntries.map(entry => {
      if (entry.isCommand) {
        return `<div class="dt-log-command">${escHtml(entry.message)}</div>`;
      }
      const levelStr = entry.level.toUpperCase();
      const hidden = consoleFilter !== 'ALL' && levelStr !== consoleFilter ? ' hidden' : '';
      return `<div class="dt-log-entry${hidden}">
        <span class="dt-log-level ${entry.level}">[${levelStr}]</span>
        <span class="dt-log-message">${escHtml(entry.message)}</span>
        <span class="dt-log-time">${entry.timestamp}</span>
      </div>`;
    }).join('');
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ─── Render exit button ───────────────────────────────────────────────────
  function renderExitButton() {
    const container = document.getElementById('dt-exit-btn-container');
    if (!container) return;
    if (showExitButton) {
      container.innerHTML = `<button class="dt-exit-btn" id="dt-exit-btn">✕ Exit DevTools — Back to normal view</button>`;
      document.getElementById('dt-exit-btn').addEventListener('click', exitDevMode);
    } else {
      container.innerHTML = '';
    }
  }

  // ─── Tab switching ────────────────────────────────────────────────────────
  function switchTab(tabId) {
    if (activeTab === tabId) return; // already on this tab
    activeTab = tabId;
    document.querySelectorAll('.dt-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    const contentArea = document.getElementById('dt-content-area');
    const perfView = document.getElementById('dt-perf-view');
    const memView = document.getElementById('dt-memory-view');

    // Hide all views first
    if (contentArea) contentArea.style.display = '';
    if (perfView) perfView.style.display = 'none';
    if (memView) memView.style.display = 'none';
    // Also hide network view if it exists
    const netView = document.getElementById('dt-network-view');
    if (netView) netView.style.display = 'none';

    if (tabId === 'performance') {
      if (contentArea) contentArea.style.display = 'none';
      if (perfView) {
        perfView.style.display = 'block';
        perfView.querySelectorAll('.dt-flame-fill').forEach(bar => {
          bar.style.transition = 'none';
          bar.style.width = '0%';
        });
        void perfView.offsetWidth;
        setTimeout(() => {
          perfView.querySelectorAll('.dt-flame-fill').forEach(bar => {
            bar.style.transition = '';
            bar.style.width = bar.dataset.target || '0%';
          });
        }, 100);
      }
      addLog('debug', 'Collecting frame rendering data...');
      setTimeout(() => {
        if (isDevMode) addLog('warning', 'High coffee dependency detected. Performance may vary.');
      }, 800);
      // Phase 5: inject CPU profile button via eggs.js hook
      setTimeout(() => {
        if (window.__devmode && window.__devmode.onPerfTabOpen) {
          window.__devmode.onPerfTabOpen();
        }
      }, 200);
    } else if (tabId === 'memory') {
      if (contentArea) contentArea.style.display = 'none';
      // Delegate to eggs.js via the hook
      if (window.__devmode && window.__devmode.switchToMemory) {
        window.__devmode.switchToMemory();
      }
    } else if (tabId === 'network') {
      if (contentArea) contentArea.style.display = 'none';
      if (window.__devmode && window.__devmode.switchToNetwork) {
        window.__devmode.switchToNetwork();
      }
    }
  }

  // ─── Widget tree node interaction ─────────────────────────────────────────
  function onNodeHover(nodeId) {
    inspectedNodeId = nodeId;
    renderProperties();
    // Phase 2: show bounding box for section-mapped nodes
    const node = document.querySelector(`.tree-node[data-node="${nodeId}"]`);
    const section = node ? node.dataset.section : null;
    if (section) showBbox(section);
  }

  function onNodeLeave() {
    // Hide bbox after short delay (allows moving to content area)
    scheduleBboxHide(400);
  }

  function onNodeClick(nodeId, section) {
    inspectedNodeId = nodeId;
    renderProperties();

    // Phase 5: inject layout explorer + Jaspr meta via eggs.js hooks
    if (window.__devmode && window.__devmode.onNodeClick) {
      window.__devmode.onNodeClick(nodeId);
    }

    // Phase 2: scroll content to section
    if (section) {
      const contentArea = document.getElementById('dt-content-area');
      const el = scopedById(section);
      if (el && contentArea) {
        let top = 0;
        let node = el;
        while (node && node !== contentArea) {
          top += node.offsetTop;
          node = node.offsetParent;
        }
        contentArea.scrollTo({ top: top - 16, behavior: 'smooth' });
      }
      showBbox(section);
      // Auto-hide bbox after 2s
      scheduleBboxHide(2000);
    }

    // Toggle expand/collapse for parent nodes (with sibling collapse)
    const children = document.querySelectorAll(`.tree-node[data-parent="${nodeId}"]`);
    if (children.length > 0) {
      const isExpanded = children[0].style.display !== 'none';
      if (!isExpanded) {
        // Collapse siblings at same indent level before expanding
        collapseSiblings(nodeId);
      }
      children.forEach(c => c.style.display = isExpanded ? 'none' : '');
      const toggle = document.querySelector(`.tree-node[data-node="${nodeId}"] .tree-node-toggle`);
      if (toggle) toggle.textContent = isExpanded ? '▶' : '▼';
    }
  }

  // Collapse all expanded siblings at the same tree level
  function collapseSiblings(nodeId) {
    const clickedNode = document.querySelector(`.tree-node[data-node="${nodeId}"]`);
    if (!clickedNode) return;
    const parentId = clickedNode.dataset.parent;
    // Find all nodes with the same parent
    const siblings = parentId
      ? document.querySelectorAll(`.tree-node[data-parent="${parentId}"]`)
      : document.querySelectorAll(`.tree-node:not([data-parent])`);
    siblings.forEach(sib => {
      const sibId = sib.dataset.node;
      if (sibId === nodeId) return;
      // Hide their children
      document.querySelectorAll(`.tree-node[data-parent="${sibId}"]`)
        .forEach(c => c.style.display = 'none');
      // Reset their toggle arrow
      const toggle = sib.querySelector('.tree-node-toggle');
      if (toggle && toggle.textContent === '▼') toggle.textContent = '▶';
    });
  }

  // --- Properties panel ---------------------------------------------------
  // nodeProps is built from window.__portfolio (injected by main.server.dart).
  // No personal data is hardcoded here.
  function buildNodeProps() {
    const p = window.__portfolio || {};
    const props = {};

    // Root / structural nodes
    props['material-app'] = [{ key: 'title', value: `"${p.name || ''}"`, type: '' }, { key: 'debugShowCheckedModeBanner', value: 'false', type: 'type-bool' }, { key: 'themeMode', value: 'ThemeMode.dark', type: 'type-enum' }, { key: 'locale', value: 'Locale("en", "IN")', type: 'type-ref' }];
    props['scaffold'] = [{ key: 'backgroundColor', value: 'Color(0xFF0D0D0D)', type: 'type-ref' }, { key: 'resizeToAvoidBottomInset', value: 'true', type: 'type-bool' }];
    props['navbar'] = [{ key: 'name', value: `"${(p.name || '').split(' ')[0].toLowerCase()}"`, type: '' }, { key: 'email', value: `"${p.email || ''}"`, type: '' }, { key: 'position', value: 'fixed', type: 'type-enum' }, { key: 'height', value: '60.0', type: 'type-num' }];
    props['body'] = [{ key: 'scrollDirection', value: 'Axis.vertical', type: 'type-enum' }, { key: 'physics', value: 'BouncingScrollPhysics()', type: 'type-ref' }, { key: 'child', value: 'Column', type: 'type-ref' }];

    // Hero
    props['hero'] = [{ key: 'name', value: `"${p.name || ''}"`, type: '' }, { key: 'title', value: `"${p.title || ''}"`, type: '' }, { key: 'location', value: `"${p.location || ''}"`, type: '' }, { key: 'projectCount', value: String(p.projectCount || 0), type: 'type-num' }, { key: 'osPackages', value: String(p.osCount || 0), type: 'type-num' }, { key: 'isHovered', value: 'false', type: 'type-live' }];
    props['hero-cta-work'] = [{ key: 'label', value: '"View my work →"', type: '' }, { key: 'href', value: '"#projects"', type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }];
    props['hero-cta-contact'] = [{ key: 'label', value: '"Contact ↗"', type: '' }, { key: 'href', value: '"#contact"', type: '' }, { key: 'variant', value: 'ButtonVariant.ghost', type: 'type-enum' }];
    props['hero-code-card'] = [{ key: 'name', value: `"${p.name || ''}"`, type: '' }, { key: 'role', value: `"${p.title || ''}"`, type: '' }, { key: 'location', value: `"${p.location || ''}"`, type: '' }, { key: 'isAvailable', value: 'true', type: 'type-bool' }];

    // Projects
    props['projects'] = [{ key: 'itemCount', value: String(p.projectCount || 0), type: 'type-num' }, { key: 'scrollDir', value: 'Axis.vertical', type: 'type-enum' }, { key: 'padding', value: 'EdgeInsets.all(24.0)', type: 'type-ref' }, { key: 'isVisible', value: 'true', type: 'type-live' }];
    const projData = p.projects || {};
    Object.entries(projData).forEach(([id, proj]) => {
      props[id] = [
        { key: 'title', value: `"${proj.title || ''}"`, type: '' },
        { key: 'platforms', value: `"${proj.platforms || ''}"`, type: '' },
        { key: 'tech', value: `"${proj.tech || ''}"`, type: '' },
        { key: 'isHovered', value: 'false', type: 'type-live' },
        { key: 'animProgress', value: '0.0', type: 'type-live' },
      ];
    });

    // About
    const exp0 = Object.values(p.experience || {})[0] || {};
    props['about'] = [{ key: 'name', value: `"${p.name || ''}"`, type: '' }, { key: 'role', value: `"${exp0.jobTitle || ''}"`, type: '' }, { key: 'company', value: `"${exp0.company || ''}"`, type: '' }, { key: 'location', value: `"${p.location || ''}"`, type: '' }, { key: 'since', value: `"${exp0.startDate || ''}"`, type: '' }, { key: 'isAnimated', value: 'true', type: 'type-bool' }];
    props['about-blockquote'] = [{ key: 'borderColor', value: 'Color(0xFF4ADE80)', type: 'type-ref' }];
    props['about-code'] = [{ key: 'firstName', value: `"${(p.name || '').split(' ')[0].toLowerCase()}"`, type: '' }, { key: 'isAvailable', value: 'true', type: 'type-bool' }];
    props['about-status'] = [{ key: 'available', value: 'true', type: 'type-bool' }, { key: 'label', value: '"Available for new opportunities"', type: '' }];

    // Skills
    props['skills'] = [{ key: 'techCount', value: '8', type: 'type-num' }, { key: 'softCount', value: '4', type: 'type-num' }, { key: 'langCount', value: '3', type: 'type-num' }];
    props['skills-tech'] = [{ key: 'group', value: '"technical_skills"', type: '' }];
    props['skills-soft'] = [{ key: 'group', value: '"soft_skills"', type: '' }];
    props['skills-lang'] = [{ key: 'group', value: '"languages"', type: '' }];

    // Experience
    props['experience'] = [{ key: 'entryCount', value: String(p.experienceCount || 0), type: 'type-num' }, { key: 'layout', value: '"vertical timeline"', type: '' }];
    Object.entries(p.experience || {}).forEach(([id, exp]) => {
      props[id] = [
        { key: 'jobTitle', value: `"${exp.jobTitle || ''}"`, type: '' },
        { key: 'company', value: `"${exp.company || ''}"`, type: '' },
        { key: 'location', value: `"${exp.location || ''}"`, type: '' },
        { key: 'startDate', value: `"${exp.startDate || ''}"`, type: '' },
        { key: 'endDate', value: `"${exp.endDate || ''}"`, type: '' },
        { key: 'responsibilities', value: String(exp.responsibilities || 0), type: 'type-num' },
      ];
    });
    props['exp-cta'] = [{ key: 'label', value: '"Open to new opportunities"', type: '' }, { key: 'href', value: `"mailto:${p.email || ''}"`, type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }];

    // Open Source
    props['open-source'] = [{ key: 'packages', value: String(p.osCount || 0), type: 'type-num' }, { key: 'layout', value: '"two-column grid"', type: '' }];
    Object.entries(p.openSource || {}).forEach(([id, os]) => {
      props[id] = [
        { key: 'name', value: `"${os.name || ''}"`, type: '' },
        { key: 'role', value: `"${os.role || ''}"`, type: '' },
        { key: 'tech', value: `"${os.tech || ''}"`, type: '' },
        { key: 'features', value: String(os.features || 0), type: 'type-num' },
      ];
    });

    // Education
    props['education'] = [{ key: 'entryCount', value: String(p.educationCount || 0), type: 'type-num' }, { key: 'layout', value: '"list"', type: '' }];
    Object.entries(p.education || {}).forEach(([id, edu]) => {
      const row = [
        { key: 'degree', value: `"${edu.degree || ''}"`, type: '' },
        { key: 'institution', value: `"${edu.institution || ''}"`, type: '' },
        { key: 'duration', value: `"${edu.duration || ''}"`, type: '' },
      ];
      if (edu.cgpa) row.push({ key: 'cgpa', value: `"${edu.cgpa}"`, type: '' });
      props[id] = row;
    });

    // Achievements
    props['achievements'] = [{ key: 'count', value: String(p.achievementCount || 0), type: 'type-num' }, { key: 'layout', value: '"two-column grid"', type: '' }];
    Object.entries(p.achievements || {}).forEach(([id, ach]) => {
      props[id] = [
        { key: 'title', value: `"${ach.title || ''}"`, type: '' },
        { key: 'organization', value: `"${ach.organization || ''}"`, type: '' },
        { key: 'date', value: `"${ach.date || ''}"`, type: '' },
      ];
    });

    // Contact
    props['contact'] = [{ key: 'email', value: `"${p.email || ''}"`, type: '' }, { key: 'phone', value: `"${p.phone || ''}"`, type: '' }, { key: 'linkedin', value: `"${p.linkedin || ''}"`, type: '' }, { key: 'github', value: `"${p.github || ''}"`, type: '' }, { key: 'hiringSignal', value: 'true', type: 'type-live' }];
    props['contact-email'] = [{ key: 'label', value: '"Send an email"', type: '' }, { key: 'href', value: `"mailto:${p.email || ''}"`, type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }];
    props['contact-linkedin'] = [{ key: 'label', value: '"LinkedIn"', type: '' }, { key: 'href', value: `"${p.linkedin || ''}"`, type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }];
    props['contact-github'] = [{ key: 'label', value: '"GitHub"', type: '' }, { key: 'href', value: `"${p.github || ''}"`, type: '' }, { key: 'variant', value: 'ButtonVariant.ghost', type: 'type-enum' }];
    props['contact-footer'] = [{ key: 'builtWith', value: '"Jaspr"', type: '' }, { key: 'year', value: String(new Date().getFullYear()), type: 'type-num' }];

    // FAB
    props['fab'] = [{ key: 'elevation', value: '6.0', type: 'type-num' }, { key: 'tooltip', value: '"Hire me"', type: '' }, { key: 'onPressed', value: 'HireCallback', type: 'type-ref' }];

    return props;
  }

  // Built once on first use, then cached
  let _nodeProps = null;
  function getNodeProps() {
    if (!_nodeProps) _nodeProps = buildNodeProps();
    return _nodeProps;
  }

  function renderProperties() {
    const container = document.getElementById('dt-props-inspected');
    if (!container) return;

    if (window.__devmode && window.__devmode.isRecruiterMode && window.__devmode.isRecruiterMode()) {
      return;
    }

    const nodeProps = getNodeProps();
    const props = inspectedNodeId ? nodeProps[inspectedNodeId] : null;
    if (!props) {
      container.innerHTML = `<p class="dt-props-hint">// Hover any widget to inspect</p>`;
      return;
    }

    container.innerHTML = `
      <span class="dt-props-section-title">Widget properties</span>
      ${props.map(p => {
      const liveHtml = p.type === 'type-live'
        ? `<div class="dt-live-dot"></div>`
        : '';
      return `<div class="dt-prop-row">
          <span class="dt-prop-key">${p.key}</span>
          <span class="dt-prop-sep">:</span>
          <span class="dt-prop-val ${p.type}">${liveHtml}${escHtml(p.value)}</span>
        </div>`;
    }).join('')}
    `;
  }

  // ─── Phase 2: Scroll Synchronisation ─────────────────────────────────────

  // Map section element IDs → tree node IDs
  const sectionToNodeId = {
    'hero': 'hero',
    'projects': 'projects',
    'about': 'about',
    'skills': 'skills',
    'experience': 'experience',
    'open-source': 'open-source',
    'education': 'education',
    'achievements': 'achievements',
    'contact': 'contact',
  };

  function setupScrollSync() {
    const contentArea = document.getElementById('dt-content-area');
    if (!contentArea) return;
    scrollSub = () => onContentScroll(contentArea);
    contentArea.addEventListener('scroll', scrollSub);
  }

  function teardownScrollSync() {
    const contentArea = document.getElementById('dt-content-area');
    if (contentArea && scrollSub) {
      contentArea.removeEventListener('scroll', scrollSub);
    }
    scrollSub = null;
    window.removeEventListener('resize', updateBboxPositions);
  }

  function onContentScroll(contentArea) {
    if (!isDevMode) return;

    // Scroll-to-bottom detection
    const atBottom = contentArea.scrollTop + contentArea.clientHeight >= contentArea.scrollHeight - 10;
    if (atBottom && !scrollBottomFired) {
      scrollBottomFired = true;
      addLog('info', 'End of widget tree reached. ContactSection fully visible.');
      setTimeout(() => {
        if (isDevMode) addLog('debug', 'hire.sh is ready to execute. Awaiting input.');
      }, 500);
    }

    // Detect active section using scroll-position-aware offsetTop.
    // getBoundingClientRect() is viewport-relative and changes as you scroll,
    // making all sections appear equidistant. Instead, accumulate offsetTop
    // up to the content area to get the true scroll offset of each section.
    const sectionIds = Object.keys(sectionToNodeId);
    let closest = null;
    let minDist = Infinity;
    const scrollTop = contentArea.scrollTop;

    sectionIds.forEach(id => {
      const el = scopedById(id);
      if (!el) return;

      // Walk up the offset chain until we reach the content area
      let offsetTop = 0;
      let node = el;
      while (node && node !== contentArea) {
        offsetTop += node.offsetTop;
        node = node.offsetParent;
      }

      // Distance from the current scroll position (with a small top bias)
      const dist = Math.abs(offsetTop - scrollTop - 80);
      if (dist < minDist) {
        minDist = dist;
        closest = id;
      }
    });

    if (closest && closest !== activeSection) {
      activeSection = closest;
      updateActiveTreeNode(sectionToNodeId[closest]);
    }
  }

  function updateActiveTreeNode(nodeId) {
    // Remove active from all nodes
    document.querySelectorAll('.tree-node.active').forEach(n => n.classList.remove('active'));
    // Add active to matching node
    const node = document.querySelector(`.tree-node[data-node="${nodeId}"]`);
    if (node) {
      node.classList.add('active');
      // Scroll tree panel to keep node visible.
      // Use getBoundingClientRect() so positions are relative to the viewport,
      // then compare against the treeBody's own rect — works regardless of
      // how deep the offsetParent chain goes.
      const treeBody = document.querySelector('.dt-tree-body');
      if (treeBody) {
        const nodeRect = node.getBoundingClientRect();
        const bodyRect = treeBody.getBoundingClientRect();
        const nodeTopRel = nodeRect.top - bodyRect.top;   // px from visible top of tree
        const nodeBottomRel = nodeRect.bottom - bodyRect.top;

        if (nodeTopRel < 20) {
          // Node is above the visible area — scroll up
          treeBody.scrollBy({ top: nodeTopRel - 20, behavior: 'smooth' });
        } else if (nodeBottomRel > treeBody.clientHeight - 20) {
          // Node is below the visible area — scroll down
          treeBody.scrollBy({ top: nodeBottomRel - treeBody.clientHeight + 20, behavior: 'smooth' });
        }
      }
    }
  }

  // ─── Phase 2: Bounding Box Overlays ──────────────────────────────────────

  // Map section IDs → display labels
  const sectionLabels = {
    'hero': 'HeroSection',
    'projects': 'ProjectsSection',
    'about': 'AboutSection',
    'skills': 'SkillsSection',
    'experience': 'ExperienceTimeline',
    'open-source': 'OpenSourceSection',
    'education': 'EducationSection',
    'achievements': 'AchievementsSection',
    'contact': 'ContactSection',
  };

  function showBbox(sectionId) {
    if (bboxHideTimer) { clearTimeout(bboxHideTimer); bboxHideTimer = null; }
    // Skip if already showing this section (avoid redundant DOM work)
    if (_activeBbox === sectionId) return;
    _activeBbox = sectionId;
    updateBboxPositions();
    // Show only the matching bbox
    document.querySelectorAll('.dt-bbox').forEach(box => {
      const matches = box.dataset.section === sectionId;
      box.classList.toggle('visible', matches);
    });
  }

  function hideBbox() {
    _activeBbox = null;
    document.querySelectorAll('.dt-bbox').forEach(box => box.classList.remove('visible'));
  }

  function scheduleBboxHide(delay) {
    if (bboxHideTimer) clearTimeout(bboxHideTimer);
    bboxHideTimer = setTimeout(() => {
      hideBbox();
      bboxHideTimer = null;
    }, delay);
  }

  function updateBboxPositions() {
    const contentArea = document.getElementById('dt-content-area');
    const overlay = document.getElementById('dt-bbox-overlay');
    if (!contentArea || !overlay) return;

    Object.keys(sectionLabels).forEach(sectionId => {
      const el = scopedById(sectionId);
      const box = overlay.querySelector(`.dt-bbox[data-section="${sectionId}"]`);
      if (!el || !box) return;

      // Position relative to content area
      const contentRect = contentArea.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const top = elRect.top - contentRect.top + contentArea.scrollTop;
      const left = elRect.left - contentRect.left;
      const width = elRect.width;
      const height = elRect.height;

      box.style.top = `${top}px`;
      box.style.left = `${left}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    });
  }

  function ensureBboxOverlay() {
    const contentArea = document.getElementById('dt-content-area');
    if (!contentArea) return;
    if (document.getElementById('dt-bbox-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'dt-bbox-overlay';
    overlay.className = 'dt-bbox-overlay';

    Object.entries(sectionLabels).forEach(([sectionId, label]) => {
      const box = document.createElement('div');
      box.className = 'dt-bbox';
      box.dataset.section = sectionId;
      box.innerHTML = `<div class="dt-bbox-label">${label}</div>`;
      overlay.appendChild(box);
    });

    contentArea.appendChild(overlay);

    // Update positions on window resize
    window.addEventListener('resize', updateBboxPositions);
    updateBboxPositions();
  }

  // ─── Phase 2: Section Annotation Labels ──────────────────────────────────

  const sectionAnnotations = {
    'hero': '// hero_section.dart',
    'projects': '// projects_section.dart',
    'about': '// about_me.dart',
    'skills': '// skills_section.dart',
    'experience': '// experience_timeline.dart',
    'open-source': '// open_source_section.dart',
    'education': '// education_section.dart',
    'achievements': '// achievements_section.dart',
    'contact': '// contact_section.dart',
  };

  function injectAnnotations() {
    if (annotationsInjected) return;
    annotationsInjected = true;

    Object.entries(sectionAnnotations).forEach(([sectionId, label]) => {
      const el = scopedById(sectionId);
      if (!el) return;
      // Don't double-inject
      if (el.querySelector('.dt-section-label')) return;
      const labelEl = document.createElement('span');
      labelEl.className = 'dt-section-label';
      labelEl.textContent = label;
      el.insertBefore(labelEl, el.firstChild);
    });
  }

  function removeAnnotations() {
    document.querySelectorAll('.dt-section-label').forEach(el => el.remove());
    annotationsInjected = false;
  }

  // ─── Phase 2: Git Commit Badges ──────────────────────────────────────────

  // Commit badges are decorative fake git history for the DevMode illusion.
  // Messages reference real experience data via window.__portfolio.
  function buildCommitBadges() {
    const p = window.__portfolio || {};
    const exp = Object.values(p.experience || {})[0] || {};
    const company = exp.company || 'the company';
    const projectCount = p.projectCount || 0;
    return [
      { hash: 'a4f2c1d', message: `feat: first flutter production app` },
      { hash: '3b9e821', message: `fix: shipped ${projectCount} client apps on time` },
      { hash: 'f71c304', message: `feat: joined as flutter developer at ${company}` },
    ];
  }

  function injectCommitBadges() {
    if (badgesInjected) return;
    badgesInjected = true;

    const timeline = scopedQuery('#experience .timeline');
    if (!timeline) return;

    const badges = buildCommitBadges();
    const entries = timeline.querySelectorAll('.timeline-item, .experience-entry, .timeline-entry, [class*="experience"]');
    entries.forEach((entry, i) => {
      if (i >= badges.length) return;
      if (entry.querySelector('.dt-commit-badge')) return;
      const { hash, message } = badges[i];
      const badge = document.createElement('span');
      badge.className = 'dt-commit-badge';
      badge.innerHTML = `<span class="dt-commit-hash">commit ${hash}</span>  — ${message}`;
      entry.insertBefore(badge, entry.firstChild);
    });
  }

  function removeCommitBadges() {
    document.querySelectorAll('.dt-commit-badge').forEach(el => el.remove());
    badgesInjected = false;
  }

  // ─── Phase 2: Section Hover Listeners (reactive console logs) ────────────

  // sectionLogMap: counts are read lazily from window.__portfolio at fire time.
  function buildSectionLogMap() {
    return {
      'hero': () => addLog('debug', 'Hero widget entered hovered state. Rebuilding.'),
      'projects': () => {
        // Read count lazily — window.__portfolio is guaranteed set by now
        const count = (window.__portfolio || {}).projectCount
          // Fallback: count actual project card elements in the scoped DOM
          || scopedQueryAll('[id^="project-"]').length
          || 0;
        addLog('info', `ProjectsSection entered viewport. ListView rendering ${count} items.`);
      },
      'about': () => addLog('info', 'about_me.dart loaded. Static analysis: 0 errors, 0 warnings.'),
      'skills': () => addLog('debug', 'SkillsSection mounted. Rendering pill groups.'),
      'experience': () => {
        const count = (window.__portfolio || {}).experienceCount || 0;
        addLog('info', `ExperienceTimeline mounted. Entries: ${count}. Git log attached.`);
      },
      'open-source': () => {
        const count = (window.__portfolio || {}).osCount || 0;
        addLog('info', `OpenSourceSection mounted. Packages: ${count}.`);
      },
      'education': () => {
        const count = (window.__portfolio || {}).educationCount || 0;
        addLog('debug', `EducationSection mounted. Entries: ${count}.`);
      },
      'achievements': () => {
        const count = (window.__portfolio || {}).achievementCount || 0;
        addLog('debug', `AchievementsSection mounted. Count: ${count}.`);
      },
      'contact': () => addLog('info', 'ContactSection entered viewport.'),
    };
  }

  // Track which sections have already fired to avoid spam
  const sectionLogFired = {};

  function setupSectionListeners() {
    const sectionLogMap = buildSectionLogMap();
    Object.keys(sectionLogMap).forEach(sectionId => {
      const el = scopedById(sectionId);
      if (!el) return;

      const enter = () => {
        if (!isDevMode) return;
        // Show bounding box
        showBbox(sectionId);
        // Fire log once per section per session
        if (!sectionLogFired[sectionId]) {
          sectionLogFired[sectionId] = true;
          sectionLogMap[sectionId]();
        }
      };

      const leave = () => {
        if (!isDevMode) return;
        scheduleBboxHide(300);
      };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      sectionListeners.push({ el, enter, leave });
    });

    // Wire hire/contact button hover — target the email CTA specifically
    const hireBtn = scopedQuery('#contact a[href^="mailto"]');
    if (hireBtn) {
      const enter = () => {
        if (isDevMode) addLog('warning', 'HireButton() tapped. Initiating contact sequence...');
      };
      hireBtn.addEventListener('mouseenter', enter);
      sectionListeners.push({ el: hireBtn, enter, leave: () => { } });
    }
  }

  function teardownSectionListeners() {
    sectionListeners.forEach(({ el, enter, leave }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
    sectionListeners = [];
    // Reset fired flags for next session
    Object.keys(sectionLogFired).forEach(k => delete sectionLogFired[k]);
  }

  // ─── Phase 2: Project Card Hover (live properties) ───────────────────────

  // Build project card map from the actual DOM — counts real rendered cards,
  // not window.__portfolio which may not be set in all environments.
  function buildProjectCardNodeMap() {
    const map = {};
    // Prefer window.__portfolio count; fall back to counting scoped DOM elements
    const count = (window.__portfolio || {}).projectCount
      || scopedQueryAll('[id^="project-"]').length
      || 0;
    for (let i = 1; i <= count; i++) {
      map[`project-${i}`] = `project-${i}`;
    }
    return map;
  }

  let animProgressTimer = null;
  let animProgressValue = 0;

  function setupProjectCardListeners() {
    const projectCardNodeMap = buildProjectCardNodeMap();
    Object.entries(projectCardNodeMap).forEach(([cardId, nodeId]) => {
      const el = scopedById(cardId);
      if (!el) return;

      const enter = () => {
        if (!isDevMode) return;
        inspectedNodeId = nodeId;
        // Update isHovered in nodeProps
        const props = getNodeProps()[nodeId];
        if (props) {
          const hovProp = props.find(p => p.key === 'isHovered');
          if (hovProp) hovProp.value = 'true';
        }
        renderProperties();
        startAnimProgress(nodeId);
        // Log the real project name, not the DOM id
        const projData = (window.__portfolio || {}).projects || {};
        const projTitle = (projData[cardId] || {}).title || cardId;
        addLog('info', `Navigator: pushed route '/projects/${projTitle}'.`);
      };

      const leave = () => {
        if (!isDevMode) return;
        const props = getNodeProps()[nodeId];
        if (props) {
          const hovProp = props.find(p => p.key === 'isHovered');
          if (hovProp) hovProp.value = 'false';
          const animProp = props.find(p => p.key === 'animProgress');
          if (animProp) animProp.value = '0.0';
        }
        stopAnimProgress();
        renderProperties();
      };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      projectCardListeners.push({ el, enter, leave });
    });
  }

  function teardownProjectCardListeners() {
    projectCardListeners.forEach(({ el, enter, leave }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
    projectCardListeners = [];
    stopAnimProgress();
  }

  function startAnimProgress(nodeId) {
    stopAnimProgress();
    animProgressValue = 0.0;
    animProgressTimer = setInterval(() => {
      animProgressValue = Math.min(0.73, animProgressValue + 0.073);
      const props = getNodeProps()[nodeId];
      if (props) {
        const animProp = props.find(p => p.key === 'animProgress');
        if (animProp) animProp.value = animProgressValue.toFixed(2);
      }
      renderProperties();
      if (animProgressValue >= 0.73) stopAnimProgress();
    }, 30);
  }

  function stopAnimProgress() {
    if (animProgressTimer) { clearInterval(animProgressTimer); animProgressTimer = null; }
  }

  // ─── Phase 2: Link Click Listeners ───────────────────────────────────────

  function setupLinkListeners() {
    const p = window.__portfolio || {};
    // Extract username from github URL: "https://github.com/username" → "github.com/username"
    const githubDisplay = p.github ? p.github.replace('https://', '') : 'github.com';

    // GitHub links — scoped to dev mode content area
    scopedQueryAll('a[href*="github.com"]').forEach(el => {
      const click = () => {
        if (isDevMode) addLog('info', `Launching external URL: ${githubDisplay}`);
      };
      el.addEventListener('click', click);
      linkListeners.push({ el, click });
    });

    // Email links — scoped to dev mode content area
    scopedQueryAll('a[href^="mailto:"]').forEach(el => {
      const click = () => {
        if (isDevMode) addLog('info', 'mailto: triggered. Opening compose window...');
      };
      el.addEventListener('click', click);
      linkListeners.push({ el, click });
    });
  }

  function teardownLinkListeners() {
    linkListeners.forEach(({ el, click }) => el.removeEventListener('click', click));
    linkListeners = [];
  }

  // ─── Phase 3: Widget Tree Search ─────────────────────────────────────────

  let searchInputHandler = null;

  function setupTreeSearch() {
    const input = document.querySelector('.dt-tree-search');
    if (!input) return;

    // Clear any previous value
    input.value = '';
    searchQuery = '';

    searchInputHandler = () => {
      searchQuery = input.value.trim().toLowerCase();
      filterTree(searchQuery);
      // Show/hide clear button
      const clearBtn = document.querySelector('.dt-search-clear');
      if (clearBtn) clearBtn.classList.toggle('visible', searchQuery.length > 0);
    };
    input.addEventListener('input', searchInputHandler);

    // Clear button (×) — inject into search wrap if not already there
    const wrap = document.querySelector('.dt-tree-search-wrap');
    if (wrap && !wrap.querySelector('.dt-search-clear')) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'dt-search-clear';
      clearBtn.textContent = '×';
      clearBtn.title = 'Clear search';
      clearBtn.addEventListener('click', () => {
        input.value = '';
        searchQuery = '';
        filterTree('');
        clearBtn.classList.remove('visible');
        input.focus();
      });
      wrap.appendChild(clearBtn);
    }
  }

  function teardownTreeSearch() {
    const input = document.querySelector('.dt-tree-search');
    if (input && searchInputHandler) {
      input.removeEventListener('input', searchInputHandler);
      searchInputHandler = null;
      input.value = '';
    }
    // Remove clear button
    document.querySelectorAll('.dt-search-clear').forEach(el => el.remove());
    _preSearchExpandedIds.clear();
    filterTree(''); // restore all nodes
  }

  // Snapshot of which nodes are expanded before search overrides display
  let _preSearchExpandedIds = new Set();

  function filterTree(query) {
    const nodes = document.querySelectorAll('.tree-node[data-node]');

    if (!query) {
      // Restore accordion state from snapshot
      nodes.forEach(node => {
        const parentId = node.dataset.parent;
        if (!parentId) {
          // Root nodes always visible
          node.style.display = '';
        } else {
          // Show only if parent was expanded before search
          node.style.display = _preSearchExpandedIds.has(parentId) ? '' : 'none';
        }
        // Remove highlights — read textContent to strip any <mark> tags
        const nameEl = node.querySelector('.tree-node-name');
        if (nameEl) nameEl.innerHTML = escHtml(nameEl.textContent);
      });
      _preSearchExpandedIds.clear();
      return;
    }

    // On first character typed, snapshot current accordion state
    if (_preSearchExpandedIds.size === 0) {
      nodes.forEach(node => {
        const id = node.dataset.node;
        if (isNodeExpanded(id)) _preSearchExpandedIds.add(id);
      });
    }

    // Filter: show only nodes whose label/args match, plus their ancestors
    const matchingIds = new Set();
    const ancestorIds = new Set();

    nodes.forEach(node => {
      const label = (node.querySelector('.tree-node-name')?.textContent || '').toLowerCase();
      const args = (node.querySelector('.tree-node-args')?.textContent || '').toLowerCase();
      if (label.includes(query) || args.includes(query)) {
        matchingIds.add(node.dataset.node);
        // Walk up ancestors
        let parentId = node.dataset.parent;
        while (parentId) {
          ancestorIds.add(parentId);
          const parentNode = document.querySelector(`.tree-node[data-node="${parentId}"]`);
          parentId = parentNode ? parentNode.dataset.parent : null;
        }
      }
    });

    nodes.forEach(node => {
      const id = node.dataset.node;
      const isMatch = matchingIds.has(id);
      const isAncestor = ancestorIds.has(id);
      node.style.display = (isMatch || isAncestor) ? '' : 'none';

      // Highlight matching text in the name span
      const nameEl = node.querySelector('.tree-node-name');
      if (nameEl) {
        const original = nameEl.textContent;
        if (isMatch) {
          const idx = original.toLowerCase().indexOf(query);
          if (idx !== -1) {
            nameEl.innerHTML =
              escHtml(original.slice(0, idx)) +
              `<mark class="dt-search-highlight">${escHtml(original.slice(idx, idx + query.length))}</mark>` +
              escHtml(original.slice(idx + query.length));
          }
        } else {
          nameEl.innerHTML = escHtml(original);
        }
      }
    });
  }

  function isNodeExpanded(nodeId) {
    // A node is "expanded" if its children are visible
    const firstChild = document.querySelector(`.tree-node[data-parent="${nodeId}"]`);
    return firstChild ? firstChild.style.display !== 'none' : false;
  }

  // ─── Phase 3: Hot Reload Simulation ──────────────────────────────────────

  function handleHotReload() {
    hotReloadCount++;
    const ms = Math.floor(Math.random() * 300) + 150; // 150–450ms fake time

    addLog('info', `Performing hot reload... 🔥`);

    // Flash the content area with a yellow tint
    const contentArea = document.getElementById('dt-content-area');
    if (contentArea) {
      contentArea.classList.add('dt-hot-reload-flash');
      setTimeout(() => contentArea.classList.remove('dt-hot-reload-flash'), 400);
    }

    setTimeout(() => {
      if (isDevMode) {
        addLog('info', `Reloaded 1 of ${(window.__portfolio || {}).projectCount ? 800 + (window.__portfolio.projectCount * 8) : 847} libraries in ${ms}ms.`);
        addLog('debug', `Hot reload #${hotReloadCount} complete. UI updated.`);
      }
    }, ms + 100);
  }

  // ─── Phase 3: Keyboard Shortcuts Panel ───────────────────────────────────

  function handleHotRestart() {
    // Full white flash, clear logs, re-run initial sequence
    const shell = document.getElementById('devtools-shell');
    if (shell) {
      const flash = document.createElement('div');
      flash.className = 'dt-hot-restart-flash';
      shell.appendChild(flash);
      setTimeout(() => flash.remove(), 400);
    }
    clearLogs();
    addCommand('> R');
    const restartLogs = [
      [0,    'info',  'Performing hot restart...'],
      [300,  'info',  'Restarting application...'],
      [600,  'info',  'Initializing DevTools connection...'],
      [900,  'info',  `Portfolio initialised. Rendering 847 widgets...`],
      [1200, 'info',  'DevTools connected. Inspector active.'],
      [1500, 'info',  'Welcome back, visitor. All state reset.'],
    ];
    restartLogs.forEach(([delay, level, msg]) => {
      setTimeout(() => { if (isDevMode) addLog(level, msg); }, delay);
    });
    // Collapse all tree nodes
    document.querySelectorAll('.tree-node[data-parent]').forEach(n => n.style.display = 'none');
    document.querySelectorAll('.tree-node-toggle').forEach(t => { if (t.textContent === '▼') t.textContent = '▶'; });
    inspectedNodeId = null;
    renderProperties();
  }

  // ─── Phase 3: Keyboard Shortcuts Panel ───────────────────────────────────

  function toggleShortcutsPanel() {
    if (shortcutsVisible) {
      closeShortcutsPanel();
    } else {
      openShortcutsPanel();
    }
  }

  function openShortcutsPanel() {
    if (document.getElementById('dt-shortcuts-overlay')) return;
    shortcutsVisible = true;

    const shortcuts = [
      { key: 'q', desc: 'Exit DevTools' },
      { key: 'r', desc: 'Hot reload' },
      { key: '?', desc: 'Toggle this panel' },
      { key: 'f', desc: 'Focus widget search' },
      { key: 'c', desc: 'Clear console' },
      { key: '/', desc: 'Toggle console' },
      { key: 'Esc', desc: 'Close overlays' },
    ];

    const overlay = document.createElement('div');
    overlay.id = 'dt-shortcuts-overlay';
    overlay.className = 'dt-shortcuts-overlay';
    overlay.innerHTML = `
      <div class="dt-shortcuts-panel">
        <div class="dt-shortcuts-header">
          <span class="dt-shortcuts-title">Keyboard Shortcuts</span>
          <button class="dt-shortcuts-close" id="dt-shortcuts-close">×</button>
        </div>
        <div class="dt-shortcuts-list">
          ${shortcuts.map(s => `
            <div class="dt-shortcut-row">
              <kbd class="dt-shortcut-key">${escHtml(s.key)}</kbd>
              <span class="dt-shortcut-desc">${escHtml(s.desc)}</span>
            </div>
          `).join('')}
        </div>
        <div class="dt-shortcuts-footer">// Press ? or Esc to close</div>
      </div>
    `;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeShortcutsPanel();
    });

    document.getElementById('devtools-shell').appendChild(overlay);

    // Wire close button after DOM insertion
    const closeBtn = document.getElementById('dt-shortcuts-close');
    if (closeBtn) closeBtn.addEventListener('click', closeShortcutsPanel);

    addLog('debug', 'Keyboard shortcuts panel opened.');
  }

  function closeShortcutsPanel() {
    const overlay = document.getElementById('dt-shortcuts-overlay');
    if (overlay) overlay.remove();
    shortcutsVisible = false;
  }

  // ─── Phase 3: Time-Based Greeting ────────────────────────────────────────

  function showTimeBasedGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning! Portfolio ready for inspection.';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon! DevTools connected.';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening! Late night coding session?';
    } else {
      greeting = 'Burning the midnight oil? Portfolio ready.';
    }
    // Replace the last initial log with the time-based greeting
    setTimeout(() => {
      if (isDevMode) addLog('info', greeting);
    }, 2100); // fires after the 7 initial logs (last at 1800ms)
  }

  // ─── Mobile tab switching ─────────────────────────────────────────────────
  function setupMobileTabs() {
    document.querySelectorAll('.dt-mobile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeMobileTab = tab.dataset.zone;
        document.querySelectorAll('.dt-mobile-tab').forEach(t =>
          t.classList.toggle('active', t.dataset.zone === activeMobileTab));
        document.querySelectorAll('.dt-mobile-zone').forEach(z =>
          z.classList.toggle('active', z.dataset.zone === activeMobileTab));
      });
    });
  }

  // ─── Phase 4: Public API for devmode_eggs.js ─────────────────────────────
  // Exposed on window.__devmode so eggs.js can hook in without tight coupling.
  const _enterHooks = [];
  const _exitHooks  = [];

  window.__devmode = {
    addLog,
    addCommand,
    isDevMode:   () => isDevMode,
    exitDevMode: () => exitDevMode(),
    onEnter: (fn) => _enterHooks.push(fn),
    onExit:  (fn) => _exitHooks.push(fn),
    switchToMemory:  null,
    switchToNetwork: null,
    onPerfTabOpen:   null,
    onNodeClick:     null,
    isRecruiterMode: () => window.__devmode && window.__devmode._isRecruiterMode && window.__devmode._isRecruiterMode(),
    renderProperties: () => renderProperties(),
  };

  // ─── Wire up static HTML ──────────────────────────────────────────────────
  let _initDone = false;

  function init() {
    // Guard: only wire static shell elements once
    // (Phase 2 listeners are set up in completeTransition, not here)
    if (_initDone) return;

    // Debug pill click
    const pill = document.getElementById('debug-pill');
    if (!pill) return; // shell not in DOM yet
    _initDone = true;

    pill.addEventListener('click', enterDevMode);

    // Overlay skip button
    const skipBtn = document.getElementById('overlay-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', completeTransition);
    }

    // Tab bar tabs
    document.querySelectorAll('.dt-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.tab;
        if (id === 'inspector' || id === 'performance' || id === 'memory' || id === 'network') {
          switchTab(id);
        }
      });
    });

    // Console filter pills
    document.querySelectorAll('.dt-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        consoleFilter = pill.dataset.filter;
        document.querySelectorAll('.dt-filter-pill').forEach(p =>
          p.classList.toggle('active', p.dataset.filter === consoleFilter));
        renderConsole();
      });
    });

    // Console clear button
    const clearBtn = document.getElementById('dt-console-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearLogs);

    // Console collapse toggle
    const toggleBtn = document.getElementById('dt-console-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        consoleExpanded = !consoleExpanded;
        // Collapse the body wrapper, NOT the whole console (header stays visible)
        const bodyWrap = document.getElementById('dt-console-body-wrap');
        if (bodyWrap) bodyWrap.classList.toggle('collapsed', !consoleExpanded);
        toggleBtn.textContent = consoleExpanded ? '▼' : '▲';
      });
    }

    // Widget tree nodes
    document.querySelectorAll('.tree-node[data-node]').forEach(node => {
      const nodeId = node.dataset.node;
      const section = node.dataset.section || null;
      node.addEventListener('mouseenter', () => onNodeHover(nodeId));
      node.addEventListener('mouseleave', () => onNodeLeave());
      node.addEventListener('click', () => onNodeClick(nodeId, section));
    });

    // Mobile tabs
    if (isMobile()) setupMobileTabs();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-try init on DOM mutations (Jaspr pre-renders; shell may not be in DOM immediately)
  const mutObs = new MutationObserver(() => {
    if (!_initDone) init();
  });
  mutObs.observe(document.body, { childList: true, subtree: true });

})();
