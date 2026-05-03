import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the DevTools tab bar. Tab switching handled by devmode.js.
class DevToolsTabBar extends StatelessComponent {
  const DevToolsTabBar({super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'dt-tab-bar', [
      // Left: Flutter icon + app name
      div(classes: 'dt-tab-bar-left', [
        _flutterIcon(),
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

      // Right: connection status + exit button slot
      div(classes: 'dt-tab-bar-right', [
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
        polygon(attributes: {
          'points': '50,0 100,50 50,100 0,50',
          'fill': '#61AFEF',
        }, []),
      ],
    );
  }
}
