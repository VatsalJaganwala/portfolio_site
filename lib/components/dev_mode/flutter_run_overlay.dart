import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the flutter run terminal overlay. Shown/hidden and timed by devmode.js.
class FlutterRunOverlay extends StatelessComponent {
  const FlutterRunOverlay({super.key});

  @override
  Component build(BuildContext context) {
    return div(
      id: 'flutter-run-overlay',
      classes: 'flutter-run-overlay',
      attributes: {'style': 'display: none'},
      [
        div(classes: 'overlay-progress', []),
        button(
          id: 'overlay-skip-btn',
          classes: 'overlay-skip-btn',
          [.text('Skip →')],
        ),
        ..._logLines(),
        div([span(classes: 'terminal-cursor', [])]),
      ],
    );
  }

  List<Component> _logLines() {
    final lines = [
      (0.1, '#5C6370', r'$ flutter run -d chrome --debug'),
      (0.4, '#ABB2BF', 'Launching lib/main.dart on Chrome in debug mode...'),
      (0.8, '#5C6370', "Running Gradle task 'assembleDebug'..."),
      (1.2, '#98C379', '✓  Built build/web/main.dart.js'),
      (1.6, '#ABB2BF', 'Syncing files to device Chrome...'),
      (2.0, null, '\u00A0'),
      (2.1, '#ABB2BF', 'Flutter run key commands.'),
      (2.3, '#E5C07B', 'r  Hot reload. 🔥🔥🔥'),
      (2.5, '#E5C07B', 'R  Hot restart.'),
      (2.7, '#61AFEF', 'v  Open Flutter DevTools.'),
      (2.9, '#ABB2BF', 'q  Quit (terminate the application).'),
      (3.2, null, '\u00A0'),
      (3.3, '#5C6370', 'An Observatory debugger and profiler on Chrome is available at:'),
      (3.5, '#61AFEF', 'http://127.0.0.1:9102/vatsal_jaganwala=/'),
      (3.7, null, '\u00A0'),
      (3.8, '#ABB2BF', 'Opening DevTools in the browser...'),
    ];

    return lines.map((e) {
      final styleStr = [
        'animation-delay: ${e.$1}s',
        if (e.$2 != null) 'color: ${e.$2}',
      ].join('; ');
      return span(
        classes: 'log-line',
        attributes: {'style': styleStr},
        [.text(e.$3)],
      );
    }).toList();
  }
}
