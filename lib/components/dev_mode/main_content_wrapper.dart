import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the main content area inside the DevTools shell.
class MainContentWrapper extends StatelessComponent {
  final List<Component> children;

  const MainContentWrapper({required this.children, super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'dt-content-area', classes: 'dt-content-area devtools-panel', [
      ...children,
    ]);
  }
}
