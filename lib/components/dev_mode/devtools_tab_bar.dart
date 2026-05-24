import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the DevTools tab bar. Tab switching handled by devmode.js.
class DevToolsTabBar extends StatelessComponent {
  const DevToolsTabBar({super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'dt-tab-bar', [
      // Left: Flutter icon (clickable — 5× rapid clicks triggers EGG-76) + app name
      div(classes: 'dt-tab-bar-left', [
        div(
          id: 'dt-flutter-logo-btn',
          classes: 'dt-flutter-logo-btn',
          [_flutterIcon()],
        ),
        span(classes: 'dt-tab-bar-app-name', [
          .text('portfolio | Flutter DevTools'),
        ]),
        div(classes: 'dt-tab-bar-sep', []),
      ]),

      // Tabs
      div(classes: 'dt-tab-bar-tabs', [
        _tab('Flutter Inspector', 'inspector', active: true),
        _tab('Performance', 'performance'),
        _tab('Memory', 'memory'),
        _tab('Logging', 'logging'),
      ]),

      // Right: toggle buttons + egg counter + connection status + exit button slot
      div(classes: 'dt-tab-bar-right', [
        // Phase 4 toggle buttons
        button(
          id: 'dt-toggle-repaint',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Repaint Rainbow'},
          [.text('🌈')],
        ),
        button(
          id: 'dt-toggle-slow',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Slow Animations 3×'},
          [.text('🐢')],
        ),
        button(
          id: 'dt-toggle-banner',
          classes: 'dt-toggle-btn active',
          attributes: {'title': 'Debug Banner'},
          [.text('🏴')],
        ),
        // Phase 5 toggle buttons
        button(
          id: 'dt-toggle-perf-overlay',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Performance Overlay'},
          [.text('📊')],
        ),
        button(
          id: 'dt-toggle-semantics',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Semantic Debugger'},
          [.text('♿')],
        ),
        button(
          id: 'dt-toggle-checker',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Checkerboard Cache'},
          [.text('♟')],
        ),
        button(
          id: 'dt-toggle-baselines',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Baseline Painting'},
          [.text('—')],
        ),
        button(
          id: 'dt-toggle-constraints',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Constraints Badges'},
          [.text('📐')],
        ),
        button(
          id: 'dt-toggle-bp',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'Breakpoint Markers'},
          [.text('📏')],
        ),
        button(
          id: 'dt-toggle-dataflow',
          classes: 'dt-toggle-btn',
          attributes: {'title': 'InheritedWidget Flow'},
          [.text('🔗')],
        ),
        div(classes: 'dt-tab-bar-sep', []),
        // Easter egg counter — updated by devmode_eggs.js
        span(id: 'dt-egg-counter', classes: 'dt-egg-badge', [.text('🥚 0/15 found')]),
        div(classes: 'dt-tab-bar-sep', []),
        div(classes: 'dt-conn-dot', []),
        span(classes: 'dt-conn-text', [.text('Connected')]),
        // Exit button injected here by devmode.js
        div(id: 'dt-exit-btn-container', []),
      ]),
    ]);
  }

  Component _tab(String label, String id, {bool active = false}) {
    return div(
      classes: 'dt-tab${active ? ' active' : ''}',
      attributes: {'data-tab': id},
      [.text(label)],
    );
  }

  Component _flutterIcon() {
    return svg(
      classes: 'dt-flutter-icon',
      attributes: {
        'viewBox': '0 0 100 100',
        'xmlns': 'http://www.w3.org/2000/svg',
      },
      [
        polygon(
          attributes: {
            'points': '50,0 100,50 50,100 0,50',
            'fill': '#61AFEF',
          },
          [],
        ),
      ],
    );
  }
}
