/**
 * devmode_eggs.js — Phase 4 Easter Eggs
 *
 * Loaded after devmode.js. Hooks into the existing DevMode shell via
 * window.__devmode (exposed by devmode.js) and the console input field.
 *
 * Architecture:
 *  - All CLI eggs flow through handleConsoleCommand()
 *  - Toggle eggs are wired to .dt-toggle-btn elements
 *  - Keyboard eggs (Konami) listen on document
 *  - Egg counter badge tracks found eggs
 *  - All state lives in easterEggState
 */
(function () {
  'use strict';

  // ─── Shared helpers (re-exposed by devmode.js via window.__devmode) ───────
  // We poll until devmode.js has initialised and exposed its API.
  function waitForDevmode(cb) {
    if (window.__devmode) { cb(window.__devmode); return; }
    const t = setInterval(() => {
      if (window.__devmode) { clearInterval(t); cb(window.__devmode); }
    }, 50);
  }

  // ─── Global error boundary ────────────────────────────────────────────────
  // Catches any uncaught egg error and logs it to the DevTools console
  // instead of crashing the page. Errors in staggered setTimeout callbacks
  // are caught here too.
  window.addEventListener('error', (e) => {
    const dm = window.__devmode;
    if (!dm || !dm.isDevMode()) return;
    // Only intercept errors from this file
    if (e.filename && !e.filename.includes('devmode_eggs')) return;
    dm.addLog('error', `[EggError] ${e.message} (${e.filename}:${e.lineno})`);
    e.preventDefault(); // prevent page crash
  });

  // ─── Easter egg state ─────────────────────────────────────────────────────
  const easterEggState = {
    foundEggs: new Set(),
    totalEggs: 15,
    repaintRainbow: false,
    slowAnimations: false,
    debugBanner: true,   // ON by default when DevMode opens
    themeIndex: 0,
    konamiProgress: 0,
    flutterLogoClicks: 0,
    flutterLogoTimer: null,
    vimMode: false,
    recruiterMode: false,
    tabCycleIndex: -1,
    fakeVisitorTimer: null,
    fakeVisitorCount: 1247,
    activeVisitors: 2,
    rebuildCount: 0,
    rebuildHandler: null,
    nullCrashActive: false,
    tailActive: false,
    tailTimer: null,
    jankTimer: null,
    memLeakTimer: null,
    smartpubData: null,
    commandHistory: [],
    commandHistoryIndex: -1,
  };

  const ALL_EGGS = [
    'flutter-doctor', 'flutter-clean', 'flutter-pub-get',
    'flutter-build-web', 'flutter-test', 'flutter-analyze',
    'git-log', 'hire-sh', 'null-crash', 'konami',
    'repaint-rainbow', 'slow-animations', 'network-tab',
    'stackoverflow', 'state-wars',
  ];

  // ─── Egg counter ──────────────────────────────────────────────────────────
  function markEggFound(id) {
    if (!ALL_EGGS.includes(id)) return;
    if (easterEggState.foundEggs.has(id)) return;
    easterEggState.foundEggs.add(id);
    updateEggBadge();
    if (easterEggState.foundEggs.size === easterEggState.totalEggs) {
      onAllEggsFound();
    }
  }

  function updateEggBadge() {
    const badge = document.getElementById('dt-egg-counter');
    if (!badge) return;
    const n = easterEggState.foundEggs.size;
    badge.textContent = `🥚 ${n}/${easterEggState.totalEggs} found`;
    badge.classList.toggle('has-found', n > 0);
  }

  function onAllEggsFound() {
    const dm = window.__devmode;
    if (!dm) return;
    setTimeout(() => dm.addLog('info', '🥚 All 15 easter eggs found!'), 0);
    setTimeout(() => dm.addLog('info', 'You are a Flutter detective. Impressive.'), 400);
    setTimeout(() => dm.addLog('info', 'Unlocking: hire.sh auto-execute in 3... 2... 1...'), 800);
    setTimeout(() => eggHireSh(dm), 1800);
  }

  // ─── Staggered log helper ─────────────────────────────────────────────────
  function staggerLogs(dm, lines, baseDelay, interval) {
    lines.forEach((line, i) => {
      setTimeout(() => {
        if (!dm.isDevMode()) return;
        if (Array.isArray(line)) {
          dm.addLog(line[0], line[1]);
        } else {
          dm.addLog('info', line);
        }
      }, baseDelay + i * interval);
    });
  }

  // ─── Confetti ─────────────────────────────────────────────────────────────
  function fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#61AFEF', '#C678DD', '#98C379', '#E5C07B', '#E06C75'],
      });
    }
  }

  // ─── Console input renderer ───────────────────────────────────────────────
  // Injects the console input row into #dt-console-footer if not already there.
  function ensureConsoleInput(dm) {
    if (document.getElementById('dt-console-input')) return;
    const footer = document.getElementById('dt-console-footer');
    if (!footer) return;

    const row = document.createElement('div');
    row.className = 'dt-console-input-row';
    row.innerHTML = `
      <span class="dt-console-prompt">&gt;</span>
      <input id="dt-console-input" class="dt-console-input"
             type="text" placeholder="Type a command... (try 'help')"
             autocomplete="off" spellcheck="false" />
    `;
    footer.appendChild(row);

    const input = document.getElementById('dt-console-input');
    input.addEventListener('keydown', (e) => onConsoleKeydown(e, dm));
  }

  function onConsoleKeydown(e, dm) {
    const input = e.target;

    if (e.key === 'Enter') {
      const raw = input.value.trim();
      hideSuggestions();
      if (!raw) return;
      input.value = '';
      easterEggState.tabCycleIndex = -1;
      handleConsoleCommand(raw, dm);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (easterEggState.commandHistory.length > 0) {
        if (easterEggState.commandHistoryIndex > 0) {
          easterEggState.commandHistoryIndex--;
        }
        input.value = easterEggState.commandHistory[easterEggState.commandHistoryIndex];
        // Move cursor to end of input text
        setTimeout(() => { input.selectionStart = input.selectionEnd = input.value.length; }, 0);
        showSuggestions(input.value, dm);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (easterEggState.commandHistory.length > 0) {
        if (easterEggState.commandHistoryIndex < easterEggState.commandHistory.length - 1) {
          easterEggState.commandHistoryIndex++;
          input.value = easterEggState.commandHistory[easterEggState.commandHistoryIndex];
        } else if (easterEggState.commandHistoryIndex === easterEggState.commandHistory.length - 1) {
          easterEggState.commandHistoryIndex = easterEggState.commandHistory.length;
          input.value = '';
        }
        showSuggestions(input.value, dm);
      }
      return;
    }

    if (e.key === 'Escape') {
      hideSuggestions();
      input.blur();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      // If panel is open and something is highlighted, confirm it
      if (_suggestionIndex >= 0 && _suggestionItems[_suggestionIndex]) {
        input.value = _suggestionItems[_suggestionIndex];
        hideSuggestions();
      } else {
        // Legacy cycle autocomplete
        const val = input.value;
        const matches = ALL_COMMANDS.filter(c => c.startsWith(val));
        if (matches.length === 1) {
          input.value = matches[0];
          easterEggState.tabCycleIndex = -1;
          showSuggestions(matches[0], dm);
        } else if (matches.length > 1) {
          const idx = (easterEggState.tabCycleIndex + 1) % matches.length;
          input.value = matches[idx];
          easterEggState.tabCycleIndex = idx;
          showSuggestions(matches[idx], dm);
        }
      }
    }
  }

  // ─── Tab autocomplete (EGG-86) ────────────────────────────────────────────
  const ALL_COMMANDS = [
    'flutter doctor', 'flutter clean', 'flutter pub get', 'flutter build web',
    'flutter analyze', 'flutter test', 'flutter run --release', 'flutter upgrade',
    'flutter pub outdated', 'flutter create',
    'dart --version', 'git log', './hire.sh', 'null', 'stackoverflow',
    'discord', 'theme', 'dwg', 'pub upgrade --major-versions', 'changelog',
    'recruiter', 'recruter', 'vim', 'di', 'help', 'audit', 'tail', 'liveshare',
    'observatory', 'flutter build web --analyze-size',
    'state wars', 'dart challenge',
    'shaders', 'hire vatsal',
  ];

  // Short descriptions shown in the suggestion panel
  const COMMAND_DESCRIPTIONS = {
    'flutter doctor':                   'Run health check',
    'flutter clean':                    'Free 847mb of self-doubt',
    'flutter pub get':                  'Resolve dependencies',
    'flutter build web':                'Build and deploy with confetti',
    'flutter analyze':                  'Lint the portfolio',
    'flutter test':                     'Run test suite',
    'flutter run --release':            'Exit to clean portfolio',
    'flutter upgrade':                  'Upgrade Flutter version',
    'flutter pub outdated':             'Check outdated packages',
    'flutter create':                   'Create hire_vatsal project',
    'flutter build web --analyze-size': 'Analyse bundle size',
    'dart --version':                   'Show Dart SDK info',
    'git log':                          'View career as commits',
    './hire.sh':                        '🚀 Execute hire script',
    'null':                             'Trigger null safety crash',
    'stackoverflow':                    'Search top questions',
    'discord':                          'Open Discord chat log',
    'theme':                            'Cycle colour themes (4 total)',
    'dwg':                              'Parse DWG floor plan',
    'pub upgrade --major-versions':     'Simulate version conflict',
    'changelog':                        'View career CHANGELOG.md',
    'recruiter':                        'Toggle recruiter-friendly view',
    'recruter':                         'Toggle recruiter-friendly view',
    'vim':                              'Open vim (good luck exiting)',
    'di':                               'Show dependency injection graph',
    'help':                             'Show all commands',
    'audit':                            'Run accessibility audit',
    'tail':                             'Tail live flutter run output',
    'liveshare':                        'Start VS Code Live Share',
    'observatory':                      'Open Dart Observatory',
    'state wars':                       'Open the State Management Wars modal',
    'dart challenge':                   '🎯 Interactive Dart quiz (3 questions)',
    'shaders':                          '⚡ Warm up GPU shaders',
    'hire vatsal':                      '🚀 The ultimate command',
  };

  function autocompleteInput(input) {
    const val = input.value;
    if (!val) return;
    const matches = ALL_COMMANDS.filter(c => c.startsWith(val));
    if (matches.length === 0) return;
    if (matches.length === 1) {
      input.value = matches[0];
      easterEggState.tabCycleIndex = -1;
    } else {
      const idx = (easterEggState.tabCycleIndex + 1) % matches.length;
      input.value = matches[idx];
      easterEggState.tabCycleIndex = idx;
    }
  }

  // ─── Command suggestion panel ─────────────────────────────────────────────
  let _suggestionPanel = null;
  let _suggestionIndex = -1;
  let _suggestionItems = [];

  function createSuggestionPanel(dm) {
    if (_suggestionPanel) return;
    _suggestionPanel = document.createElement('div');
    _suggestionPanel.id = 'dt-cmd-suggestions';
    _suggestionPanel.className = 'dt-cmd-suggestions';
    // Append to #dt-console (the outer wrapper) — NOT #dt-console-body-wrap
    // which has overflow:hidden for the collapse animation and would clip us.
    const console = document.getElementById('dt-console');
    if (console) console.appendChild(_suggestionPanel);
  }

  function showSuggestions(query, dm) {
    if (!_suggestionPanel) createSuggestionPanel(dm);
    if (!_suggestionPanel) return;

    const q = query.trim().toLowerCase();
    const matches = q
      ? ALL_COMMANDS.filter(c => c.includes(q))
      : ALL_COMMANDS;

    if (matches.length === 0) {
      hideSuggestions();
      return;
    }

    _suggestionItems = matches;
    _suggestionIndex = -1;

    _suggestionPanel.innerHTML = matches.map((cmd, i) => {
      const desc = COMMAND_DESCRIPTIONS[cmd] || '';
      // Highlight the matching portion
      let label = cmd;
      if (q) {
        const idx = cmd.toLowerCase().indexOf(q);
        if (idx !== -1) {
          label = cmd.slice(0, idx)
            + `<mark class="dt-cmd-match">${cmd.slice(idx, idx + q.length)}</mark>`
            + cmd.slice(idx + q.length);
        }
      }
      return `<div class="dt-cmd-item" data-index="${i}" data-cmd="${escAttr(cmd)}">
        <span class="dt-cmd-item-name">${label}</span>
        <span class="dt-cmd-item-desc">${escAttr(desc)}</span>
      </div>`;
    }).join('');

    _suggestionPanel.style.display = 'block';

    // Wire click handlers
    _suggestionPanel.querySelectorAll('.dt-cmd-item').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault(); // prevent input blur before we fill it
        const cmd = el.dataset.cmd;
        const input = document.getElementById('dt-console-input');
        if (input) {
          input.value = '';
          input.focus();
        }
        hideSuggestions();
        handleConsoleCommand(cmd, dm);
      });
    });
  }

  function hideSuggestions() {
    if (_suggestionPanel) _suggestionPanel.style.display = 'none';
    _suggestionIndex = -1;
    _suggestionItems = [];
  }

  function navigateSuggestions(direction) {
    if (!_suggestionPanel || _suggestionPanel.style.display === 'none') return false;
    const items = _suggestionPanel.querySelectorAll('.dt-cmd-item');
    if (items.length === 0) return false;

    // Remove current highlight
    if (_suggestionIndex >= 0 && items[_suggestionIndex]) {
      items[_suggestionIndex].classList.remove('active');
    }

    _suggestionIndex += direction;
    if (_suggestionIndex < 0) _suggestionIndex = items.length - 1;
    if (_suggestionIndex >= items.length) _suggestionIndex = 0;

    items[_suggestionIndex].classList.add('active');
    items[_suggestionIndex].scrollIntoView({ block: 'nearest' });

    // Fill input with highlighted command
    const input = document.getElementById('dt-console-input');
    if (input) input.value = _suggestionItems[_suggestionIndex];
    return true;
  }

  function escAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ─── Console command router ───────────────────────────────────────────────
  function handleConsoleCommand(raw, dm) {
    const cmd = raw.trim().toLowerCase();
    dm.addCommand(`> ${raw}`);

    // Save to history (avoid duplicates of consecutive commands)
    if (raw && (easterEggState.commandHistory.length === 0 || easterEggState.commandHistory[easterEggState.commandHistory.length - 1] !== raw)) {
      easterEggState.commandHistory.push(raw);
    }
    easterEggState.commandHistoryIndex = easterEggState.commandHistory.length;

    // Vim mode intercept
    if (easterEggState.vimMode) {
      handleVimInput(cmd, dm); return;
    }

    // Dart challenge answer intercept
    if (_dartQuizState.active) {
      if (handleDartAnswer(raw, dm)) return;
    }

    const commands = {
      'flutter doctor':                   () => eggFlutterDoctor(dm),
      'flutter clean':                    () => eggFlutterClean(dm),
      'flutter pub get':                  () => eggPubGet(dm),
      'flutter build web':                () => eggBuildWeb(dm),
      'flutter upgrade':                  () => eggUpgrade(dm),
      'flutter analyze':                  () => eggAnalyze(dm),
      'flutter test':                     () => eggTest(dm),
      'flutter run --release':            () => eggRunRelease(dm),
      'flutter pub outdated':             () => eggPubOutdated(dm),
      'flutter create':                   () => eggFlutterCreate(dm),
      'flutter build web --analyze-size': () => eggBundleSize(dm),
      'help':                             () => eggHelp(dm),
      'dart --version':                   () => eggDartVersion(dm),
      'git log':                          () => eggGitLog(dm),
      './hire.sh':                        () => eggHireSh(dm),
      'null':                             () => eggNullCrash(dm),
      'stackoverflow':                    () => eggStackOverflow(dm),
      'discord':                          () => eggDiscord(dm),
      'theme':                            () => eggTheme(dm),
      'dwg':                              () => eggDwg(dm),
      'pub upgrade --major-versions':     () => eggVersionConflict(dm),
      'changelog':                        () => eggChangelog(dm),
      'recruiter':                        () => eggRecruiterMode(dm),
      'recruter':                         () => eggRecruiterMode(dm),
      'vim':                              () => eggVimMode(dm),
      'di':                               () => eggDiVisualiser(dm),
      'audit':                            () => eggAudit(dm),
      'tail':                             () => eggTail(dm),
      'liveshare':                        () => eggLiveShare(dm),
      'observatory':                      () => eggObservatory(dm),
      'state wars':                       () => eggStateWars(dm),
      'dart challenge':                   () => eggDartChallenge(dm),
      'shaders':                          () => eggShaderWarmup(dm),
      'hire vatsal':                      () => eggHireVatsal(dm),
    };

    const handler = commands[cmd];
    if (handler) {
      try {
        handler();
      } catch (err) {
        dm.addLog('error', `[EggError] ${cmd}: ${err.message}`);
      }
      markEggFound(cmd.replace(/ /g, '-').replace(/\./g, '').replace(/--/g, '-').replace(/\//g, ''));
    } else {
      eggNotFound(raw, dm);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 1 — Flutter CLI Commands
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-01 — flutter doctor
  function eggFlutterDoctor(dm) {
    const lines = [
      ['info', 'Doctor summary (to see all details, run flutter doctor -v):'],
      ['info', '[✓] Flutter (Channel stable, 3.24.0, on Windows 11)'],
      ['info', '[✓] Windows Version (Installed version of Windows is version 10 or higher)'],
      ['info', '[✓] Chrome - develop for the web (Chrome 124.0)'],
      ['info', '[✓] VS Code (version 1.89.0)'],
      ['info', '[✓] Connected device (2 available)'],
      ['error', '[!] Your hesitation to hire Vatsal (run ./hire.sh to fix)'],
      ['warning', '! Doctor found issues in 1 category.'],
    ];
    staggerLogs(dm, lines, 0, 120);
    markEggFound('flutter-doctor');
  }

  // EGG-02 — flutter clean
  function eggFlutterClean(dm) {
    const lines = [
      ['info', 'Deleting .dart_tool...                    Done'],
      ['info', 'Deleting build/web...                     Done'],
      ['info', 'Deleting .flutter-plugins...              Done'],
      ['info', 'Deleting pubspec.lock...                  Done'],
      ['info', 'Deleting cached_regrets/...               Done'],
      ['info', 'Deleting impostor_syndrome.lock...        Done'],
      ['info', ''],
      ['info', '847mb freed.'],
    ];
    staggerLogs(dm, lines, 0, 100);
    // Flash content area white — always clean up the class
    setTimeout(() => {
      const ca = document.getElementById('dt-content-area');
      if (ca) {
        ca.classList.add('dt-clean-flash');
        setTimeout(() => ca.classList.remove('dt-clean-flash'), 600);
      }
    }, 400);
    markEggFound('flutter-clean');
  }

  // EGG-03 — flutter pub get
  function eggPubGet(dm) {
    const lines = [
      ['info', 'Resolving dependencies...'],
      ['info', '+ flutter_bloc 8.1.3'],
      ['info', '+ riverpod 2.4.9'],
      ['info', '+ go_router 13.2.0'],
      ['info', '+ freezed_annotation 2.4.1'],
      ['info', '+ injectable 2.3.2'],
      ['info', '+ dio 5.4.0'],
      ['info', '+ hive_flutter 1.1.0'],
      ['info', '+ cached_network_image 3.3.0'],
      ['error', '- self_doubt 0.0.1 (not found — removing)'],
      ['info', ''],
      ['info', 'Changed 12 dependencies!'],
    ];
    staggerLogs(dm, lines, 0, 120);
    markEggFound('flutter-pub-get');
  }

  // EGG-04 — flutter build web
  function eggBuildWeb(dm) {
    const lines = [
      ['info', 'Compiling lib/main.dart for the Web...'],
      ['info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%'],
      ['info', ''],
      ['info', 'Font tree shaken: 847 glyphs → 312 glyphs'],
      ['info', 'JS minified: portfolio.dart.js (2.4MB → 847KB)'],
      ['info', '✓  Built build/web in 23.4s'],
      ['info', 'Deploying personality...'],
    ];
    staggerLogs(dm, lines, 0, 200);
    setTimeout(() => { if (dm.isDevMode()) fireConfetti(); }, 1600);
    markEggFound('flutter-build-web');
  }

  // EGG-05 — flutter upgrade
  function eggUpgrade(dm) {
    const lines = [
      ['info', 'Checking Flutter updates...'],
      ['info', 'Downloading Flutter 3.24.0...  ████████████ 100%'],
      ['info', ''],
      ['info', 'Flutter 3.19.0 → 3.24.0'],
      ['info', 'Dart 3.3.0 → 3.5.0'],
      ['info', ''],
      ['info', 'Changes in 3.24.0:'],
      ['info', '  • Impeller rendering on web (no more jank)'],
      ['info', '  • Material 3 fully stable'],
      ['info', '  • DevTools 2.34.0 (you are here)'],
      ['info', '  • Null safety complaints reduced by 94%'],
    ];
    staggerLogs(dm, lines, 0, 150);
  }

  // EGG-06 — flutter analyze
  function eggAnalyze(dm) {
    const lines = [
      ['info', 'Analyzing portfolio...'],
      ['info', ''],
      ['info', '   info • lib/about_me.dart:12 • avoid_underpricing_yourself'],
      ['info', '   info • lib/contact.dart:3 • prefer_hire_over_ghosting'],
      ['info', ''],
      ['info', '0 errors, 0 warnings, 2 hints.'],
      ['info', 'Hint: Call hire() to resolve all hints.'],
    ];
    staggerLogs(dm, lines, 0, 150);
    markEggFound('flutter-analyze');
  }

  // EGG-07 — flutter test
  function eggTest(dm) {
    const lines = [
      ['info', '00:01 +0: loading test/widget_test.dart'],
      ['info', '00:02 +1: Hero widget renders correctly ✓'],
      ['info', '00:03 +2: ProjectCard displays title ✓'],
      ['info', '00:04 +3: HireButton fires callback ✓'],
      ['info', '00:05 +4: SkillsSection has no null values ✓'],
      ['info', '00:06 +5: ContactSection awaits Future<Job> ✓'],
      ['info', ''],
      ['info', 'All tests passed! (5 tests, 0 failures, 100% coverage)'],
    ];
    staggerLogs(dm, lines, 0, 200);
    markEggFound('flutter-test');
  }

  // EGG-08 — flutter run --release
  function eggRunRelease(dm) {
    const lines = [
      ['info', 'Building release build...'],
      ['info', 'Stripping debug symbols...'],
      ['info', 'Removing DevTools chrome...'],
      ['info', '✓  Launching in release mode.'],
    ];
    staggerLogs(dm, lines, 0, 300);
    setTimeout(() => { if (dm.isDevMode()) dm.exitDevMode(); }, 1500);
  }

  // EGG-09 — help
  function eggHelp(dm) {
    const table = [
      'Available commands:',
      '──────────────────────────────────────────────────',
      '  flutter doctor          Run health check',
      '  flutter clean           Free 847mb of self-doubt',
      '  flutter pub get         Resolve dependencies',
      '  flutter build web       Build and deploy',
      '  flutter analyze         Lint the portfolio',
      '  flutter test            Run test suite',
      '  flutter run --release   Exit to clean portfolio',
      '  flutter upgrade         Upgrade Flutter version',
      '  flutter pub outdated    Check outdated packages',
      '  dart --version          Show Dart SDK info',
      '  git log                 View career as commits',
      '  ./hire.sh               Execute hire script',
      '  null                    Trigger null safety demo',
      '  stackoverflow           Search top questions',
      '  discord                 Open Discord log',
      '  theme                   Cycle colour themes',
      '  dwg                     Parse DWG file',
      '  recruiter               Toggle recruiter mode',
      '  vim                     Open vim (good luck)',
      '  di                      Show DI graph',
      '  audit                   Run accessibility audit',
      '  tail                    Tail flutter run output',
      '  changelog               View career changelog',
      '  r                       Hot reload',
      '  R                       Hot restart',
      '  konami / ↑↑↓↓←→←→BA    God mode',
      '──────────────────────────────────────────────────',
      'Tip: Press Tab to autocomplete. Try typing anything.',
    ];
    table.forEach((line, i) => {
      setTimeout(() => { if (dm.isDevMode()) dm.addLog('info', line); }, i * 30);
    });
  }

  // EGG-10 — dart --version
  function eggDartVersion(dm) {
    staggerLogs(dm, [
      ['info', 'Dart SDK version: 3.5.0 (stable) (Fri Sep 6 18:27:00 2024 +0000)'],
      ['info', '  Null safety: ✓ (no more ! operators used in anger)'],
      ['info', '  Sound null safety: enabled'],
      ['info', '  Type inference: aggressively helpful'],
    ], 0, 120);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 2 — More CLI Commands
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-68 — git log
  function eggGitLog(dm) {
    const p = window.__portfolio || {};
    staggerLogs(dm, [
      ['info', 'commit f71c304  (HEAD → main, origin/main)'],
      ['info', 'Author: Vatsal Jaganwala <vatsaljaganwala@gmail.com>'],
      ['info', 'Date:   2025-04-01'],
      ['info', '    feat: Silent Achiever Award — consistent delivery'],
      ['info', ''],
      ['info', 'commit 3b9e821'],
      ['info', 'Date:   2024-05-01'],
      ['info', '    feat: On The Spot Award — outstanding dedication'],
      ['info', ''],
      ['info', 'commit a4f2c1d'],
      ['info', 'Date:   2023-08-01'],
      ['info', `    feat: joined ${p.name ? 'Instance IT Solutions' : 'company'} as Associate Flutter Developer`],
      ['info', ''],
      ['info', 'commit 1b0e000'],
      ['info', 'Date:   2024-08-01'],
      ['info', '    feat: B.E. Information Technology — CGPA 8.23'],
      ['info', ''],
      ['info', 'commit 0000001'],
      ['info', 'Date:   2020-01-01'],
      ['info', '    feat: initial commit — Hello, Flutter!'],
    ], 0, 80);
    markEggFound('git-log');
  }

  // EGG-79 — ./hire.sh
  function eggHireSh(dm) {
    const p = window.__portfolio || {};
    const email = p.email || 'vatsaljaganwala@gmail.com';
    staggerLogs(dm, [
      ['info', '#!/bin/bash'],
      ['info', '# hire.sh — Vatsal Jaganwala Hire Script v1.0'],
      ['info', ''],
      ['info', 'echo "Validating candidate..."'],
      ['info', '  → Checking Flutter expertise...       ✓'],
      ['info', '  → Checking pub.dev packages...        ✓ (smartpub published)'],
      ['info', '  → Checking null safety compliance...  ✓'],
      ['info', '  → Checking Bloc/Riverpod mastery...   ✓'],
      ['info', '  → Checking enterprise experience...   ✓'],
      ['info', '  → Checking self-awareness...          ✓ (this portfolio exists)'],
      ['info', ''],
      ['info', 'echo "All checks passed."'],
      ['info', 'echo "Opening email client..."'],
      ['info', `Launching: mailto:${email}`],
      ['info', 'Subject: "Re: Flutter Developer Role — You passed hire.sh"'],
    ], 0, 300);
    setTimeout(() => {
      if (dm.isDevMode()) {
        dm.addLog('info', 'hire.sh exited with code 0. See you in the interview.');
        fireConfetti();
        window.open(`mailto:${email}?subject=Re: Flutter Developer Role — You passed hire.sh`);
      }
    }, 5200);
    markEggFound('hire-sh');
  }

  // EGG-26 — null crash
  function eggNullCrash(dm) {
    const shell = document.getElementById('devtools-shell');
    if (!shell) {
      dm.addLog('error', 'NullPointerException: devtools-shell not found.');
      return;
    }
    // Remove any existing crash screen first
    const existing = document.getElementById('dt-null-crash');
    if (existing) existing.remove();

    const crash = document.createElement('div');
    crash.id = 'dt-null-crash';
    crash.className = 'dt-null-crash';
    crash.innerHTML = `
      <div class="dt-crash-content">
        <div class="dt-crash-title">════════ Exception caught by widgets library ══════════════</div>
        <div class="dt-crash-msg">Null check operator used on a null value</div>
        <div class="dt-crash-detail">The relevant error-causing widget was:</div>
        <div class="dt-crash-widget">  HireButton  ambition.dart:47</div>
        <div class="dt-crash-detail" style="margin-top:16px">Stack trace:</div>
        <div class="dt-crash-trace">  #0  VatsalJaganwala.getJobOffer (ambition.dart:47)</div>
        <div class="dt-crash-trace">  #1  HireButton._onPressed (hire_button.dart:23)</div>
        <div class="dt-crash-trace">  #2  ImpostorSyndrome._dismiss (impostor_syndrome.dart:12)</div>
        <div class="dt-crash-trace">  #3  Recruiter.openEmail (recruiter.dart:8)</div>
        <div class="dt-crash-title" style="margin-top:16px">════════════════════════════════════════════════════════════</div>
        <div class="dt-crash-hint" style="margin-top:24px">Press <kbd>R</kbd> to hot restart.</div>
      </div>
    `;
    shell.appendChild(crash);
    easterEggState.nullCrashActive = true;
    markEggFound('null-crash');
  }

  function dismissNullCrash(dm) {
    const crash = document.getElementById('dt-null-crash');
    if (crash) crash.remove();
    easterEggState.nullCrashActive = false;
    dm.addLog('info', 'Hot restart performed. Null resolved. hire() is no longer null.');
  }

  // EGG-60 — stackoverflow
  function eggStackOverflow(dm) {
    staggerLogs(dm, [
      ['info', 'Searching Stack Overflow...'],
      ['info', ''],
      ['info', 'Top results for "flutter developer portfolio":'],
      ['info', '  [+847] How do I hire a Flutter developer? (answered)'],
      ['info', '  [+312] Best Flutter state management in 2024?'],
      ['info', '  [+156] Why is my Flutter app so smooth?'],
      ['info', '  [+42]  How to exit vim after opening it by accident?'],
      ['info', '  [+1]   Is Vatsal available for hire? (answered: YES)'],
      ['info', ''],
      ['info', 'Tip: The answer to all Flutter questions is: "use Bloc."'],
    ], 0, 150);
    markEggFound('stackoverflow');
  }

  // EGG-63 — discord
  function eggDiscord(dm) {
    staggerLogs(dm, [
      ['info', 'Connecting to Flutter Community Discord...'],
      ['info', '#flutter-help — 1,247 online'],
      ['info', ''],
      ['info', '[FlutterDev] "Anyone know a good Flutter dev for hire?"'],
      ['info', '[Vatsal_J]   "👋 Available. Check vatsal.dev"'],
      ['info', '[FlutterDev] "Impressive portfolio. Especially the DevTools easter egg."'],
      ['info', '[Vatsal_J]   "Thanks! It took a while 😄"'],
      ['info', '[Recruiter]  "DM sent."'],
      ['info', ''],
      ['info', 'Session ended. 1 new DM received.'],
    ], 0, 200);
  }

  // EGG-77 — theme
  function eggTheme(dm) {
    const themes = [
      { name: 'default',      color: '#61AFEF', desc: 'Original DevTools palette' },
      { name: 'material-you', color: '#C678DD', desc: 'Material You inspired' },
      { name: 'hacker',       color: '#98C379', desc: 'Matrix/terminal green' },
      { name: 'dart',         color: '#E5C07B', desc: 'Dart brand orange' },
    ];
    easterEggState.themeIndex = (easterEggState.themeIndex + 1) % themes.length;
    const t = themes[easterEggState.themeIndex];
    document.documentElement.style.setProperty('--dt-blue', t.color);
    dm.addLog('info', `Theme switched to: ${t.name} (${t.desc})`);
    dm.addLog('debug', `--dt-blue: ${t.color} applied.`);
    markEggFound('theme');
  }

  // EGG-66 — dwg
  function eggDwg(dm) {
    staggerLogs(dm, [
      ['info', 'Parsing DWG file: floor_plan_v3.dwg...'],
      ['info', 'AutoCAD 2024 format detected.'],
      ['info', 'Extracting layers...'],
      ['info', '  Layer: WALLS        — 847 entities'],
      ['info', '  Layer: PARKING      — 312 spaces'],
      ['info', '  Layer: ANNOTATIONS  — 156 labels'],
      ['info', ''],
      ['info', 'ASCII preview:'],
      ['info', '  ┌──────────────────────────────┐'],
      ['info', '  │  P1  P2  P3  │  P4  P5  P6  │'],
      ['info', '  │──────────────│──────────────│'],
      ['info', '  │  P7  P8  P9  │  P10 P11 P12 │'],
      ['info', '  └──────────────────────────────┘'],
      ['info', ''],
      ['info', 'DWG parsed. 12 parking spaces allocated. 0 conflicts.'],
    ], 0, 120);
  }

  // EGG-39 — pub upgrade --major-versions
  function eggVersionConflict(dm) {
    staggerLogs(dm, [
      ['info', 'Resolving dependencies...'],
      ['warning', '  Because riverpod >=2.0.0 requires dart >=3.0.0'],
      ['warning', '  And your_hesitation ^1.0.0 requires dart <2.0.0,'],
      ['error', '  version solving failed.'],
      ['info', ''],
      ['error', 'The following packages are incompatible:'],
      ['error', '  your_hesitation: ^1.0.0'],
      ['error', '  dart_confidence: >=3.0.0'],
      ['info', ''],
      ['info', 'Suggestion: Remove your_hesitation from pubspec.yaml.'],
      ['info', 'Run ./hire.sh to resolve all conflicts.'],
    ], 0, 150);
  }

  // EGG-40 — changelog
  function eggChangelog(dm) {
    showChangelogModal();
    markEggFound('changelog');
  }

  // EGG-87 — flutter pub outdated
  function eggPubOutdated(dm) {
    staggerLogs(dm, [
      ['info', 'Showing outdated packages.'],
      ['info', '[*] indicates versions that support null safety.'],
      ['info', ''],
      ['info', 'Package                Current  Upgradable  Latest'],
      ['info', 'flutter_bloc           8.1.3    8.1.3       9.0.0'],
      ['info', 'riverpod               2.4.9    2.5.1       3.0.0'],
      ['info', 'go_router              13.2.0   14.0.0      14.0.0'],
      ['warning', 'your_confidence        0.1.0    0.1.0       2.0.0  ← update recommended'],
      ['info', ''],
      ['warning', '4 packages have newer versions incompatible with dependency constraints.'],
      ['info', 'Run ./hire.sh — upgrades everything instantly.'],
    ], 0, 120);
  }

  // EGG-98 — flutter create
  function eggFlutterCreate(dm) {
    staggerLogs(dm, [
      ['info', 'Creating project hire_vatsal...'],
      ['info', '  lib/main.dart (created)'],
      ['info', '  lib/screens/home_screen.dart (created)'],
      ['info', '  lib/services/hire_service.dart (created)'],
      ['info', '  pubspec.yaml (created)'],
      ['info', '  README.md (created)'],
      ['info', ''],
      ['info', 'All done! Run: cd hire_vatsal && flutter run'],
      ['info', 'Or just: mailto:vatsaljaganwala@gmail.com'],
    ], 0, 150);
  }

  // EGG-88 — audit
  function eggAudit(dm) {
    staggerLogs(dm, [
      ['info', 'Running accessibility audit on portfolio...'],
      ['info', ''],
      ['info', '╔══════════════════════════════════════════════════════╗'],
      ['info', '║  Accessibility Audit — portfolio.vatsal.dev          ║'],
      ['info', '║  Score: 98 / 100                               🟢    ║'],
      ['info', '╠══════════════════════════════════════════════════════╣'],
      ['info', '║  ✓  ARIA labels on all interactive elements          ║'],
      ['info', '║  ✓  Colour contrast ratio ≥ 4.5:1 (WCAG AA)         ║'],
      ['info', '║  ✓  Keyboard navigation fully supported              ║'],
      ['info', '║  ✓  Focus indicators visible                         ║'],
      ['info', '║  ✓  Headings hierarchy correct (h1 → h2 → h3)       ║'],
      ['warning', '║  ⚠  1 issue: hire button lacks urgency ARIA label    ║'],
      ['warning', '║     Fix: aria-label="Hire Vatsal immediately"        ║'],
      ['info', '╚══════════════════════════════════════════════════════╝'],
    ], 0, 100);
  }

  // EGG-89 — flutter build web --analyze-size
  function eggBundleSize(dm) {
    staggerLogs(dm, [
      ['info', 'Building release bundle...'],
      ['info', 'Analysing bundle size...'],
      ['info', '✓  Built build/web (2.4MB total)'],
    ], 0, 300);
    setTimeout(() => { if (dm.isDevMode()) showBundleSizeModal(); }, 1000);
  }

  // EGG-92 — liveshare
  function eggLiveShare(dm) {
    staggerLogs(dm, [
      ['info', 'Starting VS Code Live Share...'],
      ['info', 'Authenticating with GitHub...  ✓'],
      ['info', 'Initialising session...        ✓'],
      ['info', 'Sharing workspace: portfolio_site'],
      ['info', 'Session URL: https://vscode.dev/liveshare/f71c304a9d2e831'],
      ['info', ''],
      ['info', '[Guest has joined the session]'],
      ['info', '[Guest is viewing: devmode.js — line 847]'],
      ['info', '[Guest typed: "this is impressive"]'],
      ['info', '[Vatsal: "thanks, hire me?"]'],
      ['info', '[Guest has left the session]'],
    ], 0, 400);
  }

  // EGG-97 — observatory
  function eggObservatory(dm) {
    staggerLogs(dm, [
      ['info', 'Observatory debugger and profiler available at:'],
      ['info', 'http://127.0.0.1:9102/yourPortfolioToken=/'],
      ['info', ''],
      ['info', 'Connecting to VM service...  ✓'],
      ['info', 'VM version: 3.5.0'],
      ['info', 'Isolates: 3 (main, image_decode, portfolio_dreams)'],
      ['info', ''],
      ['info', 'Timeline events: enabled'],
      ['info', 'CPU samples: collecting at 1000Hz'],
      ['info', 'GC events: Minor GC: 12  Major GC: 0'],
      ['info', 'Hint: 0 major GCs. The code is clean. Hire the developer.'],
    ], 0, 150);
  }

  // EGG-80 — unknown command
  function eggNotFound(raw, dm) {
    dm.addLog('error', `WidgetNotFoundException: No widget found for command '${raw}'.`);
    dm.addLog('error', '  Did you mean: \'help\'?');
    dm.addLog('debug', '  #0  ConsoleRouter.dispatch (console_router.dart:42)');
    dm.addLog('debug', '  #1  DevModeShell.handleCommand (dev_mode_shell.dart:89)');
    dm.addLog('info', 'Type \'help\' to see all available commands.');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 3 — Recruiter Mode, Vim, DI Visualiser
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-81 — recruiter mode
  function eggRecruiterMode(dm) {
    easterEggState.recruiterMode = !easterEggState.recruiterMode;
    const propsPanel = document.getElementById('dt-props-inspected');
    if (easterEggState.recruiterMode) {
      dm.addLog('info', 'Recruiter mode activated. Translating tech jargon to English...');
      if (propsPanel) {
        propsPanel.innerHTML = `
          <span class="dt-props-section-title">Candidate Summary</span>
          <div class="dt-prop-row"><span class="dt-prop-key">experience</span><span class="dt-prop-sep">:</span><span class="dt-prop-val">"3+ years Flutter"</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">availability</span><span class="dt-prop-sep">:</span><span class="dt-prop-val type-bool">Open to opportunities</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">salary</span><span class="dt-prop-sep">:</span><span class="dt-prop-val">"Competitive (open to discuss)"</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">notice</span><span class="dt-prop-sep">:</span><span class="dt-prop-val">"2 weeks"</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">relocate</span><span class="dt-prop-sep">:</span><span class="dt-prop-val type-bool">Yes (remote preferred)</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">timezone</span><span class="dt-prop-sep">:</span><span class="dt-prop-val">"IST (GMT+5:30)"</span></div>
          <div class="dt-prop-row"><span class="dt-prop-key">platforms</span><span class="dt-prop-sep">:</span><span class="dt-prop-val">"Android, iOS, Web"</span></div>
        `;
      }
    } else {
      dm.addLog('info', 'Recruiter mode deactivated. Back to developer view.');
      if (dm.renderProperties) {
        dm.renderProperties();
        const activeNode = document.querySelector('.tree-node.active');
        if (activeNode && activeNode.dataset.node) {
          dm.onNodeClick(activeNode.dataset.node);
        }
      } else {
        if (propsPanel) propsPanel.innerHTML = '<p class="dt-props-hint">// Hover any widget to inspect</p>';
      }
    }
    markEggFound('recruiter');
  }

  // EGG-82 — vim mode
  function eggVimMode(dm) {
    easterEggState.vimMode = true;
    dm.addLog('info', '-- NORMAL --');
    dm.addLog('debug', 'Press i to insert, :wq to save and quit, :q! to force quit.');
    updateVimPrompt();
  }

  function handleVimInput(cmd, dm) {
    if (cmd === 'i') {
      dm.addLog('info', '-- INSERT --');
    } else if (cmd === ':wq') {
      easterEggState.vimMode = false;
      dm.addLog('info', 'Vim exited gracefully. A miracle.');
      updateVimPrompt(false);
    } else if (cmd === ':q!') {
      easterEggState.vimMode = false;
      dm.addLog('debug', 'Force quit vim. The file was modified. Probably fine.');
      updateVimPrompt(false);
    } else if (cmd === ':q') {
      dm.addLog('error', 'E37: No write since last change (add ! to override)');
    } else {
      dm.addLog('debug', `vim: unknown command: ${cmd}`);
    }
  }

  function updateVimPrompt(active = true) {
    const prompt = document.querySelector('.dt-console-prompt');
    if (prompt) prompt.textContent = active ? 'vim>' : '>';
  }

  // EGG-83 — di visualiser
  function eggDiVisualiser(dm) {
    if (document.getElementById('dt-di-overlay')) return;
    dm.addLog('info', 'Dependency injection graph visualised. get_it + injectable pattern detected.');
    const treePanel = document.getElementById('dt-tree-panel');
    if (!treePanel) return;

    const overlay = document.createElement('div');
    overlay.id = 'dt-di-overlay';
    overlay.className = 'dt-di-overlay';
    overlay.innerHTML = `
      <div class="dt-di-title">@injectable graph</div>
      <div class="dt-di-node">MaterialApp</div>
      <div class="dt-di-node indent1">Scaffold</div>
      <div class="dt-di-node indent2">PortfolioBody</div>
      <div class="dt-di-node indent3 badge">@lazySingleton ProjectRepository</div>
      <div class="dt-di-node indent3 badge">@injectable ProjectsBloc</div>
      <div class="dt-di-node indent3 badge">@singleton NavigationService</div>
      <div class="dt-di-node indent3">ContactSection</div>
      <div class="dt-di-node indent4 badge pending">@injectable HireService ← Future&lt;Job&gt; pending</div>
    `;
    treePanel.appendChild(overlay);
    setTimeout(() => { overlay.remove(); }, 5000);
  }

  // EGG-95 — tail
  function eggTail(dm) {
    if (easterEggState.tailActive) {
      easterEggState.tailActive = false;
      clearInterval(easterEggState.tailTimer);
      easterEggState.tailTimer = null;
      dm.addLog('info', 'Tail stopped. Portfolio continues running in background.');
      return;
    }
    easterEggState.tailActive = true;
    dm.addLog('info', "Tailing flutter run output... (type 'tail' again to stop)");

    const tailLines = [
      '[  +2ms] Reloaded 0 libraries in 41ms.',
      '[ +847ms] [DevTools] User scrolled to ProjectsSection',
      '[ +312ms] [Bloc] ProjectsBloc → ProjectsLoaded',
      '[+1204ms] [Navigator] Route \'/projects\' pushed',
      '[  +89ms] [DevTools] Widget tree updated. 3 dirty nodes.',
      '[+2100ms] [Network] GET /api/github/stats → 200 (34ms)',
      '[ +445ms] [Memory] Current heap: 24.7MB / 512MB available',
      '[+1800ms] [DevTools] User hovered HireButton. isHovered: true',
      '[  +23ms] [Bloc] ContactBloc → HireEvent dispatched',
      '[+3001ms] [Future] Future<Job> status: pending...',
    ];
    let idx = 0;
    // Fixed 2s interval — no random in setInterval to avoid stacking
    easterEggState.tailTimer = setInterval(() => {
      if (!easterEggState.tailActive || !dm.isDevMode()) {
        clearInterval(easterEggState.tailTimer);
        easterEggState.tailTimer = null;
        easterEggState.tailActive = false;
        return;
      }
      dm.addLog('debug', tailLines[idx % tailLines.length]);
      idx++;
    }, 2000);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 4 — DevTools Toggle Eggs
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-11 — Repaint Rainbow
  function toggleRepaintRainbow(dm) {
    easterEggState.repaintRainbow = !easterEggState.repaintRainbow;
    const ca = document.getElementById('dt-content-area');
    if (ca) ca.classList.toggle('repaint-rainbow-active', easterEggState.repaintRainbow);
    const btn = document.getElementById('dt-toggle-repaint');
    if (btn) btn.classList.toggle('active', easterEggState.repaintRainbow);
    dm.addLog('debug', `debugRepaintRainbowEnabled = ${easterEggState.repaintRainbow}. Every repaint is now visible.`);
    if (easterEggState.repaintRainbow) markEggFound('repaint-rainbow');
  }

  // EGG-12 — Slow Animations
  function toggleSlowAnimations(dm) {
    easterEggState.slowAnimations = !easterEggState.slowAnimations;
    const ca = document.getElementById('dt-content-area');
    if (ca) ca.classList.toggle('slow-animations-active', easterEggState.slowAnimations);
    const btn = document.getElementById('dt-toggle-slow');
    if (btn) btn.classList.toggle('active', easterEggState.slowAnimations);
    dm.addLog('debug', `timeDilation = ${easterEggState.slowAnimations ? '3.0' : '1.0'}. ${easterEggState.slowAnimations ? 'All animations slowed.' : 'Normal speed restored.'}`);
    // EGG-34: show/hide animation scrubber
    if (easterEggState.slowAnimations) showAnimScrubber();
    else hideAnimScrubber();
    if (easterEggState.slowAnimations) markEggFound('slow-animations');
  }

  // EGG-17 — Debug Banner (removed — banner element caused positioning issues)
  function toggleDebugBanner(dm) {
    easterEggState.debugBanner = !easterEggState.debugBanner;
    const btn = document.getElementById('dt-toggle-banner');
    if (btn) btn.classList.toggle('active', easterEggState.debugBanner);
    dm.addLog('debug', `debugBanner = ${easterEggState.debugBanner}.`);
  }

  function _applyDebugBanner() {
    // No-op — banner element removed
  }

  // Wire toggle buttons
  function setupToggleButtons(dm) {
    const toggleMap = {
      'dt-toggle-repaint':      () => toggleRepaintRainbow(dm),
      'dt-toggle-slow':         () => toggleSlowAnimations(dm),
      'dt-toggle-banner':       () => toggleDebugBanner(dm),
      // Phase 5 toggles
      'dt-toggle-perf-overlay': () => togglePerfOverlay(dm),
      'dt-toggle-semantics':    () => toggleSemanticDebugger(dm),
      'dt-toggle-checker':      () => toggleCheckerboard(dm),
      'dt-toggle-baselines':    () => toggleBaselines(dm),
    };
    Object.entries(toggleMap).forEach(([id, fn]) => {
      const btn = document.getElementById(id);
      if (btn) {
        // Remove old listener if any
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', fn);
        
        // sync active state
        if (id === 'dt-toggle-repaint') newBtn.classList.toggle('active', easterEggState.repaintRainbow);
        if (id === 'dt-toggle-slow') newBtn.classList.toggle('active', easterEggState.slowAnimations);
        if (id === 'dt-toggle-banner') newBtn.classList.toggle('active', easterEggState.debugBanner);
        if (id === 'dt-toggle-perf-overlay') newBtn.classList.toggle('active', _perfOverlayActive);
        if (id === 'dt-toggle-semantics') newBtn.classList.toggle('active', _semanticActive);
        if (id === 'dt-toggle-checker') newBtn.classList.toggle('active', _checkerboardActive);
        if (id === 'dt-toggle-baselines') newBtn.classList.toggle('active', _baselinesActive);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 5 — Konami Code (EGG-71)
  // ═══════════════════════════════════════════════════════════════════════════

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  function setupKonamiListener(dm) {
    document.addEventListener('keydown', (e) => {
      if (!dm.isDevMode()) { easterEggState.konamiProgress = 0; return; }
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      if (e.key === KONAMI[easterEggState.konamiProgress]) {
        easterEggState.konamiProgress++;
        if (easterEggState.konamiProgress === KONAMI.length) {
          easterEggState.konamiProgress = 0;
          activateGodMode(dm);
        }
      } else {
        easterEggState.konamiProgress = 0;
      }
    });
  }

  function activateGodMode(dm) {
    dm.addLog('info', 'Cheat code activated. God mode enabled. 🎮');
    dm.addLog('info', 'All performance bars: 60fps. All tests: passing. All jobs: offered.');
    fireConfetti();
    // Spike all perf bars to 100%
    document.querySelectorAll('.dt-flame-fill').forEach(bar => {
      bar.style.width = '100%';
      bar.style.background = '#98C379';
    });
    // Matrix rain overlay
    showMatrixRain(dm);
    markEggFound('konami');
  }

  function showMatrixRain(dm) {
    if (document.getElementById('dt-matrix-canvas')) return;
    const shell = document.getElementById('devtools-shell');
    if (!shell) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'dt-matrix-canvas';
    canvas.className = 'dt-matrix-canvas';
    
    const rect = shell.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = (rect.height || window.innerHeight) - 36;
    shell.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    const candidateName = 'Vatsal Jaganwala';
    const candidateRole = 'Associate Flutter Developer';
    const candidateSkills = ['Flutter', 'Dart', 'Bloc', 'Riverpod', 'Jaspr', 'Sound Null Safety', 'REST APIs', 'Git'];

    const dbLogs = [
      'Initializing Recruiter Search criteria: role="Flutter Developer"...',
      'Scanning local environment directories for candidates...',
      'Matching source: lib/data/portfolio_data.dart',
      'Analyzing candidate skills database...',
      '  - ' + candidateSkills.slice(0, 4).join(', '),
      '  - ' + candidateSkills.slice(4).join(', '),
      'Retrieving employment history metrics...',
      '  - Associate Flutter Developer at Instance IT Solutions',
      'Checking open-source contributions...',
      '  - smartpub (160/160 pub points on pub.dev)',
      'Verifying sound null safety compliance: 100% OK',
      'Retrieving academic score cards...',
      '  - B.E. Information Technology (CGPA: 8.23)',
      'Checking awards and recognition logs...',
      '  - Silent Achiever Award, On The Spot Award',
      'Resolving match constraints checklist...'
    ];

    const words = [
      'FLUTTER', 'DART', 'BLOC', 'RIVERPOD', 'JASPR', 'HIRE_VATSAL', '60_FPS',
      'PASSING', 'GOD_MODE', 'NULL_SAFE', 'SUCCESS', 'CONFIRM_OFFER',
      'PORTFOLIO', 'STABLE', 'CLEAN_CODE', 'OVERLORD', 'ROOT_ACCESS'
    ];

    const cols = Math.floor(canvas.width / 24);
    const drops = [];
    for (let i = 0; i < cols; i++) {
      drops.push({
        x: i * 24,
        y: Math.random() * -300,
        speed: 2 + Math.random() * 4,
        word: words[Math.floor(Math.random() * words.length)],
        charIndex: 0
      });
    }

    let frame = 0;
    const interval = setInterval(() => {
      // Stop if canvas was removed (DevMode exited)
      if (!canvas.isConnected || !dm.isDevMode()) {
        clearInterval(interval);
        if (canvas.isConnected) canvas.remove();
        return;
      }

      // Background trailing fade
      ctx.fillStyle = 'rgba(30, 34, 39, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const offset = 24;
      const isSmall = w < 640;

      // Draw falling words
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      drops.forEach((drop) => {
        for (let j = 0; j < drop.word.length; j++) {
          const charIndex = Math.floor(drop.y / 20);
          const idx = ((charIndex - j) % drop.word.length + drop.word.length) % drop.word.length;
          const char = drop.word[idx];
          
          const opacity = Math.max(0, 1 - j / drop.word.length);
          if (j === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          } else {
            ctx.fillStyle = `rgba(152, 195, 121, ${opacity * 0.35})`;
          }
          ctx.fillText(char, drop.x, drop.y - j * 20);
        }

        drop.y += drop.speed;
        if (drop.y - drop.word.length * 20 > canvas.height) {
          drop.y = Math.random() * -150;
          drop.word = words[Math.floor(Math.random() * words.length)];
          drop.speed = 2 + Math.random() * 4;
        }
      });

      // Draw HUD (Telemetry and pulsing God Mode title)
      drawHUD(ctx, w, h, frame);

      // Draw Search Phase
      if (frame < 75) {
        // --- PHASE 1: DATABASE SCANNING ---
        ctx.fillStyle = '#98C379';
        ctx.font = 'bold 15px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SEARCH INITIATED // INDEXING CANDIDATE DATA...', w / 2, 85);

        // Progress bar
        const pct = Math.min(100, Math.floor((frame / 75) * 100));
        const barW = Math.min(320, w - 48);
        ctx.strokeStyle = 'rgba(152, 195, 121, 0.3)';
        ctx.strokeRect(w / 2 - barW / 2, 110, barW, 20);
        ctx.fillStyle = '#98C379';
        ctx.fillRect(w / 2 - barW / 2 + 4, 114, ((barW - 8) * pct) / 100, 12);
        
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${pct}%`, w / 2, 124);

        // Log entries console
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(152, 195, 121, 0.75)';
        ctx.font = isSmall ? '9px JetBrains Mono, monospace' : '11px JetBrains Mono, monospace';
        const logX = w / 2 - barW / 2;
        const visibleLogsCount = Math.min(dbLogs.length, Math.floor(frame / 4.5) + 1);
        for (let i = 0; i < visibleLogsCount; i++) {
          const logY = 160 + i * (isSmall ? 16 : 20);
          if (logY < h - offset - 40) {
            ctx.fillText('> ' + dbLogs[i], logX, logY);
          }
        }

      } else if (frame < 155) {
        // --- PHASE 2: SPECIFICATION CHECKLIST ---
        ctx.fillStyle = '#98C379';
        ctx.font = 'bold 15px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VAL-DEV // VERIFYING ALIGNMENT REQUIREMENTS...', w / 2, 85);

        const requirements = [
          { text: 'Experience: 3+ years Flutter/Dart development', met: true },
          { text: 'Architecture: clean Bloc, Riverpod & DI workflows', met: true },
          { text: 'Academic Credentials: B.E. IT Graduate (CGPA 8.23)', met: true },
          { text: 'Open Source: smartpub package creator (pub.dev audited)', met: true },
          { text: 'Performance Check: 60fps stable portfolio main render', met: true },
          { text: 'Commitment Metrics: verified (Silent Achiever Award)', met: true }
        ];

        ctx.textAlign = 'left';
        ctx.font = isSmall ? '10px JetBrains Mono, monospace' : '12px JetBrains Mono, monospace';
        const listX = Math.max(offset + 12, w / 2 - (isSmall ? 190 : 230));

        requirements.forEach((req, idx) => {
          const visibleFrame = 75 + idx * 12;
          const yPos = 125 + idx * (isSmall ? 32 : 40);
          if (frame >= visibleFrame) {
            ctx.fillStyle = '#98C379';
            ctx.fillText('✓', listX, yPos);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(req.text, listX + 24, yPos);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillText('☐', listX, yPos);
            ctx.fillText(req.text, listX + 24, yPos);
          }
        });

      } else {
        // --- PHASE 3: CANDIDATE RESOLVED CARD ---
        ctx.fillStyle = '#98C379';
        ctx.font = 'bold 16px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CANDIDATE RESOLUTION MATRIX: SUCCESS ✓', w / 2, 85);

        const sinPulse = 0.5 + Math.sin(frame * 0.12) * 0.45;
        const cardW = isSmall ? w - 48 : 540;
        const cardH = isSmall ? 280 : 230;
        const cardX = w / 2 - cardW / 2;
        const cardY = 110;

        // Draw Card border and background
        ctx.strokeStyle = '#98C379';
        ctx.lineWidth = 2;
        ctx.strokeRect(cardX, cardY, cardW, cardH);
        ctx.fillStyle = 'rgba(22, 27, 34, 0.98)';
        ctx.fillRect(cardX, cardY, cardW, cardH);

        // Card Header
        ctx.fillStyle = '#61AFEF';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('==================================================', w / 2, cardY + 25);
        ctx.fillText('           CANDIDATE SUMMARY RESOLVED             ', w / 2, cardY + 45);
        ctx.fillText('==================================================', w / 2, cardY + 65);

        // Profile details
        ctx.font = isSmall ? '10px JetBrains Mono, monospace' : '12px JetBrains Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';

        const textLeft = cardX + (isSmall ? 16 : 30);
        ctx.fillText('NAME:       ' + candidateName, textLeft, cardY + 95);
        ctx.fillText('ROLE:       ' + candidateRole, textLeft, cardY + 115);
        
        ctx.fillStyle = '#98C379';
        ctx.fillText('SKILLS:     ' + candidateSkills.slice(0, isSmall ? 4 : 5).join(', '), textLeft, cardY + 135);
        ctx.fillText('            ' + candidateSkills.slice(isSmall ? 4 : 5).join(', '), textLeft, cardY + 155);

        ctx.fillStyle = '#E5C07B';
        ctx.fillText('MATCH SCORE: 100% (IDEAL PORTFOLIO MATCH)', textLeft, cardY + 185);
        ctx.fillText('AVAILABILITY: Open to discussion (Surat / Remote)', textLeft, cardY + 205);

        // Bottom CTAs prompt
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = `rgba(152, 195, 121, ${sinPulse})`;
        ctx.fillText('RUN COMMAND `./hire.sh` TO INITIATE RECRUITMENT CALENDAR', w / 2, cardY + cardH + 35);
      }

      frame++;
      if (frame > 420) {
        clearInterval(interval);
        canvas.style.transition = 'opacity 1.5s ease-out';
        canvas.style.opacity = '0';
        setTimeout(() => {
          if (canvas.isConnected) canvas.remove();
        }, 1500);
      }
    }, 50);
  }

  function drawHUD(ctx, w, h, frame) {
    ctx.strokeStyle = 'rgba(152, 195, 121, 0.2)';
    ctx.lineWidth = 1;

    const offset = 24;
    const len = 30;

    // Corner brackets
    ctx.beginPath();
    ctx.moveTo(offset, offset + len);
    ctx.lineTo(offset, offset);
    ctx.lineTo(offset + len, offset);
    ctx.moveTo(w - offset, offset + len);
    ctx.lineTo(w - offset, offset);
    ctx.lineTo(w - offset - len, offset);
    ctx.moveTo(offset, h - offset - len);
    ctx.lineTo(offset, h - offset);
    ctx.lineTo(offset + len, h - offset);
    ctx.moveTo(w - offset, h - offset - len);
    ctx.lineTo(w - offset, h - offset);
    ctx.lineTo(w - offset - len, h - offset);
    ctx.stroke();

    // Scanning grid line
    ctx.strokeStyle = 'rgba(152, 195, 121, 0.04)';
    ctx.beginPath();
    const gridY = (frame * 4) % h;
    ctx.moveTo(0, gridY);
    ctx.lineTo(w, gridY);
    ctx.stroke();

    // Center targeting reticle
    ctx.strokeStyle = 'rgba(152, 195, 121, 0.12)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2 - 60, h / 2);
    ctx.lineTo(w / 2 - 10, h / 2);
    ctx.moveTo(w / 2 + 10, h / 2);
    ctx.lineTo(w / 2 + 60, h / 2);
    ctx.moveTo(w / 2, h / 2 - 60);
    ctx.lineTo(w / 2, h / 2 - 10);
    ctx.moveTo(w / 2, h / 2 + 10);
    ctx.lineTo(w / 2, h / 2 + 60);
    ctx.stroke();

    // Telemetry dashboard in corners
    ctx.fillStyle = 'rgba(152, 195, 121, 0.85)';
    ctx.font = '9px JetBrains Mono, monospace';
    
    // Top-Left corner values
    ctx.textAlign = 'left';
    ctx.fillText('ENGINE: CANDIDATE_INDEX_V2', offset + 12, offset + 16);
    ctx.fillText('SCAN_PORT: 8080/ACTIVE', offset + 12, offset + 28);
    ctx.fillText('SECURITY: BYPASSED (ROOT)', offset + 12, offset + 40);

    // Top-Right corner values
    ctx.textAlign = 'right';
    ctx.fillText('TARGET: VATSAL_JAGANWALA', w - offset - 12, offset + 16);
    ctx.fillText('LOC: SURAT, GUJARAT, IN', w - offset - 12, offset + 28);
    ctx.fillText('STATUS: GOD_MODE_ACTIVE', w - offset - 12, offset + 40);

    // Bottom-Left corner values
    ctx.textAlign = 'left';
    ctx.fillText('DART: v3.5.0_SOUND', offset + 12, h - offset - 28);
    ctx.fillText('FLUTTER: v3.24.0_STABLE', offset + 12, h - offset - 16);

    // Bottom-Right corner values
    ctx.textAlign = 'right';
    ctx.fillText('RECRUITER_MODE: ACTIVE', w - offset - 12, h - offset - 28);
    ctx.fillText('VERDICT: RECOMMEND_HIRE', w - offset - 12, h - offset - 16);

    // Center HUD display text (pulsing opacity) at top
    const sinPulse = 0.5 + Math.sin(frame * 0.12) * 0.45;
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px JetBrains Mono, monospace';
    ctx.fillStyle = `rgba(152, 195, 121, ${sinPulse})`;
    ctx.fillText('::: GOD MODE ENGAGED :::', w / 2, 45);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 6 — Flutter Logo Clicks → Credits Modal (EGG-76)
  // ═══════════════════════════════════════════════════════════════════════════

  function setupFlutterLogoClicks(dm) {
    const logo = document.getElementById('dt-flutter-logo-btn');
    if (!logo) return;
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      easterEggState.flutterLogoClicks++;
      clearTimeout(easterEggState.flutterLogoTimer);
      easterEggState.flutterLogoTimer = setTimeout(() => {
        easterEggState.flutterLogoClicks = 0;
      }, 3000);
      if (easterEggState.flutterLogoClicks >= 5) {
        easterEggState.flutterLogoClicks = 0;
        showCreditsModal(dm);
        markEggFound('credits');
      }
    });
  }

  function showCreditsModal(dm) {
    if (document.getElementById('dt-credits-modal')) return;
    const p = window.__portfolio || {};
    const modal = document.createElement('div');
    modal.id = 'dt-credits-modal';
    modal.className = 'dt-modal-overlay';
    modal.innerHTML = `
      <div class="dt-modal-box">
        <div class="dt-modal-body">
          <div class="dt-modal-code">void main() {<br>&nbsp;&nbsp;runApp(Portfolio());<br>}</div>
          <div class="dt-modal-title">Built with ❤️ by ${p.name || 'Vatsal Jaganwala'}</div>
          <div class="dt-modal-stack">
            <div>Stack:</div>
            <div>• Jaspr — Dart web framework</div>
            <div>• Flutter DevTools aesthetic</div>
            <div>• JetBrains Mono font</div>
            <div>• 847 widgets (approx)</div>
            <div>• Excessive attention to detail</div>
          </div>
          <div class="dt-modal-links">
            <a href="${p.github || '#'}" target="_blank" rel="noopener" class="dt-modal-link">GitHub ↗</a>
            <a href="${p.linkedin || '#'}" target="_blank" rel="noopener" class="dt-modal-link">LinkedIn ↗</a>
            <button class="dt-modal-close" id="dt-credits-close">✕</button>
          </div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('devtools-shell').appendChild(modal);
    document.getElementById('dt-credits-close').addEventListener('click', () => modal.remove());
    dm.addLog('info', 'void main() { runApp(Portfolio()); } // It all starts here.');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 7 — Modals (Changelog, Bundle Size)
  // ═══════════════════════════════════════════════════════════════════════════

  function showChangelogModal() {
    if (document.getElementById('dt-changelog-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'dt-changelog-modal';
    modal.className = 'dt-modal-overlay';
    modal.innerHTML = `
      <div class="dt-modal-box dt-modal-wide">
        <div class="dt-modal-header">
          <span class="dt-modal-title-bar">CHANGELOG.md — Vatsal Jaganwala Career Edition</span>
          <button class="dt-modal-close" id="dt-changelog-close">✕</button>
        </div>
        <div class="dt-modal-body dt-changelog-body">
          <div class="dt-cl-version">## [2.3.1+42] — 2025-04-01</div>
          <div class="dt-cl-line">- feat: Silent Achiever Award — consistent delivery</div>
          <div class="dt-cl-line">- feat: published smartpub &amp; flutter_logger_pro to pub.dev</div>
          <div class="dt-cl-line">- fix: reduced impostor syndrome by 40%</div>
          <div class="dt-cl-line">- perf: coffee intake optimised (3→2 cups/day)</div>
          <br>
          <div class="dt-cl-version">## [2.2.0+38] — 2024-05-01</div>
          <div class="dt-cl-line">- feat: On The Spot Award — outstanding dedication</div>
          <div class="dt-cl-line">- feat: Construction Drawing Management Platform shipped</div>
          <div class="dt-cl-line">- fix: removed all setState() from ViewModels</div>
          <div class="dt-cl-line">- chore: migrated 3 apps to null safety</div>
          <br>
          <div class="dt-cl-version">## [2.0.0+20] — 2023-08-01</div>
          <div class="dt-cl-line">- feat!: BREAKING — joined Instance IT Solutions</div>
          <div class="dt-cl-line">- feat: first Flutter production deployment</div>
          <div class="dt-cl-line">- feat: cross-platform apps for Android, iOS &amp; Web</div>
          <br>
          <div class="dt-cl-version">## [1.0.0+1] — 2020-08-01</div>
          <div class="dt-cl-line">- feat: initial release — Hello, Flutter!</div>
          <div class="dt-cl-line">- feat: survived first StatefulWidget</div>
          <div class="dt-cl-line">- feat: B.E. Information Technology commenced</div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('devtools-shell').appendChild(modal);
    document.getElementById('dt-changelog-close').addEventListener('click', () => modal.remove());
  }

  function showBundleSizeModal() {
    if (document.getElementById('dt-bundle-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'dt-bundle-modal';
    modal.className = 'dt-modal-overlay';
    modal.innerHTML = `
      <div class="dt-modal-box dt-modal-wide">
        <div class="dt-modal-header">
          <span class="dt-modal-title-bar">Bundle Size Analyser — Total: 2.4MB (Lighthouse: 98)</span>
          <button class="dt-modal-close" id="dt-bundle-close">✕</button>
        </div>
        <div class="dt-modal-body">
          <div class="dt-bundle-grid">
            <div class="dt-bundle-block" style="background:rgba(97,175,239,0.3);grid-column:span 4" title="dart2js compiled output: 1.2MB">dart2js<br>1.2MB</div>
            <div class="dt-bundle-block" style="background:rgba(152,195,121,0.3);grid-column:span 3" title="assets/fonts: 580KB">fonts<br>580KB</div>
            <div class="dt-bundle-block" style="background:rgba(198,120,221,0.3);grid-column:span 2" title="assets/images: 420KB">images<br>420KB</div>
            <div class="dt-bundle-block" style="background:rgba(86,182,194,0.3)" title="canvaskit: 140KB">ck<br>140KB</div>
            <div class="dt-bundle-block" style="background:rgba(229,192,123,0.3)" title="service_worker.js: 42KB">sw<br>42KB</div>
            <div class="dt-bundle-block" style="background:rgba(90,90,90,0.3)" title="regrets.json: 0KB — Empty. Tree-shaken at build time.">regrets<br>0KB</div>
          </div>
          <div class="dt-bundle-hint">Hover blocks for details. regrets.json: tree-shaken at build time.</div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('devtools-shell').appendChild(modal);
    document.getElementById('dt-bundle-close').addEventListener('click', () => modal.remove());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY 8 — Fake Analytics (EGG-75) & Rebuild Counter (EGG-96)
  // ═══════════════════════════════════════════════════════════════════════════

  const FAKE_CITIES = [
    // Home region — Gujarat, India
    'Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Anand', 'Gandhinagar',
    // Major Indian tech hubs
    'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi', 'Noida',
    // Global tech hubs
    'San Francisco', 'New York', 'Seattle', 'Austin', 'Toronto', 'London',
    'Berlin', 'Amsterdam', 'Stockholm', 'Zurich', 'Dubai', 'Singapore',
    'Tokyo', 'Sydney', 'São Paulo', 'Tel Aviv',
  ];

  function startFakeAnalytics(dm) {
    stopFakeAnalytics();
    // Increment visitor count every 45–90s
    function scheduleNext() {
      const delay = 45000 + Math.random() * 45000;
      easterEggState.fakeVisitorTimer = setTimeout(() => {
        if (!dm.isDevMode()) return;
        easterEggState.fakeVisitorCount++;
        const city = FAKE_CITIES[Math.floor(Math.random() * FAKE_CITIES.length)];
        dm.addLog('debug', `New visitor from ${city}. Total: ${easterEggState.fakeVisitorCount.toLocaleString()}.`);
        updateAnalyticsBadge();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
  }

  function stopFakeAnalytics() {
    clearTimeout(easterEggState.fakeVisitorTimer);
    easterEggState.fakeVisitorTimer = null;
  }

  function updateAnalyticsBadge() {
    const el = document.getElementById('dt-visitor-count');
    if (el) el.textContent = easterEggState.fakeVisitorCount.toLocaleString();
  }

  function startRebuildCounter(dm) {
    stopRebuildCounter();
    easterEggState.rebuildCount = 0;
    let _lastRebuild = 0;
    easterEggState.rebuildHandler = () => {
      // Throttle to max once per 200ms to avoid UI jank
      const now = Date.now();
      if (now - _lastRebuild < 200) return;
      _lastRebuild = now;
      easterEggState.rebuildCount++;
      const badge = document.getElementById('dt-rebuild-counter');
      if (badge) {
        badge.textContent = `🔄 Rebuilds: ${easterEggState.rebuildCount}`;
        badge.classList.toggle('warn', easterEggState.rebuildCount >= 50);
        badge.classList.toggle('high', easterEggState.rebuildCount >= 100);
      }
      if (easterEggState.rebuildCount === 50) {
        dm.addLog('warning', '50 rebuilds detected. Consider using const constructors.');
      } else if (easterEggState.rebuildCount === 100) {
        dm.addLog('warning', '100 rebuilds. This widget tree needs a const audit.');
        dm.addLog('info', 'In practice: Vatsal uses const everywhere. This counter is for show.');
      }
    };
    // Only listen to click and scroll — not mousemove (too frequent)
    ['click', 'scroll', 'keydown'].forEach(ev =>
      document.addEventListener(ev, easterEggState.rebuildHandler, { passive: true }));
  }

  function stopRebuildCounter() {
    if (easterEggState.rebuildHandler) {
      ['click', 'scroll', 'keydown'].forEach(ev =>
        document.removeEventListener(ev, easterEggState.rebuildHandler));
      easterEggState.rebuildHandler = null;
    }
  }

  // EGG-72 — Jank spike after 60s idle
  function startJankTimer(dm) {
    clearTimeout(easterEggState.jankTimer);
    easterEggState.jankTimer = setTimeout(() => {
      if (!dm.isDevMode()) return;
      dm.addLog('debug', '⚠ Frame spike detected at t=60s. Cause: cognitive overhead. Fix: ship it.');
      // Spike one perf bar
      const bars = document.querySelectorAll('.dt-flame-fill');
      if (bars.length > 0) {
        const bar = bars[0];
        const orig = bar.style.width;
        bar.style.width = '100%';
        bar.style.background = '#E06C75';
        setTimeout(() => {
          bar.style.width = orig || '72%';
          bar.style.background = '';
        }, 2000);
      }
    }, 60000);
  }

  function stopJankTimer() {
    clearTimeout(easterEggState.jankTimer);
    easterEggState.jankTimer = null;
  }

  // EGG-94 — Memory leak warning after 3 min
  function startMemLeakTimer(dm) {
    clearTimeout(easterEggState.memLeakTimer);
    easterEggState.memLeakTimer = setTimeout(() => {
      if (!dm.isDevMode()) return;
      dm.addLog('warning', 'Potential memory leak detected.');
      dm.addLog('warning', 'StreamSubscription in ContactSection not cancelled in dispose().');
      dm.addLog('warning', 'GlobalKey<FloatingActionButtonState> held by GC root.');
      dm.addLog('warning', 'Retained objects: 3. Consider calling dispose().');
      dm.addLog('info', 'Hint: In this portfolio, the leak is intentional.');
      dm.addLog('info', '      It\'s retaining hope that you\'ll call hire().');
      const memTab = document.querySelector('.dt-tab[data-tab="memory"]');
      if (memTab) memTab.innerHTML = memTab.innerHTML.replace('Memory', 'Memory 🔴');
    }, 180000);
  }

  function stopMemLeakTimer() {
    clearTimeout(easterEggState.memLeakTimer);
    easterEggState.memLeakTimer = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOTSTRAP — called when DevMode activates / deactivates
  // ═══════════════════════════════════════════════════════════════════════════

  function onDevModeEnter(dm) {
    // Console input is already in the Dart-rendered DOM — just wire the listener.
    // Use a flag on the IIFE scope (not dataset) so it resets on each entry.
    const input = document.getElementById('dt-console-input');
    if (input) {
      // Clone to strip any stale listeners from a previous DevMode session
      const parent = input.parentNode;
      if (parent) {
        const fresh = input.cloneNode(true);
        parent.replaceChild(fresh, input);
        fresh.addEventListener('keydown', (e) => onConsoleKeydown(e, dm));
        fresh.addEventListener('focus',   () => showSuggestions(fresh.value, dm));
        fresh.addEventListener('input',   () => showSuggestions(fresh.value, dm));
        fresh.addEventListener('blur',    () => setTimeout(hideSuggestions, 150));
      } else {
        // Parent not in DOM yet — wire directly without clone
        input.addEventListener('keydown', (e) => onConsoleKeydown(e, dm));
        input.addEventListener('focus',   () => showSuggestions(input.value, dm));
        input.addEventListener('input',   () => showSuggestions(input.value, dm));
        input.addEventListener('blur',    () => setTimeout(hideSuggestions, 150));
      }
    }
    setupToggleButtons(dm);
    setupFlutterLogoClicks(dm);
    // Phase 5 next tasks
    setupOverflowDetector(dm);
    setupSetStateStorm(dm);
    setupSizeTooltip(dm);
    setupBuildVariantDropdown(dm);
    // NEXT-07/08/09
    setupCpuProfileButton(dm);
    setupLayoutExplorer();
    setupCodeReviewMenu(dm);
    // Remaining eggs
    setupPubDevCard(dm);
    injectCiPill(dm);
    injectDiscordPill(dm);
    setupGptPanel(dm);
    setupEnterpriseNode(dm);
    // Task A
    setupContextDepthMeter(dm);
    setupAboutHoverDocs(dm);
    setupVersionPillClick();
    // Flutter Weekly — fires once when projects section enters view
    setTimeout(() => {
      const ca = document.getElementById('dt-content-area');
      if (!ca || !dm.isDevMode()) return;
      _weeklyScrollHandler = () => {
        const proj = ca.querySelector('#projects');
        if (!proj) return;
        if (proj.getBoundingClientRect().top < window.innerHeight * 0.8) {
          injectFlutterWeeklyBanner(dm);
          if (_weeklyScrollHandler) {
            ca.removeEventListener('scroll', _weeklyScrollHandler);
            _weeklyScrollHandler = null;
          }
        }
      };
      ca.addEventListener('scroll', _weeklyScrollHandler, { passive: true });
    }, 1000);
    // Task B
    setupErrorClickExpand();
    // Debug banner default state (toggle button starts active, no visual element)
    easterEggState.debugBanner = true;
    const btn = document.getElementById('dt-toggle-banner');
    if (btn) btn.classList.add('active');
    // Start background timers
    startFakeAnalytics(dm);
    startRebuildCounter(dm);
    startJankTimer(dm);
    startMemLeakTimer(dm);
    // Update egg badge
    updateEggBadge();
    updateAnalyticsBadge();
  }

  function onDevModeExit() {
    // Stop all background timers
    stopFakeAnalytics();
    stopRebuildCounter();
    stopJankTimer();
    stopMemLeakTimer();
    // Hide suggestion panel
    hideSuggestions();
    if (_suggestionPanel) { _suggestionPanel.remove(); _suggestionPanel = null; }
    // Restore memory tab label if it was modified by memory leak warning
    const memTab = document.querySelector('.dt-tab[data-tab="memory"]');
    if (memTab) memTab.innerHTML = memTab.innerHTML.replace('Memory 🔴', 'Memory');
    // Phase 5 teardowns
    teardownOverflowDetector();
    teardownSetStateStorm();
    teardownSizeTooltip();
    teardownBuildVariantDropdown();
    hideMemoryTab();
    hideNetworkTab();
    // NEXT-07/08/09
    teardownCpuProfile();
    teardownLayoutExplorer();
    teardownCodeReviewMenu();
    // Remaining eggs teardowns
    teardownPubDevCard();
    teardownCiPill();
    teardownGptPanel();
    teardownEnterpriseNode();
    // Reset dart quiz state
    _dartQuizState = { active: false, index: 0, score: 0 };
    teardownErrorClickExpand();
    // Task A teardowns
    teardownContextDepthMeter();
    teardownConstraintsBadges();
    teardownBreakpointLines();
    teardownFlutterWeeklyBanner();
    teardownDiscordPill();
    teardownAboutHoverDocs();
    // Shader badge
    const shaderBadge = document.querySelector('.dt-shader-badge');
    if (shaderBadge) shaderBadge.remove();
    // Task C teardowns
    teardownPerfOverlay();
    teardownSemanticDebugger();
    teardownDataFlow();
    hideAnimScrubber();
    // Reset all toggle button states
    ['dt-toggle-repaint','dt-toggle-slow','dt-toggle-perf-overlay',
     'dt-toggle-semantics','dt-toggle-checker','dt-toggle-baselines',
     'dt-toggle-constraints','dt-toggle-bp','dt-toggle-dataflow'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });
    // Re-set banner button to active (default ON)
    const bannerBtn = document.getElementById('dt-toggle-banner');
    if (bannerBtn) bannerBtn.classList.add('active');
    // Remove any open modals / overlays left behind
    ['dt-credits-modal','dt-changelog-modal','dt-bundle-modal',
     'dt-di-overlay','dt-state-wars-modal','dt-gpt-modal',
     'dt-matrix-canvas','dt-null-crash'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    // Reset theme to default
    document.documentElement.style.removeProperty('--dt-blue');
    easterEggState.themeIndex = 0;
    // Stop tail if running
    if (easterEggState.tailActive) {
      easterEggState.tailActive = false;
      clearInterval(easterEggState.tailTimer);
    }
    // Reset vim mode
    easterEggState.vimMode = false;
    updateVimPrompt(false);
    // Reset recruiter mode
    easterEggState.recruiterMode = false;
    // Reset toggles
    easterEggState.repaintRainbow = false;
    easterEggState.slowAnimations = false;
    easterEggState.debugBanner = true;
    easterEggState.konamiProgress = 0;
    easterEggState.flutterLogoClicks = 0;
    easterEggState.rebuildCount = 0;
    // Remove null crash if open
    const crash = document.getElementById('dt-null-crash');
    if (crash) crash.remove();
    easterEggState.nullCrashActive = false;
    // Remove any open modals
    ['dt-credits-modal','dt-changelog-modal','dt-bundle-modal','dt-di-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    // Reset theme to default
    document.documentElement.style.removeProperty('--dt-blue');
    easterEggState.themeIndex = 0;
  }

  // ─── Hook into devmode.js via window.__devmode ────────────────────────────
  waitForDevmode((dm) => {
    // Register enter/exit hooks
    dm.onEnter(onDevModeEnter);
    dm.onExit(onDevModeExit);

    // Expose recruiter mode check
    dm._isRecruiterMode = () => easterEggState.recruiterMode;

    // Expose memory/network tab handlers
    dm.switchToMemory = () => showMemoryTab(dm);
    dm.switchToNetwork = () => showNetworkTab(dm);
    dm.onPerfTabOpen  = () => setupCpuProfileButton(dm);
    dm.onNodeClick    = (nodeId) => {
      if (easterEggState.recruiterMode) return;
      injectLayoutExplorer(nodeId);
      injectJasprMeta(nodeId);
      injectKeyInspector(nodeId);
      injectFutureVisualiser(nodeId);
      injectPubPointsBreakdown(nodeId);
      injectBlocEventLog(nodeId, dm);
    };

    // Konami listener (always active, checks isDevMode internally)
    setupKonamiListener(dm);

    // R key in null crash screen
    document.addEventListener('keydown', (e) => {
      if (easterEggState.nullCrashActive && (e.key === 'r' || e.key === 'R')) {
        dismissNullCrash(dm);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5 NEXT TASKS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── NEXT-01: EGG-24 — RenderFlex Overflow Banner ────────────────────────
  let _overflowObserver = null;
  let _overflowBanner = null;

  function setupOverflowDetector(dm) {
    _overflowObserver = new ResizeObserver(() => {
      if (!dm.isDevMode()) return;
      if (window.innerWidth < 480) {
        showOverflowBanner(dm);
      } else {
        hideOverflowBanner();
      }
    });
    _overflowObserver.observe(document.body);
    // Check immediately
    if (window.innerWidth < 480) showOverflowBanner(dm);
  }

  function showOverflowBanner(dm) {
    if (_overflowBanner) return;
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;
    _overflowBanner = document.createElement('div');
    _overflowBanner.className = 'dt-overflow-banner';
    _overflowBanner.textContent = 'A RenderFlex overflowed by 42 pixels on the right.';
    _overflowBanner.addEventListener('click', () => {
      hideOverflowBanner();
      dm.addLog('debug', 'Wrapped child in Flexible. Overflow resolved.');
      dm.addLog('info', 'Consider using Expanded or Flexible for responsive layouts.');
    });
    ca.appendChild(_overflowBanner);
  }

  function hideOverflowBanner() {
    if (_overflowBanner) { _overflowBanner.remove(); _overflowBanner = null; }
  }

  function teardownOverflowDetector() {
    if (_overflowObserver) { _overflowObserver.disconnect(); _overflowObserver = null; }
    hideOverflowBanner();
  }

  // ─── NEXT-02: EGG-25 — setState() Storm ──────────────────────────────────
  let _tripleClickHandler = null;
  let _tripleClickCount = 0;
  let _tripleClickTimer = null;

  function setupSetStateStorm(dm) {
    _tripleClickHandler = (e) => {
      if (!dm.isDevMode()) return;
      const ca = document.getElementById('dt-content-area');
      if (!ca || !ca.contains(e.target)) return;
      _tripleClickCount++;
      clearTimeout(_tripleClickTimer);
      _tripleClickTimer = setTimeout(() => { _tripleClickCount = 0; }, 500);
      if (_tripleClickCount >= 3) {
        _tripleClickCount = 0;
        triggerSetStateStorm(dm);
      }
    };
    document.addEventListener('click', _tripleClickHandler);
  }

  function triggerSetStateStorm(dm) {
    for (let i = 1; i <= 8; i++) {
      setTimeout(() => {
        if (dm.isDevMode()) dm.addLog('warning', `setState() called during build. (${i}/8)`);
      }, i * 50);
    }
    setTimeout(() => {
      if (dm.isDevMode()) {
        dm.addLog('warning', 'Build scheduled while build in progress. This is a bug in your framework layer.');
        const ca = document.getElementById('dt-content-area');
        if (ca) {
          ca.classList.add('dt-clean-flash');
          setTimeout(() => ca.classList.remove('dt-clean-flash'), 300);
        }
      }
    }, 450);
    setTimeout(() => {
      if (dm.isDevMode()) {
        dm.addLog('info', 'setState storm resolved. Consider using BlocBuilder.');
      }
    }, 1000);
  }

  function teardownSetStateStorm() {
    if (_tripleClickHandler) {
      document.removeEventListener('click', _tripleClickHandler);
      _tripleClickHandler = null;
    }
    clearTimeout(_tripleClickTimer);
    _tripleClickCount = 0;
  }

  // ─── NEXT-03: EGG-18 — Widget Size Tooltip ───────────────────────────────
  let _sizeTooltip = null;
  let _sizeMoveHandler = null;
  let _sizeLeaveHandler = null;

  function setupSizeTooltip(dm) {
    _sizeTooltip = document.createElement('div');
    _sizeTooltip.id = 'dt-size-tooltip';
    _sizeTooltip.className = 'dt-size-tooltip';
    _sizeTooltip.style.display = 'none';
    document.body.appendChild(_sizeTooltip);

    const sections = ['hero', 'projects', 'about', 'skills', 'experience',
                      'open-source', 'education', 'achievements', 'contact'];

    sections.forEach(id => {
      const el = document.querySelector(`#dt-content-area #${id}`) ||
                 document.querySelector(`#dt-content-area [id="${id}"]`);
      if (!el) return;

      el.addEventListener('mouseenter', (e) => {
        if (!dm.isDevMode()) return;
        const r = el.getBoundingClientRect();
        _sizeTooltip.textContent = `RenderBox(size: ${r.width.toFixed(1)} × ${r.height.toFixed(1)})`;
        _sizeTooltip.style.display = 'block';
      });
      el.addEventListener('mouseleave', () => {
        if (_sizeTooltip) _sizeTooltip.style.display = 'none';
      });
    });

    _sizeMoveHandler = (e) => {
      if (_sizeTooltip && _sizeTooltip.style.display !== 'none') {
        _sizeTooltip.style.left = (e.clientX + 14) + 'px';
        _sizeTooltip.style.top  = (e.clientY + 14) + 'px';
      }
    };
    document.addEventListener('mousemove', _sizeMoveHandler, { passive: true });
  }

  function teardownSizeTooltip() {
    if (_sizeTooltip) { _sizeTooltip.remove(); _sizeTooltip = null; }
    if (_sizeMoveHandler) {
      document.removeEventListener('mousemove', _sizeMoveHandler);
      _sizeMoveHandler = null;
    }
  }

  // ─── NEXT-04: EGG-20 — Memory Heap Treemap ───────────────────────────────
  function showMemoryTab(dm) {
    const shell = document.getElementById('devtools-shell');
    if (!shell) return;
    const contentArea = document.getElementById('dt-content-area');
    const perfView = document.getElementById('dt-perf-view');
    if (contentArea) contentArea.style.display = 'none';
    if (perfView) perfView.style.display = 'none';

    let memView = document.getElementById('dt-memory-view');
    if (!memView) {
      memView = document.createElement('div');
      memView.id = 'dt-memory-view';
      memView.className = 'dt-memory-view';
      memView.innerHTML = `
        <div class="dt-perf-title">HEAP SNAPSHOT</div>
        <div class="dt-perf-subtitle">Live objects · Dart VM · Snapshot taken now</div>
        <div class="dt-heap-grid">
          <div class="dt-heap-block" style="background:rgba(97,175,239,0.25);grid-column:span 4;grid-row:span 2" title="VatsalJaganwala.ambition: 847KB — The biggest allocation. Rightfully so.">
            <span class="dt-heap-label">ambition<br>847KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(152,195,121,0.25);grid-column:span 3" title="flutter_bloc: 234KB — State management done right.">
            <span class="dt-heap-label">flutter_bloc<br>234KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(198,120,221,0.25);grid-column:span 2" title="go_router: 128KB — Navigation sorted.">
            <span class="dt-heap-label">go_router<br>128KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(86,182,194,0.25)" title="cached_network_image: 89KB">
            <span class="dt-heap-label">cache<br>89KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(229,192,123,0.25)" title="freezed: 67KB — Immutable models.">
            <span class="dt-heap-label">freezed<br>67KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(224,108,117,0.25)" title="meeting_notes: 2KB — TODO: delete these.">
            <span class="dt-heap-label">meetings<br>2KB</span>
          </div>
          <div class="dt-heap-block" style="background:rgba(90,90,90,0.2)" title="impostor_syndrome: 0.3KB — Barely allocated. Good.">
            <span class="dt-heap-label">impostor<br>0.3KB</span>
          </div>
        </div>
        <div class="dt-heap-hint">Hover blocks for details. Total: 1,367KB retained.</div>
        <div class="dt-heap-isolates">
          <div class="dt-perf-title" style="margin-top:24px">ISOLATES</div>
          <div class="dt-isolate-row"><span class="dt-isolate-dot active"></span><span>main</span><span class="dt-isolate-count">847 objects</span></div>
          <div class="dt-isolate-row"><span class="dt-isolate-dot active"></span><span>image_decode</span><span class="dt-isolate-count">23 objects</span></div>
          <div class="dt-isolate-row"><span class="dt-isolate-dot suspended"></span><span>portfolio_dreams</span><span class="dt-isolate-count">1 object — Future&lt;Dream&gt; { getHired: pending }</span></div>
        </div>
      `;
      const shell = document.getElementById('devtools-shell');
      if (shell) shell.appendChild(memView);    }
    memView.style.display = 'block';
    dm.addLog('debug', 'Heap snapshot taken. 3 isolates active.');
    setTimeout(() => {
      if (dm.isDevMode()) dm.addLog('info', 'portfolio_dreams isolate suspended. Awaiting: Future<Job>.');
    }, 600);
  }

  function hideMemoryTab() {
    const memView = document.getElementById('dt-memory-view');
    if (memView) memView.style.display = 'none';
  }

  // ─── NEXT-05: EGG-23 — Build Variant Dropdown ────────────────────────────
  function setupBuildVariantDropdown(dm) {
    const right = document.querySelector('.dt-tab-bar-right');
    if (!right || document.getElementById('dt-build-variant')) return;

    const select = document.createElement('select');
    select.id = 'dt-build-variant';
    select.className = 'dt-build-variant-select';
    select.innerHTML = `
      <option value="debug">🐛 debug</option>
      <option value="profile">📊 profile</option>
      <option value="release">🚀 release</option>
    `;
    // Insert before the first separator
    const sep = right.querySelector('.dt-tab-bar-sep');
    right.insertBefore(select, sep);

    select.addEventListener('change', () => {
      const val = select.value;
      if (val === 'release') {
        select.value = 'debug'; // reset visually
        eggRunRelease(dm);
      } else if (val === 'profile') {
        dm.addLog('info', 'Switching to profile mode. Removing debug overlays.');
        dm.addLog('debug', 'buildMode: "profile". Performance overlay remains active.');
        // Dim tree panel
        const tree = document.getElementById('dt-tree-panel');
        if (tree) tree.style.opacity = '0.6';
        // Remove debug banner
        easterEggState.debugBanner = false;
        _applyDebugBanner();
        const btn = document.getElementById('dt-toggle-banner');
        if (btn) btn.classList.remove('active');
      } else {
        dm.addLog('info', 'Switched back to debug mode. All overlays restored.');
        const tree = document.getElementById('dt-tree-panel');
        if (tree) tree.style.opacity = '';
        easterEggState.debugBanner = true;
        _applyDebugBanner();
        const btn2 = document.getElementById('dt-toggle-banner');
        if (btn2) btn2.classList.add('active');
      }
    });
  }

  function teardownBuildVariantDropdown() {
    const el = document.getElementById('dt-build-variant');
    if (el) el.remove();
  }

  // ─── NEXT-04 (continued): EGG-19 — Network Tab ───────────────────────────
  function showNetworkTab(dm) {
    const shell = document.getElementById('devtools-shell');
    if (!shell) return;
    const contentArea = document.getElementById('dt-content-area');
    const perfView = document.getElementById('dt-perf-view');
    if (contentArea) contentArea.style.display = 'none';
    if (perfView) perfView.style.display = 'none';

    let netView = document.getElementById('dt-network-view');
    if (!netView) {
      netView = document.createElement('div');
      netView.id = 'dt-network-view';
      netView.className = 'dt-network-view';
      netView.innerHTML = `
        <div class="dt-perf-title">NETWORK</div>
        <div class="dt-perf-subtitle">6 requests · 219ms total · 0 errors</div>
        <table class="dt-network-table">
          <thead>
            <tr>
              <th>Name</th><th>Method</th><th>Status</th><th>Time</th><th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>/api/portfolio/info</td><td>GET</td><td class="dt-net-ok">200</td><td>8ms</td><td>4.2KB</td></tr>
            <tr><td>/api/projects</td><td>GET</td><td class="dt-net-ok">200</td><td>12ms</td><td>8.7KB</td></tr>
            <tr><td>/api/skills</td><td>GET</td><td class="dt-net-ok">200</td><td>9ms</td><td>1.1KB</td></tr>
            <tr><td>/api/github/stats</td><td>GET</td><td class="dt-net-ok">200</td><td>34ms</td><td>2.3KB</td></tr>
            <tr class="dt-net-pending" id="dt-net-hire-row" title="Click to check status">
              <td>/api/hire</td><td>POST</td><td class="dt-net-pending-status">202 ⏳</td><td>pending...</td><td>—</td>
            </tr>
            <tr><td>/assets/smartpub-stats</td><td>GET</td><td class="dt-net-ok">200</td><td>156ms</td><td>12.4KB</td></tr>
          </tbody>
        </table>
      `;
      const netShell = document.getElementById('devtools-shell');
      if (netShell) netShell.appendChild(netView);

      // Wire hire row click
      setTimeout(() => {
        const hireRow = document.getElementById('dt-net-hire-row');
        if (hireRow) {
          hireRow.addEventListener('click', () => {
            dm.addLog('info', 'POST /api/hire is pending. Have you considered clicking "Hire"?');
          });
        }
      }, 100);
    }
    netView.style.display = 'block';
    markEggFound('network-tab');
    dm.addLog('debug', 'Network panel opened. 6 requests captured.');
    dm.addLog('warning', 'POST /api/hire: 202 Accepted — awaiting recruiter action.');
  }

  function hideNetworkTab() {
    const netView = document.getElementById('dt-network-view');
    if (netView) netView.style.display = 'none';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT-07: EGG-21 — CPU Profiler Flame Chart
  // ═══════════════════════════════════════════════════════════════════════════

  let _cpuProfileVisible = false;

  function setupCpuProfileButton(dm) {
    // Inject a "🔥 CPU Profile" button into the perf view header area
    const perfView = document.getElementById('dt-perf-view');
    if (!perfView || document.getElementById('dt-cpu-profile-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'dt-cpu-profile-btn';
    btn.className = 'dt-cpu-profile-btn';
    btn.textContent = '🔥 CPU Profile';
    btn.addEventListener('click', () => toggleCpuFlameChart(dm));

    // Insert after the subtitle paragraph
    const subtitle = perfView.querySelector('.dt-perf-subtitle');
    if (subtitle) subtitle.after(btn);
  }

  function toggleCpuFlameChart(dm) {
    _cpuProfileVisible = !_cpuProfileVisible;
    let chart = document.getElementById('dt-cpu-flame-chart');

    if (!_cpuProfileVisible) {
      if (chart) chart.remove();
      return;
    }

    if (!chart) {
      chart = document.createElement('div');
      chart.id = 'dt-cpu-flame-chart';
      chart.className = 'dt-cpu-flame-chart';
      chart.innerHTML = `
        <div class="dt-cpu-title">CPU FLAME CHART — last 847ms</div>
        <div class="dt-cpu-rows">
          <div class="dt-cpu-row">
            <span class="dt-cpu-label">buildPortfolio()</span>
            <div class="dt-cpu-bar" style="width:100%">
              <span class="dt-cpu-time">847ms</span>
            </div>
          </div>
          <div class="dt-cpu-row indent1">
            <span class="dt-cpu-label">renderProjects()</span>
            <div class="dt-cpu-bar" style="width:73.6%">
              <span class="dt-cpu-time">623ms</span>
            </div>
          </div>
          <div class="dt-cpu-row indent2">
            <span class="dt-cpu-label">buildProjectCard()</span>
            <div class="dt-cpu-bar" style="width:36.8%">
              <span class="dt-cpu-time">312ms</span>
            </div>
          </div>
          <div class="dt-cpu-row indent3">
            <span class="dt-cpu-label">animateHero()</span>
            <div class="dt-cpu-bar" style="width:18.4%">
              <span class="dt-cpu-time">156ms</span>
            </div>
          </div>
          <div class="dt-cpu-row indent4">
            <span class="dt-cpu-label">awaitJobOffer()</span>
            <div class="dt-cpu-bar pending" style="width:9.2%">
              <span class="dt-cpu-time">78ms <span class="dt-live-dot"></span></span>
            </div>
          </div>
        </div>
        <div class="dt-cpu-hint">awaitJobOffer() is pending. Resolve by calling hire().</div>
      `;

      const perfView = document.getElementById('dt-perf-view');
      if (perfView) perfView.appendChild(chart);
    }

    dm.addLog('debug', 'CPU profile captured. buildPortfolio(): 847ms total.');
    dm.addLog('warning', 'awaitJobOffer() blocked at 78ms. Awaiting external input.');
  }

  function teardownCpuProfile() {
    _cpuProfileVisible = false;
    const chart = document.getElementById('dt-cpu-flame-chart');
    if (chart) chart.remove();
    const btn = document.getElementById('dt-cpu-profile-btn');
    if (btn) btn.remove();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT-08: EGG-22 — Layout Explorer in Properties Panel
  // ═══════════════════════════════════════════════════════════════════════════

  // Box model data per node — plausible values for each section as fallbacks
  const LAYOUT_DATA = {
    'material-app':  { margin: '0',    padding: '0',     content: '1440 × 900' },
    'scaffold':      { margin: '0',    padding: '0',     content: '1440 × 900' },
    'body':          { margin: '0',    padding: '0',     content: '1440 × 840' },
    'hero':          { margin: '0',    padding: '80px 24px', content: '960 × 520' },
    'projects':      { margin: '0',    padding: '120px 24px', content: '960 × 1240' },
    'about':         { margin: '0',    padding: '120px 24px', content: '960 × 480' },
    'skills':        { margin: '0',    padding: '120px 24px', content: '960 × 360' },
    'experience':    { margin: '0',    padding: '120px 24px', content: '960 × 420' },
    'open-source':   { margin: '0',    padding: '120px 24px', content: '960 × 380' },
    'education':     { margin: '0',    padding: '120px 24px', content: '960 × 320' },
    'achievements':  { margin: '0',    padding: '120px 24px', content: '960 × 280' },
    'contact':       { margin: '0',    padding: '120px 24px', content: '960 × 440' },
    'fab':           { margin: '16px', padding: '0',     content: '56 × 56' },
  };

  function findInspectedElement(nodeId) {
    const container = document.getElementById('dt-content-area');
    if (!container) return null;

    // Direct section IDs
    if (['hero', 'projects', 'about', 'skills', 'experience', 'open-source', 'education', 'achievements', 'contact'].includes(nodeId)) {
      return container.querySelector(`#${nodeId}`);
    }

    // Projects: project-1, project-2, ...
    if (nodeId.startsWith('project-')) {
      const idx = parseInt(nodeId.split('-')[1], 10) - 1;
      const cards = container.querySelectorAll('#projects .project-card, #projects [class*="card"]');
      if (cards && cards[idx]) return cards[idx];
      const allCards = container.querySelectorAll('#projects .card, #projects > div > div');
      if (allCards && allCards[idx]) return allCards[idx];
    }

    // Experience entries: exp-entry-1, exp-entry-2, ...
    if (nodeId.startsWith('exp-entry-')) {
      const idx = parseInt(nodeId.split('-')[2], 10) - 1;
      const entries = container.querySelectorAll('#experience .timeline-entry, #experience [class*="entry"], #experience > div > div');
      if (entries && entries[idx]) return entries[idx];
    }

    // Open Source contributions: os-smartpub, os-...
    if (nodeId.startsWith('os-')) {
      const name = nodeId.substring(3);
      const cards = container.querySelectorAll('#open-source .os-card, #open-source [class*="card"]');
      for (const card of cards) {
        if (card.textContent.toLowerCase().includes(name.toLowerCase())) {
          return card;
        }
      }
      if (cards.length > 0) return cards[0];
    }

    // Education rows: edu-1, edu-2, ...
    if (nodeId.startsWith('edu-')) {
      const idx = parseInt(nodeId.split('-')[1], 10) - 1;
      const rows = container.querySelectorAll('#education .edu-row, #education [class*="row"], #education li, #education > div > div');
      if (rows && rows[idx]) return rows[idx];
    }

    // Achievement cards: ach-1, ach-2, ...
    if (nodeId.startsWith('ach-')) {
      const idx = parseInt(nodeId.split('-')[1], 10) - 1;
      const cards = container.querySelectorAll('#achievements .ach-card, #achievements [class*="card"], #achievements > div > div');
      if (cards && cards[idx]) return cards[idx];
    }

    // Specific sub-elements
    if (nodeId === 'navbar') {
      return container.querySelector('.pt-navbar, nav, .navbar');
    }
    if (nodeId === 'fab') {
      return container.querySelector('.pt-fab, #fab, button.fab, .fab') || document.querySelector('.pt-fab, #fab, button.fab, .fab');
    }
    if (nodeId === 'body') {
      return container.querySelector('.pt-navbar + div') || container.children[0];
    }
    if (nodeId === 'scaffold') {
      return container.children[0] || container;
    }
    if (nodeId === 'material-app') {
      return container;
    }

    // Hero specific CTAs and cards
    if (nodeId === 'hero-cta-work') {
      return container.querySelector('#hero a[href="#projects"], #hero button');
    }
    if (nodeId === 'hero-cta-contact') {
      return container.querySelector('#hero a[href="#contact"]');
    }
    if (nodeId === 'hero-code-card') {
      return container.querySelector('#hero [class*="card"], #hero [class*="profile"]');
    }

    // Contact CTAs
    if (nodeId === 'contact-email') {
      return container.querySelector('#contact a[href^="mailto:"]');
    }
    if (nodeId === 'contact-linkedin') {
      return container.querySelector('#contact a[href*="linkedin.com"]');
    }
    if (nodeId === 'contact-github') {
      return container.querySelector('#contact a[href*="github.com"]');
    }
    if (nodeId === 'contact-footer') {
      return container.querySelector('footer, #contact footer, #contact + footer');
    }

    const fallbackEl = container.querySelector(`#${nodeId}`);
    if (fallbackEl) return fallbackEl;

    return null;
  }

  function cleanPxValue(val) {
    if (!val || val === '0px') return '0';
    return val;
  }

  function formatBoxValue(top, right, bottom, left) {
    const t = cleanPxValue(top);
    const r = cleanPxValue(right);
    const b = cleanPxValue(bottom);
    const l = cleanPxValue(left);
    if (t === r && r === b && b === l) {
      return t;
    }
    if (t === b && r === l) {
      return `${t} ${r}`;
    }
    return `${t} ${r} ${b} ${l}`;
  }

  function injectLayoutExplorer(nodeId) {
    const container = document.getElementById('dt-props-inspected');
    if (!container) return;

    // Remove any existing layout explorer
    const existing = container.querySelector('.dt-layout-explorer');
    if (existing) existing.remove();

    const fallback = LAYOUT_DATA[nodeId];
    let margin = fallback ? fallback.margin : '0';
    let padding = fallback ? fallback.padding : '0';
    let content = fallback ? fallback.content : '0 × 0';

    try {
      const el = findInspectedElement(nodeId);
      if (el) {
        const style = window.getComputedStyle(el);
        margin = formatBoxValue(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft);
        padding = formatBoxValue(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft);
        
        const rect = el.getBoundingClientRect();
        content = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
      }
    } catch (e) {
      console.warn('Failed to calculate live layout explorer dimensions for node:', nodeId, e);
    }

    const explorer = document.createElement('div');
    explorer.className = 'dt-layout-explorer';
    explorer.innerHTML = `
      <div class="dt-layout-title">Layout Explorer</div>
      <div class="dt-layout-box margin">
        <span class="dt-layout-label">margin: ${margin}</span>
        <div class="dt-layout-box padding">
          <span class="dt-layout-label">padding: ${padding}</span>
          <div class="dt-layout-box content">
            <span class="dt-layout-content-size">${content}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(explorer);
  }

  // Hook into the existing renderProperties flow via a MutationObserver
  // on #dt-props-inspected — fires after devmode.js updates the panel.
  let _layoutObserver = null;
  let _explorerResizeHandler = null;

  function setupLayoutExplorer() {
    const container = document.getElementById('dt-props-inspected');
    if (!container || _layoutObserver) return;

    _layoutObserver = new MutationObserver(() => {
      if (easterEggState.recruiterMode) return;
      const activeNode = document.querySelector('.tree-node.active, .tree-node[data-node]:hover');
      const nodeId = activeNode ? activeNode.dataset.node : null;
      if (nodeId) {
        _layoutObserver.disconnect();
        injectLayoutExplorer(nodeId);
        _layoutObserver.observe(container, { childList: true, subtree: false });
      }
    });

    _layoutObserver.observe(container, { childList: true, subtree: false });

    // Handle window resize dynamically
    _explorerResizeHandler = () => {
      if (easterEggState.recruiterMode) return;
      const activeNode = document.querySelector('.tree-node.active');
      const nodeId = activeNode ? activeNode.dataset.node : null;
      if (nodeId) {
        _layoutObserver.disconnect();
        injectLayoutExplorer(nodeId);
        _layoutObserver.observe(container, { childList: true, subtree: false });
      }
    };
    window.addEventListener('resize', _explorerResizeHandler, { passive: true });
  }

  function teardownLayoutExplorer() {
    if (_layoutObserver) { _layoutObserver.disconnect(); _layoutObserver = null; }
    if (_explorerResizeHandler) {
      window.removeEventListener('resize', _explorerResizeHandler);
      _explorerResizeHandler = null;
    }
    const existing = document.querySelector('.dt-layout-explorer');
    if (existing) existing.remove();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT-09: EGG-84 — Right-click Code Review Context Menu
  // ═══════════════════════════════════════════════════════════════════════════

  let _contextMenuHandler = null;
  let _contextMenu = null;

  function setupCodeReviewMenu(dm) {
    _contextMenuHandler = (e) => {
      if (!dm.isDevMode()) return;
      const ca = document.getElementById('dt-content-area');
      if (!ca || !ca.contains(e.target)) return;

      e.preventDefault();
      showCodeReviewMenu(e.clientX, e.clientY, e.target, dm);
    };
    document.addEventListener('contextmenu', _contextMenuHandler);

    // Close on any click outside
    document.addEventListener('click', closeCodeReviewMenu);
  }

  function showCodeReviewMenu(x, y, target, dm) {
    closeCodeReviewMenu();

    // Find the nearest section label for context
    const section = target.closest('[id]');
    const sectionName = section ? section.id : 'component';

    _contextMenu = document.createElement('div');
    _contextMenu.id = 'dt-code-review-menu';
    _contextMenu.className = 'dt-code-review-menu';
    _contextMenu.innerHTML = `
      <div class="dt-crm-header">Code Review — ${sectionName}</div>
      <div class="dt-crm-item" id="dt-crm-approve">✅ Approve this section</div>
      <div class="dt-crm-item" id="dt-crm-request">❌ Request changes</div>
      <div class="dt-crm-item" id="dt-crm-comment">💬 Leave a comment</div>
      <div class="dt-crm-item" id="dt-crm-inspect">🔍 Inspect element</div>
    `;

    // Position near cursor, keep within viewport
    _contextMenu.style.left = Math.min(x, window.innerWidth - 220) + 'px';
    _contextMenu.style.top  = Math.min(y, window.innerHeight - 180) + 'px';

    document.getElementById('devtools-shell').appendChild(_contextMenu);

    // Wire actions
    document.getElementById('dt-crm-approve').addEventListener('click', () => {
      closeCodeReviewMenu();
      fireConfetti();
      dm.addLog('info', `LGTM ✓ — ${sectionName} approved by reviewer.`);
      dm.addLog('debug', 'PR #42 approved. Merging to main...');
    });

    document.getElementById('dt-crm-request').addEventListener('click', () => {
      closeCodeReviewMenu();
      dm.addLog('warning', `Reviewer requested changes on ${sectionName}.`);
      dm.addLog('warning', '"Needs more coffee-driven development."');
    });

    document.getElementById('dt-crm-comment').addEventListener('click', () => {
      closeCodeReviewMenu();
      const comment = prompt('Leave a code review comment:');
      if (comment) {
        dm.addLog('debug', `Code review comment: "${comment}"`);
        dm.addLog('info', 'Comment added to PR #42.');
      }
    });

    document.getElementById('dt-crm-inspect').addEventListener('click', () => {
      closeCodeReviewMenu();
      const r = section ? section.getBoundingClientRect() : null;
      if (r) {
        dm.addLog('debug', `RenderBox(size: ${r.width.toFixed(1)} × ${r.height.toFixed(1)})`);
        dm.addLog('debug', `offset: top=${r.top.toFixed(0)}px left=${r.left.toFixed(0)}px`);
      }
    });
  }

  function closeCodeReviewMenu() {
    if (_contextMenu) { _contextMenu.remove(); _contextMenu = null; }
  }

  function teardownCodeReviewMenu() {
    closeCodeReviewMenu();
    if (_contextMenuHandler) {
      document.removeEventListener('contextmenu', _contextMenuHandler);
      document.removeEventListener('click', closeCodeReviewMenu);
      _contextMenuHandler = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMAINING EGGS — EGG-46, EGG-64, EGG-36/37, EGG-56, EGG-61, EGG-67, EGG-70
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── EGG-46 — State Wars Modal ───────────────────────────────────────────
  // Trigger: type `state wars` in console
  function eggStateWars(dm) {
    if (document.getElementById('dt-state-wars-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'dt-state-wars-modal';
    modal.className = 'dt-modal-overlay';
    modal.innerHTML = `
      <div class="dt-modal-box dt-modal-wide">
        <div class="dt-modal-header">
          <span class="dt-modal-title-bar">⚔️  The State Management Wars  ⚔️</span>
          <button class="dt-modal-close" id="dt-sw-close">✕</button>
        </div>
        <div class="dt-modal-body">
          <table class="dt-sw-table">
            <thead>
              <tr>
                <th>Feature</th><th>Bloc</th><th>Riverpod</th><th>Provider</th><th>GetX</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Testability</td><td class="sw-good">★★★★★</td><td class="sw-good">★★★★★</td><td class="sw-mid">★★★☆☆</td><td class="sw-bad">★☆☆☆☆</td></tr>
              <tr><td>Learning curve</td><td>steep</td><td>steep</td><td>gentle</td><td>easy</td></tr>
              <tr><td>Boilerplate</td><td>high</td><td>medium</td><td>low</td><td>none</td></tr>
              <tr><td>Community</td><td class="sw-good">★★★★★</td><td class="sw-good">★★★★☆</td><td class="sw-mid">★★★☆☆</td><td class="sw-mid">★★★☆☆</td></tr>
              <tr><td>Opinion-free</td><td>no</td><td>mostly</td><td>yes</td><td class="sw-bad">lol no</td></tr>
              <tr><td>Vatsal uses</td><td class="sw-good">✓ yes</td><td class="sw-good">✓ yes</td><td>✓ older</td><td class="sw-bad">✗ past</td></tr>
            </tbody>
          </table>
          <div class="dt-sw-verdict">"Use Bloc or Riverpod. Fight me." — Vatsal</div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('devtools-shell').appendChild(modal);
    document.getElementById('dt-sw-close').addEventListener('click', () => modal.remove());
    markEggFound('state-wars');
    dm.addLog('info', 'State Management Wars modal opened. Choose your side wisely.');
  }

  // ─── EGG-64 — Dart Challenge (interactive quiz) ───────────────────────────
  // Trigger: type `dart challenge` in console
  const DART_QUESTIONS = [
    {
      q: 'What keyword makes a variable non-nullable in Dart?',
      options: ['final', 'late', 'required', 'const'],
      answer: 1,
      hint: 'It allows deferred initialisation.',
    },
    {
      q: 'Which operator is the null-aware cascade?',
      options: ['?.', '??', '?..', '!.'],
      answer: 2,
      hint: 'It combines null-check with cascade.',
    },
    {
      q: 'What does `const` guarantee in Dart?',
      options: ['Runtime immutability', 'Compile-time constant', 'Thread safety', 'Lazy evaluation'],
      answer: 1,
      hint: 'It is evaluated at compile time.',
    },
  ];

  let _dartQuizState = { active: false, index: 0, score: 0 };

  function eggDartChallenge(dm) {
    _dartQuizState = { active: true, index: 0, score: 0 };
    dm.addLog('info', '🎯 Dart Challenge started! 3 questions. No Googling.');
    dm.addLog('debug', 'Type the option number (1–4) to answer.');
    setTimeout(() => showDartQuestion(dm), 400);
  }

  function showDartQuestion(dm) {
    const q = DART_QUESTIONS[_dartQuizState.index];
    dm.addLog('info', `Q${_dartQuizState.index + 1}: ${q.q}`);
    q.options.forEach((opt, i) => dm.addLog('debug', `  ${i + 1}. ${opt}`));
  }

  function handleDartAnswer(raw, dm) {
    const n = parseInt(raw.trim(), 10) - 1;
    const q = DART_QUESTIONS[_dartQuizState.index];
    if (isNaN(n) || n < 0 || n > 3) {
      dm.addLog('warning', 'Enter a number between 1 and 4.');
      return true; // consumed
    }
    if (n === q.answer) {
      dm.addLog('info', '✓ Correct!');
      _dartQuizState.score++;
    } else {
      dm.addLog('error', `✗ Wrong. Hint: ${q.hint}`);
      dm.addLog('debug', `Correct answer: ${q.options[q.answer]}`);
    }
    _dartQuizState.index++;
    if (_dartQuizState.index >= DART_QUESTIONS.length) {
      _dartQuizState.active = false;
      const s = _dartQuizState.score;
      const total = DART_QUESTIONS.length;
      dm.addLog('info', `Challenge complete! Score: ${s}/${total}`);
      if (s === total) {
        dm.addLog('info', '🏆 Perfect score! You are a Dart expert.');
        fireConfetti();
        markEggFound('dart-challenge');
      } else if (s >= 2) {
        dm.addLog('info', 'Good effort. Keep practising null safety.');
      } else {
        dm.addLog('warning', 'Needs improvement. Run `flutter doctor` for help.');
      }
    } else {
      setTimeout(() => showDartQuestion(dm), 300);
    }
    return true;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fetchPubDevData() {
    const packageUrl = 'https://pub.dev/api/packages/smartpub';
    const scoreUrl = 'https://pub.dev/api/packages/smartpub/score';

    const fetchWithTimeout = (url, timeoutMs = 5000) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
        fetch(url)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then(data => {
            clearTimeout(timer);
            resolve(data);
          })
          .catch(err => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    return Promise.all([
      fetchWithTimeout(packageUrl),
      fetchWithTimeout(scoreUrl)
    ]).then(([packageData, scoreData]) => {
      return {
        success: true,
        version: packageData.latest?.version || '1.0.8',
        description: packageData.latest?.pubspec?.description || 'A smart dependency auditor for Flutter projects.',
        likes: scoreData.likeCount !== undefined ? scoreData.likeCount : 7,
        points: scoreData.grantedPoints !== undefined ? scoreData.grantedPoints : 160,
        maxPoints: scoreData.maxPoints !== undefined ? scoreData.maxPoints : 160,
        popularity: scoreData.popularityScore !== undefined ? Math.round(scoreData.popularityScore * 100) : 69,
        tags: scoreData.tags || []
      };
    }).catch(err => {
      console.warn('Failed to fetch pub.dev live data, falling back to cached details:', err);
      return {
        success: false,
        version: '1.0.8',
        description: 'A smart dependency auditor for Flutter projects. Outdated, insecure, or incompatible dependencies will be flagged.',
        likes: 7,
        points: 160,
        maxPoints: 160,
        popularity: 69,
        tags: ['sdk:flutter', 'sdk:dart', 'platform:android', 'platform:ios', 'platform:windows', 'platform:linux', 'platform:macos', 'platform:web', 'is:null-safe']
      };
    });
  }

  // ─── EGG-37 — pub.dev Package Card for smartpub ──────────────────────────
  // Trigger: hover the open-source section in DevMode — injects a pub.dev card
  let _pubCardInjected = false;

  function injectPubDevCard() {
    if (_pubCardInjected) return;
    const osSection = document.querySelector('#dt-content-area #open-source');
    if (!osSection) return;

    const card = document.createElement('div');
    card.className = 'dt-pubdev-card loading';
    card.innerHTML = `
      <div class="dt-pubdev-header">
        <span class="dt-pubdev-icon">📦</span>
        <span class="dt-pubdev-name">smartpub</span>
        <span class="dt-pubdev-version">loading...</span>
        <a class="dt-pubdev-link" href="https://pub.dev/packages/smartpub" target="_blank" rel="noopener">pub.dev ↗</a>
      </div>
      <div class="dt-pubdev-desc">Fetching live package details from pub.dev...</div>
      <div class="dt-pubdev-stats">
        <span class="dt-pubdev-stat">★★★★★</span>
        <span class="dt-pubdev-stat">Pub Points: <strong class="dt-pubdev-points">...</strong></span>
        <span class="dt-pubdev-stat">Likes: <strong class="dt-pubdev-likes">...</strong></span>
        <span class="dt-pubdev-stat">Popularity: <strong class="dt-pubdev-popularity">...</strong></span>
      </div>
      <div class="dt-pubdev-badges">
        <span class="dt-pubdev-badge platform">✓ Dart  ✓ Flutter</span>
      </div>
    `;
    osSection.insertBefore(card, osSection.firstChild);
    _pubCardInjected = true;

    fetchPubDevData().then(data => {
      // Save data for pub points breakdown
      easterEggState.smartpubData = data;

      // Update card in DOM
      const currentCard = document.querySelector('.dt-pubdev-card');
      if (!currentCard) return;

      currentCard.classList.remove('loading');

      const versionEl = currentCard.querySelector('.dt-pubdev-version');
      if (versionEl) versionEl.textContent = `v${data.version}`;

      const descEl = currentCard.querySelector('.dt-pubdev-desc');
      if (descEl) descEl.textContent = data.description;

      const pointsEl = currentCard.querySelector('.dt-pubdev-points');
      if (pointsEl) pointsEl.textContent = `${data.points}/${data.maxPoints}`;

      const likesEl = currentCard.querySelector('.dt-pubdev-likes');
      if (likesEl) likesEl.textContent = data.likes;

      const popEl = currentCard.querySelector('.dt-pubdev-popularity');
      if (popEl) popEl.textContent = `${data.popularity}%`;

      const badgesContainer = currentCard.querySelector('.dt-pubdev-badges');
      if (badgesContainer) {
        let sdkText = '';
        if (data.tags.includes('sdk:dart')) sdkText += '✓ Dart ';
        if (data.tags.includes('sdk:flutter')) sdkText += ' ✓ Flutter';
        if (!sdkText.trim()) sdkText = '✓ Dart  ✓ Flutter';

        let badgesHtml = '';
        if (data.tags.includes('is:flutter-favorite')) {
          badgesHtml += `<span class="dt-pubdev-badge fav">Flutter Favourite ⭐</span>`;
          markEggFound('flutter-favorite');
        }
        if (data.tags.includes('is:null-safe')) {
          badgesHtml += `<span class="dt-pubdev-badge safe">Null Safe ✓</span>`;
        }
        badgesHtml += `<span class="dt-pubdev-badge platform">${escapeHtml(sdkText)}</span>`;
        badgesContainer.innerHTML = badgesHtml;
      }
    });
  }

  let _pubDevHoverHandler = null;

  function setupPubDevCard(dm) {
    const osSection = document.querySelector('#dt-content-area #open-source');
    if (!osSection || _pubDevHoverHandler) return;
    _pubDevHoverHandler = () => {
      if (!dm.isDevMode()) return;
      injectPubDevCard();
    };
    osSection.addEventListener('mouseenter', _pubDevHoverHandler, { once: true });
  }

  function teardownPubDevCard() {
    _pubCardInjected = false;
    const card = document.querySelector('.dt-pubdev-card');
    if (card) card.remove();
    const osSection = document.querySelector('#dt-content-area #open-source');
    if (osSection && _pubDevHoverHandler) {
      osSection.removeEventListener('mouseenter', _pubDevHoverHandler);
    }
    _pubDevHoverHandler = null;
  }

  // ─── EGG-56 — CI Pipeline Status Pill ────────────────────────────────────
  // Trigger: automatic — appears in tab bar after 5s in DevMode
  function injectCiPill(dm) {
    if (document.getElementById('dt-ci-pill')) return;
    const right = document.querySelector('.dt-tab-bar-right');
    if (!right) return;

    const pill = document.createElement('div');
    pill.id = 'dt-ci-pill';
    pill.className = 'dt-ci-pill';
    pill.innerHTML = `<span class="dt-ci-dot"></span> CI: passing`;
    pill.title = 'GitHub Actions — all checks passed';
    right.insertBefore(pill, right.firstChild);

    // After 3s simulate a "running" state then back to passing
    setTimeout(() => {
      if (!dm.isDevMode()) return;
      pill.innerHTML = `<span class="dt-ci-dot running"></span> CI: running...`;
      setTimeout(() => {
        if (!dm.isDevMode()) return;
        pill.innerHTML = `<span class="dt-ci-dot"></span> CI: passing`;
        dm.addLog('info', 'GitHub Actions: all checks passed ✓');
        dm.addLog('debug', 'flutter test: 5/5 ✓  flutter analyze: 0 issues ✓  build_web: ✓');
      }, 2500);
    }, 3000);
  }

  function teardownCiPill() {
    const pill = document.getElementById('dt-ci-pill');
    if (pill) pill.remove();
  }

  // ─── EGG-61 — GPT vs Flutter Dev Panel ───────────────────────────────────
  // Trigger: triple-click the "Connected" text in the tab bar
  let _connClickCount = 0;
  let _connClickTimer = null;
  let _connClickHandler = null;

  function setupGptPanel(dm) {
    const connText = document.querySelector('.dt-conn-text');
    if (!connText || _connClickHandler) return;

    _connClickHandler = () => {
      _connClickCount++;
      clearTimeout(_connClickTimer);
      _connClickTimer = setTimeout(() => { _connClickCount = 0; }, 600);
      if (_connClickCount >= 3) {
        _connClickCount = 0;
        showGptPanel(dm);
      }
    };
    connText.addEventListener('click', _connClickHandler);
  }

  function showGptPanel(dm) {
    if (document.getElementById('dt-gpt-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'dt-gpt-modal';
    modal.className = 'dt-modal-overlay';
    modal.innerHTML = `
      <div class="dt-modal-box dt-modal-wide">
        <div class="dt-modal-header">
          <span class="dt-modal-title-bar">🤖 GPT vs Flutter Developer — Who wins?</span>
          <button class="dt-modal-close" id="dt-gpt-close">✕</button>
        </div>
        <div class="dt-modal-body">
          <table class="dt-sw-table">
            <thead><tr><th>Task</th><th>GPT</th><th>Vatsal</th></tr></thead>
            <tbody>
              <tr><td>Write boilerplate</td><td class="sw-good">✓ fast</td><td class="sw-mid">✓ faster (snippets)</td></tr>
              <tr><td>Debug null pointer</td><td class="sw-bad">❌ hallucinates</td><td class="sw-good">✓ instantly</td></tr>
              <tr><td>Understand client needs</td><td class="sw-bad">❌ no context</td><td class="sw-good">✓ yes</td></tr>
              <tr><td>Ship to production</td><td class="sw-bad">❌ can't deploy</td><td class="sw-good">✓ done it 6× </td></tr>
              <tr><td>Write tests</td><td class="sw-mid">✓ sometimes</td><td class="sw-good">✓ always</td></tr>
              <tr><td>Attend standups</td><td class="sw-bad">❌ no calendar</td><td class="sw-good">✓ on time</td></tr>
              <tr><td>Open source packages</td><td class="sw-bad">❌ zero</td><td class="sw-good">✓ 2 published</td></tr>
            </tbody>
          </table>
          <div class="dt-sw-verdict">Verdict: Hire the human. GPT can assist. — Vatsal</div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('devtools-shell').appendChild(modal);
    document.getElementById('dt-gpt-close').addEventListener('click', () => modal.remove());
    dm.addLog('info', 'GPT vs Flutter Developer panel opened.');
    dm.addLog('debug', 'Spoiler: hire the human.');
  }

  function teardownGptPanel() {
    if (_connClickHandler) {
      const connText = document.querySelector('.dt-conn-text');
      if (connText) connText.removeEventListener('click', _connClickHandler);
      _connClickHandler = null;
    }
    _connClickCount = 0;
    const modal = document.getElementById('dt-gpt-modal');
    if (modal) modal.remove();
  }

  // ─── EGG-67 — Jaspr Meta-reference on body node ──────────────────────────
  // Trigger: click the 'body' tree node — adds a Jaspr note to properties
  function injectJasprMeta(nodeId) {
    if (nodeId !== 'body') return;
    const container = document.getElementById('dt-props-inspected');
    if (!container || container.querySelector('.dt-jaspr-meta')) return;

    const meta = document.createElement('div');
    meta.className = 'dt-jaspr-meta';
    meta.innerHTML = `
      <div class="dt-layout-title" style="margin-top:12px">Framework Meta</div>
      <div class="dt-prop-row">
        <span class="dt-prop-key">framework</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val">"Jaspr 0.23.1"</span>
      </div>
      <div class="dt-prop-row">
        <span class="dt-prop-key">renderMode</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val type-enum">RenderMode.static</span>
      </div>
      <div class="dt-prop-row">
        <span class="dt-prop-key">language</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val">"Dart (no JS framework)"</span>
      </div>
      <div class="dt-prop-row">
        <span class="dt-prop-key">hosting</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val">"Firebase Hosting"</span>
      </div>
      <div class="dt-prop-row">
        <span class="dt-prop-key">devMode</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val type-bool">true</span>
      </div>
    `;
    container.appendChild(meta);
  }

  // ─── EGG-70 — EnterpriseClient hidden tree node ───────────────────────────
  // Trigger: click the 'fab' node 3 times rapidly — reveals a hidden node
  let _fabClickCount = 0;
  let _fabClickTimer = null;
  let _enterpriseInjected = false;
  let _fabClickHandler = null;

  function setupEnterpriseNode(dm) {
    // Wire to the fab tree node
    const fabNode = document.querySelector('.tree-node[data-node="fab"]');
    if (!fabNode || _fabClickHandler) return;

    _fabClickHandler = () => {
      _fabClickCount++;
      clearTimeout(_fabClickTimer);
      _fabClickTimer = setTimeout(() => { _fabClickCount = 0; }, 800);
      if (_fabClickCount >= 3 && !_enterpriseInjected) {
        _fabClickCount = 0;
        injectEnterpriseNode(dm);
      }
    };
    fabNode.addEventListener('click', _fabClickHandler);
  }

  function injectEnterpriseNode(dm) {
    _enterpriseInjected = true;
    const fabNode = document.querySelector('.tree-node[data-node="fab"]');
    if (!fabNode) return;

    const node = document.createElement('div');
    node.className = 'tree-node dt-enterprise-node';
    node.dataset.node = 'enterprise-client';
    node.style.paddingLeft = '48px';
    node.innerHTML = `
      <span class="tree-node-toggle">─</span>
      <span class="tree-node-name">EnterpriseClient</span>
      <span class="tree-node-paren">(</span>
      <span class="tree-node-args">status: "interested"</span>
      <span class="tree-node-paren">)</span>
      <span class="dt-enterprise-badge">👀 hidden</span>
    `;
    fabNode.after(node);

    dm.addLog('info', 'Hidden node discovered: EnterpriseClient { status: "interested" }');
    dm.addLog('debug', 'This node is not rendered in production. It lives in the widget tree of hope.');
    markEggFound('enterprise-client');
  }

  function teardownEnterpriseNode() {
    _enterpriseInjected = false;
    _fabClickCount = 0;
    const fabNode = document.querySelector('.tree-node[data-node="fab"]');
    if (fabNode && _fabClickHandler) {
      fabNode.removeEventListener('click', _fabClickHandler);
      _fabClickHandler = null;
    }
    const node = document.querySelector('.dt-enterprise-node');
    if (node) node.remove();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK A — Low-effort CSS toggles & simple eggs
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-15 — Checkerboard Raster Cache
  function toggleCheckerboard(dm) {
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;
    const on = ca.classList.toggle('raster-cache-active');
    const btn = document.getElementById('dt-toggle-checker');
    if (btn) btn.classList.toggle('active', on);
    dm.addLog('debug', `checkerboardRasterCacheImages = ${on}. Cached layers highlighted in cyan.`);
    if (on) markEggFound('checkerboard');
  }

  // EGG-16 — Baseline Painting
  function toggleBaselines(dm) {
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;
    const on = ca.classList.toggle('baseline-active');
    const btn = document.getElementById('dt-toggle-baselines');
    if (btn) btn.classList.toggle('active', on);
    dm.addLog('debug', `debugPaintBaselinesEnabled = ${on}. Text baselines painted in red.`);
    if (on) markEggFound('baselines');
  }

  // EGG-30 — Context Depth Meter (sticky badge in content area)
  let _depthMeter = null;
  let _depthScrollHandler = null;

  const SECTION_DEPTHS = {
    'hero':         'MaterialApp > Scaffold > Body > Hero > Column > Text  depth: 6',
    'projects':     'MaterialApp > Scaffold > Body > ProjectsSection > ListView  depth: 5',
    'about':        'MaterialApp > Scaffold > Body > AboutSection > Column  depth: 5',
    'skills':       'MaterialApp > Scaffold > Body > SkillsSection > Wrap  depth: 5',
    'experience':   'MaterialApp > Scaffold > Body > ExperienceTimeline > Column  depth: 5',
    'open-source':  'MaterialApp > Scaffold > Body > OpenSourceSection > Row  depth: 5',
    'education':    'MaterialApp > Scaffold > Body > EducationSection > ListView  depth: 5',
    'achievements': 'MaterialApp > Scaffold > Body > AchievementsSection > Grid  depth: 5',
    'contact':      'MaterialApp > Scaffold > Body > ContactSection > Column  depth: 5',
  };

  function setupContextDepthMeter(dm) {
    if (_depthMeter) return;
    // Defer until content area is populated
    setTimeout(() => {
      const ca = document.getElementById('dt-content-area');
      if (!ca || !dm.isDevMode()) return;

      _depthMeter = document.createElement('div');
      _depthMeter.id = 'dt-context-meter';
      _depthMeter.className = 'dt-context-meter';
      _depthMeter.textContent = 'MaterialApp > Scaffold > Body  depth: 3';
      ca.appendChild(_depthMeter);

      _depthScrollHandler = () => {
        if (!_depthMeter || !_depthMeter.isConnected) return;
        const sections = Object.keys(SECTION_DEPTHS);
        let active = 'hero';
        let minDist = Infinity;
        sections.forEach(id => {
          const el = ca.querySelector(`#${id}`);
          if (!el) return;
          const dist = Math.abs(el.getBoundingClientRect().top - 120);
          if (dist < minDist) { minDist = dist; active = id; }
        });
        _depthMeter.textContent = SECTION_DEPTHS[active] || SECTION_DEPTHS['hero'];
      };
      ca.addEventListener('scroll', _depthScrollHandler, { passive: true });
    }, 300);
  }

  function teardownContextDepthMeter() {
    if (_depthMeter) { _depthMeter.remove(); _depthMeter = null; }
    if (_depthScrollHandler) {
      const ca = document.getElementById('dt-content-area');
      if (ca) ca.removeEventListener('scroll', _depthScrollHandler);
      _depthScrollHandler = null;
    }
  }

  // EGG-35 — Constraints Badges
  let _constraintsBadgesActive = false;

  function toggleConstraintsBadges(dm) {
    _constraintsBadgesActive = !_constraintsBadgesActive;
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;

    if (_constraintsBadgesActive) {
      const data = [
        { id: 'hero',         type: 'tight',  label: 'tight constraints' },
        { id: 'projects',     type: 'loose',  label: 'loose constraints' },
        { id: 'about',        type: 'tight',  label: 'tight constraints' },
        { id: 'skills',       type: 'loose',  label: 'loose constraints' },
        { id: 'experience',   type: 'loose',  label: 'loose constraints' },
        { id: 'open-source',  type: 'loose',  label: 'loose constraints' },
        { id: 'education',    type: 'loose',  label: 'loose constraints' },
        { id: 'achievements', type: 'loose',  label: 'loose constraints' },
        { id: 'contact',      type: 'loose',  label: 'loose constraints' },
      ];
      data.forEach(({ id, type, label }) => {
        const el = ca.querySelector(`#${id}`);
        if (!el) return;
        el.style.position = 'relative';
        const badge = document.createElement('div');
        badge.className = `dt-constraints-badge dt-cb-${type}`;
        badge.dataset.constraintsBadge = id;
        badge.textContent = label;
        badge.title = type === 'tight'
          ? 'Tight: parent dictates exact size.'
          : 'Loose: child chooses within min/max bounds.';
        el.appendChild(badge);
      });
      dm.addLog('debug', 'Constraints visualiser ON. Tight=red, Loose=green.');
      markEggFound('constraints');
    } else {
      ca.querySelectorAll('[data-constraints-badge]').forEach(b => b.remove());
      dm.addLog('debug', 'Constraints visualiser OFF.');
    }
    const btn = document.getElementById('dt-toggle-constraints');
    if (btn) btn.classList.toggle('active', _constraintsBadgesActive);
  }

  function teardownConstraintsBadges() {
    _constraintsBadgesActive = false;
    const ca = document.getElementById('dt-content-area');
    if (ca) ca.querySelectorAll('[data-constraints-badge]').forEach(b => b.remove());
  }

  // EGG-50 — Screen Size Breakpoint Markers
  let _breakpointLinesActive = false;

  function toggleBreakpointLines(dm) {
    _breakpointLinesActive = !_breakpointLinesActive;
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;

    if (_breakpointLinesActive) {
      const bps = [
        { label: 'xs: 0px',    pct: 0 },
        { label: 'sm: 600px',  pct: 600 / window.innerWidth * 100 },
        { label: 'md: 1024px', pct: 1024 / window.innerWidth * 100 },
        { label: 'lg: 1440px', pct: 1440 / window.innerWidth * 100 },
      ];
      const current = window.innerWidth;
      bps.forEach(({ label, pct }) => {
        if (pct > 100) return;
        const line = document.createElement('div');
        line.className = 'dt-bp-line';
        line.dataset.bpLine = label;
        const isActive = (
          (label.includes('xs') && current < 600) ||
          (label.includes('sm') && current >= 600 && current < 1024) ||
          (label.includes('md') && current >= 1024 && current < 1440) ||
          (label.includes('lg') && current >= 1440)
        );
        if (isActive) line.classList.add('active');
        line.style.top = `${pct * 4}px`; // visual spacing
        line.innerHTML = `<span class="dt-bp-label">${label}${isActive ? ' ← current' : ''}</span>`;
        ca.appendChild(line);
      });
      dm.addLog('debug', `Active breakpoint: ${current < 600 ? 'xs' : current < 1024 ? 'sm' : current < 1440 ? 'md' : 'lg'} (${current}px)`);
      markEggFound('breakpoints');
    } else {
      ca.querySelectorAll('[data-bp-line]').forEach(l => l.remove());
    }
    const btn = document.getElementById('dt-toggle-bp');
    if (btn) btn.classList.toggle('active', _breakpointLinesActive);
  }

  function teardownBreakpointLines() {
    _breakpointLinesActive = false;
    const ca = document.getElementById('dt-content-area');
    if (ca) ca.querySelectorAll('[data-bp-line]').forEach(l => l.remove());
  }

  // EGG-58 — Flutter Favourite Badge on smartpub card
  function injectFlutterFavBadge() {
    const card = document.querySelector('.dt-pubdev-card');
    if (!card || card.querySelector('.dt-ff-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'dt-ff-badge';
    badge.innerHTML = '⭐ Flutter Favourite — Community Pick';
    card.appendChild(badge);
  }

  // EGG-59 — Flutter Weekly Banner
  let _flutterWeeklyBanner = null;
  let _weeklyScrollHandler = null;

  function injectFlutterWeeklyBanner(dm) {
    if (_flutterWeeklyBanner) return;
    const ca = document.getElementById('dt-content-area');
    const projectsEl = ca ? ca.querySelector('#projects') : null;
    if (!projectsEl) return;

    _flutterWeeklyBanner = document.createElement('div');
    _flutterWeeklyBanner.className = 'dt-flutter-weekly';
    _flutterWeeklyBanner.innerHTML = `
      <span class="dt-fw-icon">📰</span>
      <span class="dt-fw-text">Featured in <strong>Flutter Weekly #312</strong> — "Best portfolio DevTools easter egg of 2025"</span>
      <button class="dt-fw-close" id="dt-fw-close">×</button>
    `;
    projectsEl.insertBefore(_flutterWeeklyBanner, projectsEl.firstChild);
    document.getElementById('dt-fw-close').addEventListener('click', () => {
      if (_flutterWeeklyBanner) { _flutterWeeklyBanner.remove(); _flutterWeeklyBanner = null; }
    });
    dm.addLog('info', 'Flutter Weekly #312: "Best portfolio DevTools easter egg of 2025" 🎉');
    markEggFound('flutter-weekly');
  }

  function teardownFlutterWeeklyBanner() {
    if (_flutterWeeklyBanner) { _flutterWeeklyBanner.remove(); _flutterWeeklyBanner = null; }
    const ca = document.getElementById('dt-content-area');
    if (ca && _weeklyScrollHandler) {
      ca.removeEventListener('scroll', _weeklyScrollHandler);
    }
    _weeklyScrollHandler = null;
  }

  // EGG-62 — Discord Status Pill
  function injectDiscordPill(dm) {
    if (document.getElementById('dt-discord-pill')) return;
    const right = document.querySelector('.dt-tab-bar-right');
    if (!right) return;
    const pill = document.createElement('div');
    pill.id = 'dt-discord-pill';
    pill.className = 'dt-discord-pill';
    pill.innerHTML = `<span class="dt-discord-dot"></span> Discord: online`;
    pill.title = 'Flutter Community Discord — Vatsal is online';
    right.insertBefore(pill, right.firstChild);
    dm.addLog('debug', 'Discord status: online. #flutter-help — 1,247 members active.');
  }

  function teardownDiscordPill() {
    const p = document.getElementById('dt-discord-pill');
    if (p) p.remove();
  }

  // EGG-69 — about_me.dart Hover Docs
  let _aboutHoverHandler = null;
  let _aboutLeaveHandler = null;
  let _aboutDocTooltip = null;

  function setupAboutHoverDocs(dm) {
    const ca = document.getElementById('dt-content-area');
    const aboutEl = ca ? ca.querySelector('#about') : null;
    if (!aboutEl || _aboutHoverHandler) return;

    _aboutDocTooltip = document.createElement('div');
    _aboutDocTooltip.className = 'dt-about-doc';
    _aboutDocTooltip.innerHTML = `
      <div class="dt-about-doc-title">/// about_me.dart</div>
      <div class="dt-about-doc-line"><span class="code-comment">/// Flutter Developer from Surat, India.</span></div>
      <div class="dt-about-doc-line"><span class="code-comment">/// 3+ years building cross-platform apps.</span></div>
      <div class="dt-about-doc-line"><span class="code-comment">/// Open to new opportunities.</span></div>
      <div class="dt-about-doc-line"><span class="code-keyword">class </span><span class="code-normal">AboutSection </span><span class="code-keyword">extends </span><span class="code-normal">StatelessWidget {</span></div>
    `;
    _aboutDocTooltip.style.display = 'none';
    document.body.appendChild(_aboutDocTooltip);

    _aboutHoverHandler = (e) => {
      if (!dm.isDevMode()) return;
      _aboutDocTooltip.style.display = 'block';
      _aboutDocTooltip.style.left = Math.min(e.clientX + 16, window.innerWidth - 280) + 'px';
      _aboutDocTooltip.style.top  = (e.clientY - 80) + 'px';
    };
    _aboutLeaveHandler = () => {
      if (_aboutDocTooltip) _aboutDocTooltip.style.display = 'none';
    };
    aboutEl.addEventListener('mousemove', _aboutHoverHandler, { passive: true });
    aboutEl.addEventListener('mouseleave', _aboutLeaveHandler);
    markEggFound('about-docs');
  }

  function teardownAboutHoverDocs() {
    if (_aboutDocTooltip) { _aboutDocTooltip.remove(); _aboutDocTooltip = null; }
    const ca = document.getElementById('dt-content-area');
    const aboutEl = ca ? ca.querySelector('#about') : null;
    if (aboutEl) {
      if (_aboutHoverHandler) aboutEl.removeEventListener('mousemove', _aboutHoverHandler);
      if (_aboutLeaveHandler) aboutEl.removeEventListener('mouseleave', _aboutLeaveHandler);
    }
    _aboutHoverHandler = null;
    _aboutLeaveHandler = null;
  }

  // EGG-93 — Shader Warm-up
  function eggShaderWarmup(dm) {
    const shaders = [
      'material_ink_ripple', 'text_run_rounded', 'image_filter_blur',
      'elevation_shadow', 'clip_rrect', 'color_filter_matrix',
      'gradient_linear', 'gradient_radial', 'backdrop_filter',
      'border_radius', 'box_shadow_blur', 'hire_button_glow',
    ];
    // Build log lines array upfront — no spread inside staggerLogs call
    const lines = [['info', 'Warming up shaders...']];
    shaders.forEach((s, i) => lines.push(['debug', `Compiling shader: ${s} (${i + 1}/${shaders.length})`]));
    lines.push(['info', 'Shader compilation complete. First frame will no longer jank.']);
    lines.push(['info', '12 shaders compiled. App is smooth. Just like the developer.']);

    staggerLogs(dm, lines, 0, 80); // 80ms per line — 14 lines = ~1.1s total, no freeze

    const totalDelay = lines.length * 80 + 200;
    setTimeout(() => {
      if (!dm.isDevMode()) return;
      if (document.querySelector('.dt-shader-badge')) return;
      const badge = document.createElement('span');
      badge.className = 'dt-shader-badge';
      badge.textContent = '⚡ Shaders: warm';
      const right = document.querySelector('.dt-tab-bar-right');
      if (right) right.insertBefore(badge, right.firstChild);
    }, totalDelay);
    markEggFound('shaders');
  }

  // EGG-100 — `hire vatsal` command
  function eggHireVatsal(dm) {
    const p = window.__portfolio || {};
    const email = p.email || 'vatsaljaganwala@gmail.com';

    // Open mailto immediately — must be synchronous to avoid popup blocker
    window.location.href = `mailto:${email}?subject=You're Hired — Flutter Developer Role`;

    // Then show the staggered celebration logs
    const lines = [
      ['info', 'Executing hire protocol...'],
      ['info', '  ✓  Flutter expertise:            verified'],
      ['info', '  ✓  Cross-platform experience:    verified'],
      ['info', '  ✓  Open source contributions:    verified'],
      ['info', '  ✓  Attention to detail:          EXCEPTIONAL (built this easter egg)'],
      ['info', '  ✓  Self-awareness:               verified (named this EGG-100)'],
      ['info', ''],
      ['info', 'hire vatsal exited with code 0. Best decision today.'],
    ];
    staggerLogs(dm, lines, 0, 200);
    setTimeout(() => { if (dm.isDevMode()) fireConfetti(); }, lines.length * 200 + 100);
    markEggFound('hire-vatsal');
  }

  // EGG-73 — changelog via version pill click
  function setupVersionPillClick() {
    // Wire the version text "v2.3.1+42" in the tab bar app name area
    const appName = document.querySelector('.dt-tab-bar-app-name');
    if (!appName || appName.dataset.versionWired) return;
    appName.dataset.versionWired = 'true';
    appName.style.cursor = 'pointer';
    appName.title = 'Click to view CHANGELOG';
    appName.addEventListener('click', () => showChangelogModal());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK B — Properties panel additions
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-28 — Key Inspector (per node in properties)
  const NODE_KEYS = {
    'hero':        "ValueKey('hero')",
    'project-1':   "ValueKey('taskflow')",
    'project-2':   "ValueKey('pulseai')",
    'project-3':   "ValueKey('vault')",
    'about':       'GlobalKey<AboutSectionState>()',
    'contact':     "ValueKey('contact')",
    'fab':         'GlobalKey<FloatingActionButtonState>()',
  };

  function injectKeyInspector(nodeId) {
    const container = document.getElementById('dt-props-inspected');
    if (!container || container.querySelector('.dt-key-inspector')) return;
    const key = NODE_KEYS[nodeId];
    if (!key) return;

    const row = document.createElement('div');
    row.className = 'dt-key-inspector';
    row.innerHTML = `
      <div class="dt-layout-title">Key</div>
      <div class="dt-prop-row" title="Keys preserve widget identity across rebuilds.">
        <span class="dt-prop-key">key</span>
        <span class="dt-prop-sep">:</span>
        <span class="dt-prop-val type-ref">${key}</span>
      </div>
    `;
    container.insertBefore(row, container.firstChild);
  }

  // EGG-29 — Future/Stream Visualiser (contact node)
  function injectFutureVisualiser(nodeId) {
    if (nodeId !== 'contact') return;
    const container = document.getElementById('dt-props-inspected');
    if (!container || container.querySelector('.dt-future-vis')) return;

    const vis = document.createElement('div');
    vis.className = 'dt-future-vis';
    vis.innerHTML = `
      <div class="dt-layout-title" style="margin-top:12px">Future / Stream</div>
      <div class="dt-future-pipeline">
        <span class="dt-future-node">Future&lt;Job&gt;</span>
        <span class="dt-future-arrow">──── await ────</span>
        <span class="dt-future-status pending" id="dt-future-status">pending...</span>
      </div>
      <div class="dt-future-chain">└── then((job) =&gt; sendEmail(job))</div>
    `;
    container.appendChild(vis);

    // Resolve after 2s
    setTimeout(() => {
      const status = document.getElementById('dt-future-status');
      if (status) {
        status.textContent = 'resolved ✓';
        status.className = 'dt-future-status resolved';
      }
    }, 2000);
  }

  // EGG-33 — Isolate Viewer (already partially in Memory tab — add sub-section)
  // This is already rendered inside showMemoryTab() — marking as done via that path.

  // EGG-41 — Pub Points Breakdown (shown when smartpub pub.dev card is visible)
  function injectPubPointsBreakdown(nodeId) {
    if (nodeId !== 'open-source') return;
    const container = document.getElementById('dt-props-inspected');
    if (!container || container.querySelector('.dt-pub-points')) return;

    const points = easterEggState.smartpubData ? easterEggState.smartpubData.points : 130;
    const maxPoints = easterEggState.smartpubData ? easterEggState.smartpubData.maxPoints : 160;

    const breakdown = document.createElement('div');
    breakdown.className = 'dt-pub-points';

    let rowsHtml = '';
    if (points === 160) {
      rowsHtml = `
        <div class="dt-pp-row good"><span>Follows Dart conventions</span><span>✓ 30/30</span></div>
        <div class="dt-pp-row good"><span>Provides documentation</span><span>✓ 20/20</span></div>
        <div class="dt-pp-row good"><span>Passes static analysis</span><span>✓ 50/50</span></div>
        <div class="dt-pp-row good"><span>Up-to-date dependencies</span><span>✓ 20/20</span></div>
        <div class="dt-pp-row good"><span>Multi-platform support</span><span>✓ 20/20</span></div>
      `;
    } else {
      rowsHtml = `
        <div class="dt-pp-row good"><span>Follows Dart conventions</span><span>✓ 30/30</span></div>
        <div class="dt-pp-row good"><span>Provides documentation</span><span>✓ 20/20</span></div>
        <div class="dt-pp-row good"><span>Passes static analysis</span><span>✓ 50/50</span></div>
        <div class="dt-pp-row good"><span>Up-to-date dependencies</span><span>✓ 20/20</span></div>
        <div class="dt-pp-row warn"><span>Multi-platform support</span><span>⚠ 10/20</span></div>
      `;
    }

    breakdown.innerHTML = `
      <div class="dt-layout-title" style="margin-top:12px">Pub Points — smartpub</div>
      <div class="dt-pp-total">${points} / ${maxPoints}</div>
      ${rowsHtml}
    `;
    container.appendChild(breakdown);
  }

  // EGG-44 — Bloc Event Log (shown when experience/projects node selected)
  function injectBlocEventLog(nodeId, dm) {
    if (!['projects', 'experience', 'contact'].includes(nodeId)) return;
    const container = document.getElementById('dt-props-inspected');
    if (!container || container.querySelector('.dt-bloc-log')) return;

    const log = document.createElement('div');
    log.className = 'dt-bloc-log';
    log.innerHTML = `<div class="dt-layout-title" style="margin-top:12px">Bloc Events</div>`;
    container.appendChild(log);

    const events = nodeId === 'projects'
      ? ['ProjectsBloc: ProjectsFetchEvent → ProjectsLoading', 'ProjectsBloc: ProjectsLoaded { count: 6 }']
      : nodeId === 'experience'
      ? ['ExperienceBloc: LoadEvent → ExperienceLoaded { entries: 1 }']
      : ['ContactBloc: HireEvent { from: "recruiter" } → HireSuccess'];

    events.forEach((ev, i) => {
      setTimeout(() => {
        if (!dm.isDevMode()) return;
        // Re-query the log element — it may have been replaced by another node click
        const logEl = document.querySelector('.dt-bloc-log');
        if (!logEl) return;
        const row = document.createElement('div');
        row.className = 'dt-bloc-event';
        row.textContent = `[Bloc] ${ev}`;
        logEl.appendChild(row);
      }, i * 300);
    });
  }

  // EGG-78 — All-eggs-found celebration (update totalEggs to trigger at 20)
  // Already handled in onAllEggsFound() — just needs totalEggs bumped
  // (keeping at 15 for now since not all are discoverable)

  // EGG-85 — Expandable Stack Trace on error click
  let _errorClickWired = false;
  let _errorHandler = null;

  function setupErrorClickExpand() {
    if (_errorClickWired) return;
    _errorClickWired = true;
    const body = document.getElementById('dt-console-body');
    if (!body) return;

    _errorHandler = (e) => {
      const entry = e.target.closest('.dt-log-entry');
      if (!entry) return;
      const level = entry.querySelector('.dt-log-level');
      if (!level || !level.classList.contains('error')) return;

      // Toggle expanded stack trace
      let trace = entry.querySelector('.dt-error-trace');
      if (trace) { trace.remove(); return; }

      trace = document.createElement('div');
      trace.className = 'dt-error-trace';
      trace.innerHTML = `
        <div class="dt-trace-title">══════ Exception Details ══════════════</div>
        <div class="dt-trace-line">  Type: RecruiterNotFoundException</div>
        <div class="dt-trace-line">  Message: No recruiter found in current context</div>
        <div class="dt-trace-line" style="margin-top:6px">  Stack trace:</div>
        <div class="dt-trace-line">  #0  Vatsal.awaitJobOffer (career.dart:47)</div>
        <div class="dt-trace-line">  #1  Portfolio.build (portfolio.dart:23)</div>
        <div class="dt-trace-line">  #2  Element.rebuild (element.dart:891)</div>
        <div class="dt-trace-line" style="margin-top:6px">  Suggestion: Call hire() to resolve.</div>
        <div class="dt-trace-line"><a class="dt-trace-link" href="#">[Open hire.sh]</a></div>
      `;
      entry.appendChild(trace);
      trace.querySelector('.dt-trace-link').addEventListener('click', (ev) => {
        ev.preventDefault();
        const dm = window.__devmode;
        if (dm) eggHireSh(dm);
      });
    };
    body.addEventListener('click', _errorHandler);
  }

  function teardownErrorClickExpand() {
    const body = document.getElementById('dt-console-body');
    if (body && _errorHandler) {
      body.removeEventListener('click', _errorHandler);
    }
    _errorHandler = null;
    _errorClickWired = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK C — Content overlays
  // ═══════════════════════════════════════════════════════════════════════════

  // EGG-13 — Performance Overlay (canvas bars)
  let _perfOverlayActive = false;
  let _perfOverlayEl = null;
  let _perfOverlayTimer = null;

  function togglePerfOverlay(dm) {
    _perfOverlayActive = !_perfOverlayActive;
    const btn = document.getElementById('dt-toggle-perf-overlay');
    if (btn) btn.classList.toggle('active', _perfOverlayActive);

    if (_perfOverlayActive) {
      const ca = document.getElementById('dt-content-area');
      if (!ca) { _perfOverlayActive = false; return; }

      // Remove any stale overlay first
      const stale = document.getElementById('dt-perf-overlay');
      if (stale) stale.remove();

      _perfOverlayEl = document.createElement('div');
      _perfOverlayEl.id = 'dt-perf-overlay';
      _perfOverlayEl.className = 'dt-perf-overlay-widget';
      _perfOverlayEl.innerHTML = `
        <div class="dt-po-row">
          <span class="dt-po-label">UI Thread</span>
          <canvas id="dt-po-ui" class="dt-po-canvas" width="200" height="28"></canvas>
        </div>
        <div class="dt-po-row">
          <span class="dt-po-label">Raster</span>
          <canvas id="dt-po-raster" class="dt-po-canvas" width="200" height="28"></canvas>
        </div>
      `;
      ca.insertBefore(_perfOverlayEl, ca.firstChild);

      // Start drawing after a tick so canvases are in the DOM
      setTimeout(() => {
        if (!_perfOverlayActive) return;
        _perfOverlayTimer = setInterval(() => {
          if (!_perfOverlayActive) { clearInterval(_perfOverlayTimer); return; }
          drawPerfBars('dt-po-ui',     8,  16, '#98C379');
          drawPerfBars('dt-po-raster', 4,  12, '#61AFEF');
        }, 100);
      }, 50);

      dm.addLog('debug', 'Performance overlay enabled. UI thread nominal. Raster thread nominal.');
      markEggFound('perf-overlay');
    } else {
      clearInterval(_perfOverlayTimer);
      _perfOverlayTimer = null;
      if (_perfOverlayEl) { _perfOverlayEl.remove(); _perfOverlayEl = null; }
      dm.addLog('debug', 'Performance overlay disabled.');
    }
  }

  function drawPerfBars(canvasId, minMs, maxMs, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.isConnected) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const barW = 4, gap = 2;
    const cols = Math.floor(w / (barW + gap));

    // Shift existing bars left
    const img = ctx.getImageData(barW + gap, 0, w - barW - gap, h);
    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(img, 0, 0);

    // Draw new bar on right
    const ms = minMs + Math.random() * (maxMs - minMs);
    const barH = Math.min(h, (ms / 16) * h);
    const barColor = ms > 16 ? '#E06C75' : color;
    ctx.fillStyle = barColor;
    ctx.fillRect(w - barW, h - barH, barW, barH);

    // 16ms threshold line
    ctx.fillStyle = 'rgba(224,108,117,0.5)';
    ctx.fillRect(0, 0, w, 1);
  }

  function teardownPerfOverlay() {
    _perfOverlayActive = false;
    clearInterval(_perfOverlayTimer);
    _perfOverlayTimer = null;
    if (_perfOverlayEl) { _perfOverlayEl.remove(); _perfOverlayEl = null; }
  }

  // EGG-14 — Semantic Debugger
  let _semanticActive = false;
  let _semanticLabels = [];

  function toggleSemanticDebugger(dm) {
    _semanticActive = !_semanticActive;
    const btn = document.getElementById('dt-toggle-semantics');
    if (btn) btn.classList.toggle('active', _semanticActive);

    if (_semanticActive) {
      const ca = document.getElementById('dt-content-area');
      if (!ca) { _semanticActive = false; return; }

      const selectors = ['a', 'button', 'h1', 'h2', 'h3', 'img'];
      let count = 0;

      selectors.forEach(sel => {
        ca.querySelectorAll(sel).forEach(el => {
          if (count >= 30) return; // cap to avoid DOM explosion
          const rect = el.getBoundingClientRect();
          // Skip invisible / zero-size elements
          if (rect.width < 4 || rect.height < 4) return;
          if (rect.top < -200 || rect.top > window.innerHeight + 200) return;

          let labelText = '';
          const tag = el.tagName;
          if (tag === 'A')           labelText = `Link: "${el.textContent.trim().slice(0, 25)}"`;
          else if (tag === 'BUTTON') labelText = `Button: "${el.textContent.trim().slice(0, 20)}"`;
          else if (/^H[1-3]$/.test(tag)) labelText = `Heading: "${el.textContent.trim().slice(0, 22)}"`;
          else if (tag === 'IMG')    labelText = `Image: "${(el.alt || 'no alt').slice(0, 20)}"`;
          if (!labelText) return;

          const label = document.createElement('div');
          label.className = 'dt-semantic-label';
          label.textContent = labelText;
          label.style.left = Math.max(0, rect.left) + 'px';
          label.style.top  = Math.max(0, rect.top)  + 'px';
          document.body.appendChild(label);
          _semanticLabels.push(label);
          count++;
        });
      });

      dm.addLog('info', `debugSemanticsEnabled = true. ${count} elements labelled.`);
      markEggFound('semantics');
    } else {
      _semanticLabels.forEach(l => { if (l.parentNode) l.remove(); });
      _semanticLabels = [];
      dm.addLog('info', 'debugSemanticsEnabled = false. Accessibility tree hidden.');
    }
  }

  function teardownSemanticDebugger() {
    _semanticActive = false;
    _semanticLabels.forEach(l => { if (l.parentNode) l.remove(); });
    _semanticLabels = [];
  }

  // EGG-27 — InheritedWidget Visualiser
  let _dataFlowActive = false;
  let _dataFlowEl = null;

  function toggleDataFlow(dm) {
    _dataFlowActive = !_dataFlowActive;
    const btn = document.getElementById('dt-toggle-dataflow');
    if (btn) btn.classList.toggle('active', _dataFlowActive);

    if (_dataFlowActive) {
      const treePanel = document.getElementById('dt-tree-panel');
      if (!treePanel) return;
      _dataFlowEl = document.createElement('div');
      _dataFlowEl.id = 'dt-data-flow';
      _dataFlowEl.className = 'dt-data-flow';
      _dataFlowEl.innerHTML = `
        <div class="dt-df-label">DevModeState flowing ↓</div>
        <div class="dt-df-line"></div>
        <div class="dt-df-node">MaterialApp</div>
        <div class="dt-df-line"></div>
        <div class="dt-df-node">Scaffold</div>
        <div class="dt-df-line"></div>
        <div class="dt-df-node">SingleChildScrollView</div>
        <div class="dt-df-line"></div>
        <div class="dt-df-node">Hero / Projects / About ...</div>
      `;
      treePanel.appendChild(_dataFlowEl);
      dm.addLog('debug', 'InheritedWidget propagation visualised. Data flows from root to leaves.');
      markEggFound('data-flow');
    } else {
      if (_dataFlowEl) { _dataFlowEl.remove(); _dataFlowEl = null; }
    }
  }

  function teardownDataFlow() {
    _dataFlowActive = false;
    if (_dataFlowEl) { _dataFlowEl.remove(); _dataFlowEl = null; }
  }

  // EGG-34 — Animation Scrubber (appears when Slow Animations ON)
  let _scrubberEl = null;

  function showAnimScrubber() {
    if (_scrubberEl) return;
    const ca = document.getElementById('dt-content-area');
    if (!ca) return;
    _scrubberEl = document.createElement('div');
    _scrubberEl.id = 'dt-anim-scrubber';
    _scrubberEl.className = 'dt-anim-scrubber';
    _scrubberEl.innerHTML = `
      <span class="dt-scrubber-label">AnimationController</span>
      <input type="range" id="dt-scrubber-input" min="0" max="100" value="0" class="dt-scrubber-range" />
      <span class="dt-scrubber-val" id="dt-scrubber-val">0%</span>
    `;
    ca.appendChild(_scrubberEl);

    document.getElementById('dt-scrubber-input').addEventListener('input', (e) => {
      const v = e.target.value;
      document.getElementById('dt-scrubber-val').textContent = `${v}%`;
      document.documentElement.style.setProperty('--anim-progress', v / 100);
    });
  }

  function hideAnimScrubber() {
    if (_scrubberEl) { _scrubberEl.remove(); _scrubberEl = null; }
  }

})();
