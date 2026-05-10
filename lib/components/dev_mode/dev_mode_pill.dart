import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the debug pill trigger. All interactivity handled by devmode.js.
class DevModePill extends StatelessComponent {
  const DevModePill({super.key});

  @override
  Component build(BuildContext context) {
    return div(
      id: 'debug-pill',
      classes: 'debug-pill-wrapper',
      [
        div(classes: 'debug-pill', [
          div(classes: 'pill-dot', []),
          span(classes: 'pill-debug-text', [.text('debug')]),
          div(classes: 'pill-sep', []),
          span(classes: 'pill-version', [.text('v2.3.1+42')]),
          div(classes: 'debug-pill-tooltip', [.text('Open Flutter DevTools')]),
        ]),
      ],
    );
  }
}
