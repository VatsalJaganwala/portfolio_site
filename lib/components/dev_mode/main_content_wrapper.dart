import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the main content area inside the DevTools shell.
/// Content is populated at runtime by devmode.js via DOM cloning —
/// no Dart component tree is rendered here, preventing duplicate headings
/// in the static HTML that would confuse SEO crawlers.
class MainContentWrapper extends StatelessComponent {
  const MainContentWrapper({super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'dt-content-area', classes: 'dt-content-area devtools-panel', []);
  }
}
