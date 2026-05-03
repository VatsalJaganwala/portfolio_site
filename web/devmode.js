/**
 * DevMode — Flutter DevTools Easter Egg
 * All interactivity for the DevMode feature.
 */
(function () {
  'use strict';

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

    // Show overlay
    const overlay = document.getElementById('flutter-run-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Auto-complete after 4.3s
    setTimeout(completeTransition, 4300);
  }

  function completeTransition() {
    isTransitioning = false;
    isDevMode = true;

    // Hide overlay
    const overlay = document.getElementById('flutter-run-overlay');
    if (overlay) overlay.style.display = 'none';

    // Show shell
    const shell = document.getElementById('devtools-shell');
    if (shell) {
      shell.style.display = 'flex';
      shell.classList.remove('exiting');
    }

    // Mobile: always show exit button
    if (isMobile()) {
      showExitButton = true;
      renderExitButton();
    }

    // Schedule initial console logs
    scheduleInitialLogs();

    // Setup key listener
    setupKeyListener();

    // Setup idle detection
    setupIdleDetection();

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

      if (shell) shell.style.display = 'none';

      const pill = document.getElementById('debug-pill');
      if (pill) pill.style.display = '';

      clearLogs();
      removeKeyListener();
      clearIdleDetection();
    }, 350);
  }

  // ─── Key listener ─────────────────────────────────────────────────────────
  let keyHandler = null;

  function setupKeyListener() {
    keyHandler = function (e) {
      if (!isDevMode) return;
      if (e.key === 'q' || e.key === 'Q') {
        handleQKey();
      } else {
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
      addLog('debug', 'Press the Exit button or wait...');
    }, 150);
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
    const logs = [
      [0,    'info',    'Portfolio initialised. Rendering 847 widgets...'],
      [300,  'info',    'Theme: dark. Platform: web.'],
      [600,  'debug',   'Hot restart not available in production build.'],
      [900,  'info',    'DevTools connected. Inspector active.'],
      [1200, 'warning', 'setState() called 3 times during build. Consider optimising.'],
      [1500, 'debug',   'Scroll controller attached to SingleChildScrollView.'],
      [1800, 'info',    'Welcome, visitor. Portfolio ready for inspection.'],
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
    activeTab = tabId;
    document.querySelectorAll('.dt-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    const contentArea = document.getElementById('dt-content-area');
    const perfView = document.getElementById('dt-perf-view');

    if (tabId === 'performance') {
      if (contentArea) contentArea.style.display = 'none';
      if (perfView) {
        perfView.style.display = 'block';
        // Trigger bar animations
        setTimeout(() => {
          perfView.querySelectorAll('.dt-flame-fill').forEach(bar => {
            bar.style.width = bar.dataset.target || '0%';
          });
        }, 100);
      }
      addLog('debug', 'Collecting frame rendering data...');
      setTimeout(() => {
        if (isDevMode) addLog('warning', 'High coffee dependency detected. Performance may vary.');
      }, 800);
    } else {
      if (contentArea) contentArea.style.display = '';
      if (perfView) perfView.style.display = 'none';
    }
  }

  // ─── Widget tree node interaction ─────────────────────────────────────────
  function onNodeHover(nodeId) {
    inspectedNodeId = nodeId;
    renderProperties();
  }

  function onNodeClick(nodeId, section) {
    inspectedNodeId = nodeId;
    renderProperties();
    if (section) {
      const contentArea = document.getElementById('dt-content-area');
      const el = document.getElementById(section);
      if (el && contentArea) {
        // offsetTop walks up to the nearest positioned ancestor.
        // Since dt-content-area is position:relative, we accumulate
        // offsetTop through the chain until we hit it.
        let top = 0;
        let node = el;
        while (node && node !== contentArea) {
          top += node.offsetTop;
          node = node.offsetParent;
        }
        contentArea.scrollTo({ top: top - 16, behavior: 'smooth' });
      }
    }
    // Toggle expand/collapse for parent nodes
    const children = document.querySelectorAll(`[data-parent="${nodeId}"]`);
    if (children.length > 0) {
      const isExpanded = children[0].style.display !== 'none';
      children.forEach(c => c.style.display = isExpanded ? 'none' : '');
      const toggle = document.querySelector(`[data-node="${nodeId}"] .tree-node-toggle`);
      if (toggle) toggle.textContent = isExpanded ? '▶' : '▼';
    }
  }

  // --- Properties panel ---------------------------------------------------
  const nodeProps = {
    // Root
    'material-app':    [{ key: 'title', value: '"Vatsal Jaganwala"', type: '' }, { key: 'debugShowCheckedModeBanner', value: 'false', type: 'type-bool' }, { key: 'themeMode', value: 'ThemeMode.dark', type: 'type-enum' }, { key: 'locale', value: 'Locale("en", "IN")', type: 'type-ref' }],
    'scaffold':        [{ key: 'backgroundColor', value: 'Color(0xFF0D0D0D)', type: 'type-ref' }, { key: 'resizeToAvoidBottomInset', value: 'true', type: 'type-bool' }],
    'navbar':          [{ key: 'name', value: '"vatsal"', type: '' }, { key: 'email', value: '"vatsaljaganwala@gmail.com"', type: '' }, { key: 'position', value: 'fixed', type: 'type-enum' }, { key: 'height', value: '60.0', type: 'type-num' }],
    'body':            [{ key: 'scrollDirection', value: 'Axis.vertical', type: 'type-enum' }, { key: 'physics', value: 'BouncingScrollPhysics()', type: 'type-ref' }, { key: 'child', value: 'Column', type: 'type-ref' }],
    // Hero
    'hero':            [{ key: 'name', value: '"Vatsal Jaganwala"', type: '' }, { key: 'title', value: '"Flutter Developer"', type: '' }, { key: 'location', value: '"Surat, India"', type: '' }, { key: 'yearsXP', value: '2', type: 'type-num' }, { key: 'projectCount', value: '5', type: 'type-num' }, { key: 'osPackages', value: '2', type: 'type-num' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    'hero-cta-work':   [{ key: 'label', value: '"View my work \u2192"', type: '' }, { key: 'href', value: '"#projects"', type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }],
    'hero-cta-contact':[{ key: 'label', value: '"Contact \u2197"', type: '' }, { key: 'href', value: '"#contact"', type: '' }, { key: 'variant', value: 'ButtonVariant.ghost', type: 'type-enum' }],
    'hero-code-card':  [{ key: 'name', value: '"Vatsal Jaganwala"', type: '' }, { key: 'role', value: '"Flutter Developer"', type: '' }, { key: 'location', value: '"Surat, India"', type: '' }, { key: 'isAvailable', value: 'true', type: 'type-bool' }],
    // Projects
    'projects':        [{ key: 'itemCount', value: '5', type: 'type-num' }, { key: 'scrollDir', value: 'Axis.vertical', type: 'type-enum' }, { key: 'padding', value: 'EdgeInsets.all(24.0)', type: 'type-ref' }, { key: 'isVisible', value: 'true', type: 'type-live' }],
    'project-1':       [{ key: 'title', value: '"Business Management System for Retail Operations"', type: '' }, { key: 'platforms', value: '"[Web]"', type: '' }, { key: 'tech', value: '"Flutter, REST APIs"', type: '' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    'project-2':       [{ key: 'title', value: '"Rehabilitation Workflow Management Application"', type: '' }, { key: 'platforms', value: '"[Android, iOS, Web]"', type: '' }, { key: 'tech', value: '"Flutter, Geo-mapping, DWG"', type: '' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    'project-3':       [{ key: 'title', value: '"Parking Management and Allocation Platform"', type: '' }, { key: 'platforms', value: '"[Android, iOS, Web]"', type: '' }, { key: 'tech', value: '"Flutter, DWG, Algorithms"', type: '' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    'project-4':       [{ key: 'title', value: '"Residential Community Management Application"', type: '' }, { key: 'platforms', value: '"[Android, iOS]"', type: '' }, { key: 'tech', value: '"Flutter, Firebase"', type: '' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    'project-5':       [{ key: 'title', value: '"2D to 3D Architectural Visualization Platform"', type: '' }, { key: 'platforms', value: '"[Web]"', type: '' }, { key: 'tech', value: '"Flutter, 3D visualization, Geo-mapping"', type: '' }, { key: 'isHovered', value: 'false', type: 'type-live' }],
    // About
    'about':           [{ key: 'name', value: '"Vatsal Jaganwala"', type: '' }, { key: 'role', value: '"Associate Flutter Developer"', type: '' }, { key: 'company', value: '"Instance IT Solutions"', type: '' }, { key: 'location', value: '"Surat, India"', type: '' }, { key: 'since', value: '"08/2023"', type: '' }, { key: 'isAnimated', value: 'true', type: 'type-bool' }],
    'about-blockquote':[{ key: 'text', value: '"Associate Flutter Developer at Instance IT Solutions..."', type: '' }, { key: 'borderColor', value: 'Color(0xFF4ADE80)', type: 'type-ref' }],
    'about-code':      [{ key: 'firstName', value: '"vatsal"', type: '' }, { key: 'yearsXP', value: '2', type: 'type-num' }, { key: 'isAvailable', value: 'true', type: 'type-bool' }],
    'about-status':    [{ key: 'available', value: 'true', type: 'type-bool' }, { key: 'label', value: '"Available for new opportunities"', type: '' }, { key: 'dotColor', value: 'Color(0xFF4ADE80)', type: 'type-ref' }],
    // Skills
    'skills':          [{ key: 'techCount', value: '8', type: 'type-num' }, { key: 'softCount', value: '4', type: 'type-num' }, { key: 'langCount', value: '3', type: 'type-num' }],
    'skills-tech':     [{ key: 'group', value: '"technical_skills"', type: '' }, { key: 'count', value: '8', type: 'type-num' }, { key: 'items', value: '"Flutter, Dart, GetX, Firebase, REST APIs, Cross-platform, OOP, Git"', type: '' }],
    'skills-soft':     [{ key: 'group', value: '"soft_skills"', type: '' }, { key: 'count', value: '4', type: 'type-num' }, { key: 'items', value: '"Problem-solving, Team collaboration, Analytical thinking, Agile"', type: '' }],
    'skills-lang':     [{ key: 'group', value: '"languages"', type: '' }, { key: 'count', value: '3', type: 'type-num' }, { key: 'items', value: '"English, Hindi, Gujarati"', type: '' }],
    // Experience
    'experience':      [{ key: 'entryCount', value: '1', type: 'type-num' }, { key: 'layout', value: '"vertical timeline"', type: '' }],
    'exp-entry-1':     [{ key: 'jobTitle', value: '"Associate Flutter Developer"', type: '' }, { key: 'company', value: '"Instance IT Solutions"', type: '' }, { key: 'location', value: '"Surat, India"', type: '' }, { key: 'startDate', value: '"08/2023"', type: '' }, { key: 'endDate', value: '"Present"', type: '' }, { key: 'responsibilities', value: '6', type: 'type-num' }],
    'exp-cta':         [{ key: 'label', value: '"Open to new opportunities"', type: '' }, { key: 'href', value: '"mailto:vatsaljaganwala@gmail.com"', type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }],
    // Open Source
    'open-source':     [{ key: 'packages', value: '2', type: 'type-num' }, { key: 'layout', value: '"two-column grid"', type: '' }],
    'os-smartpub':     [{ key: 'name', value: '"smartpub"', type: '' }, { key: 'role', value: '"Creator / Maintainer"', type: '' }, { key: 'tech', value: '"Dart, Flutter, CLI, YAML parsing"', type: '' }, { key: 'features', value: '5', type: 'type-num' }],
    'os-logger':       [{ key: 'name', value: '"flutter_logger_pro"', type: '' }, { key: 'role', value: '"Creator / Maintainer"', type: '' }, { key: 'tech', value: '"Dart, Flutter, Logging systems, JSON"', type: '' }, { key: 'features', value: '5', type: 'type-num' }],
    // Education
    'education':       [{ key: 'entryCount', value: '3', type: 'type-num' }, { key: 'layout', value: '"list"', type: '' }],
    'edu-1':           [{ key: 'degree', value: '"B.E. in Information Technology"', type: '' }, { key: 'institution', value: '"SVIT, Vasad, Anand"', type: '' }, { key: 'duration', value: '"08/2020 - 08/2024"', type: '' }, { key: 'cgpa', value: '"8.23"', type: '' }],
    'edu-2':           [{ key: 'degree', value: '"Higher Secondary Education (PCM)"', type: '' }, { key: 'institution', value: '"Riverdale Academy, Surat"', type: '' }, { key: 'endDate', value: '"03/2020"', type: '' }],
    'edu-3':           [{ key: 'degree', value: '"Secondary School Education"', type: '' }, { key: 'institution', value: '"S. D. R. Umrigar School, Surat"', type: '' }, { key: 'endDate', value: '"03/2018"', type: '' }],
    // Achievements
    'achievements':    [{ key: 'count', value: '2', type: 'type-num' }, { key: 'layout', value: '"two-column grid"', type: '' }],
    'ach-1':           [{ key: 'title', value: '"Silent Achiever Award"', type: '' }, { key: 'organization', value: '"Instance IT Solutions"', type: '' }, { key: 'date', value: '"01/04/2025"', type: '' }],
    'ach-2':           [{ key: 'title', value: '"On The Spot Award"', type: '' }, { key: 'organization', value: '"Instance IT Solutions"', type: '' }, { key: 'date', value: '"01/05/2024"', type: '' }],
    // Contact
    'contact':         [{ key: 'email', value: '"vatsaljaganwala@gmail.com"', type: '' }, { key: 'phone', value: '"+917041355506"', type: '' }, { key: 'linkedin', value: '"linkedin.com/vatsaljaganwala"', type: '' }, { key: 'github', value: '"github.com/vatsaljaganwala"', type: '' }, { key: 'hiringSignal', value: 'true', type: 'type-live' }],
    'contact-email':   [{ key: 'label', value: '"Send an email"', type: '' }, { key: 'href', value: '"mailto:vatsaljaganwala@gmail.com"', type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }],
    'contact-linkedin':[{ key: 'label', value: '"LinkedIn"', type: '' }, { key: 'href', value: '"https://linkedin.com/vatsaljaganwala"', type: '' }, { key: 'variant', value: 'ButtonVariant.primary', type: 'type-enum' }],
    'contact-github':  [{ key: 'label', value: '"GitHub"', type: '' }, { key: 'href', value: '"https://github.com/vatsaljaganwala"', type: '' }, { key: 'variant', value: 'ButtonVariant.ghost', type: 'type-enum' }],
    'contact-footer':  [{ key: 'builtWith', value: '"Jaspr"', type: '' }, { key: 'year', value: '2025', type: 'type-num' }],
    // FAB
    'fab':             [{ key: 'elevation', value: '6.0', type: 'type-num' }, { key: 'tooltip', value: '"Hire me"', type: '' }, { key: 'onPressed', value: 'HireCallback', type: 'type-ref' }],
  };
  function renderProperties() {
    const container = document.getElementById('dt-props-inspected');
    if (!container) return;

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

  // ─── Wire up static HTML ──────────────────────────────────────────────────
  function init() {
    // Debug pill click
    const pill = document.getElementById('debug-pill');
    if (pill) {
      pill.addEventListener('click', enterDevMode);
    }

    // Overlay skip button
    const skipBtn = document.getElementById('overlay-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', completeTransition);
    }

    // Tab bar tabs
    document.querySelectorAll('.dt-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.tab;
        if (id === 'inspector' || id === 'performance') switchTab(id);
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
        const console = document.getElementById('dt-console');
        if (console) console.classList.toggle('collapsed', !consoleExpanded);
        toggleBtn.textContent = consoleExpanded ? '▼' : '▲';
      });
    }

    // Widget tree nodes
    document.querySelectorAll('.tree-node[data-node]').forEach(node => {
      const nodeId = node.dataset.node;
      const section = node.dataset.section || null;
      node.addEventListener('mouseenter', () => onNodeHover(nodeId));
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

  // Re-init on DOM mutations (Jaspr may update the DOM)
  const mutObs = new MutationObserver(() => init());
  mutObs.observe(document.body, { childList: true, subtree: false });

})();
