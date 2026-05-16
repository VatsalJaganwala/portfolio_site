import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the debug console shell. Log entries injected by devmode.js.
class DebugConsole extends StatelessComponent {
  const DebugConsole({super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'dt-console', classes: 'dt-console', [
      // Header is ALWAYS visible — never collapses with the body
      div(classes: 'dt-console-header', [
        span(classes: 'dt-console-label', [.text('Console')]),
        div(classes: 'dt-console-filters', [
          for (final f in ['ALL', 'INFO', 'DEBUG', 'WARNING', 'ERROR'])
            span(
              classes: 'dt-filter-pill${f == 'ALL' ? ' active' : ''}',
              attributes: {'data-filter': f},
              [.text(f)],
            ),
        ]),
        div(classes: 'dt-console-spacer', []),
        button(id: 'dt-console-clear', classes: 'dt-console-clear', [.text('🗑')]),
        button(id: 'dt-console-toggle', classes: 'dt-console-toggle', [.text('▼')]),
      ]),
      // Body wrapper — this collapses, not the header
      div(id: 'dt-console-body-wrap', classes: 'dt-console-body-wrap', [
        div(id: 'dt-console-body', classes: 'dt-console-body', []),
        // Console input — Phase 4 easter egg command router
        div(classes: 'dt-console-input-row', [
          span(classes: 'dt-console-prompt', [.text('>')]),
          input(
            id: 'dt-console-input',
            classes: 'dt-console-input',
            type: InputType.text,
            attributes: {
              'placeholder': 'Type a command... (try: help)',
              'autocomplete': 'off',
              'spellcheck': 'false',
            },
          ),
        ]),
      ]),
    ]);
  }
}
