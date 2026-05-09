import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import 'devtools_tab_bar.dart';
import 'widget_tree_panel.dart';
import 'properties_panel.dart';
import 'debug_console.dart';
import 'performance_tab.dart';
import 'main_content_wrapper.dart';

/// Renders the full DevTools shell layout. All interactivity handled by devmode.js.
class DevModeShell extends StatelessComponent {
  final List<Component> portfolioContent;

  const DevModeShell({required this.portfolioContent, super.key});

  @override
  Component build(BuildContext context) {
    return div(
      id: 'devtools-shell',
      classes: 'devtools-shell',
      attributes: {'style': 'display: none'},
      [
        const DevToolsTabBar(),

        // Main 3-column row (desktop grid / mobile zones)
        div(classes: 'devtools-main-row', [
          // Zone: tree (left panel on desktop, tab on mobile)
          div(
            classes: 'dt-mobile-zone',
            attributes: {'data-zone': 'tree'},
            [const WidgetTreePanel()],
          ),

          // Zone: ui (centre content on desktop, default active tab on mobile)
          div(
            classes: 'dt-mobile-zone active',
            attributes: {'data-zone': 'ui'},
            [MainContentWrapper(children: portfolioContent)],
          ),

          // Zone: props (right panel on desktop, tab on mobile)
          div(
            classes: 'dt-mobile-zone',
            attributes: {'data-zone': 'props'},
            [const PropertiesPanel()],
          ),
        ]),

        // Console (always below main row on desktop; console tab on mobile)
        div(
          classes: 'dt-mobile-zone',
          attributes: {'data-zone': 'console'},
          [const DebugConsole()],
        ),

        const PerformanceTab(),

        // Mobile-only bottom tab bar (hidden on desktop via CSS)
        div(classes: 'dt-mobile-tabs', [
          _mobileTab('Tree', 'tree'),
          _mobileTab('UI', 'ui'),
          _mobileTab('Props', 'props'),
          _mobileTab('Console', 'console'),
        ]),
      ],
    );
  }

  Component _mobileTab(String label, String zone) {
    return div(
      classes: 'dt-mobile-tab${zone == 'ui' ? ' active' : ''}',
      attributes: {'data-zone': zone},
      [
        // Icon: a plain div styled with CSS mask-image SVG (see devtools.css)
        div(classes: 'dt-mobile-tab-icon dt-tab-icon-$zone', []),
        span(classes: 'dt-mobile-tab-label', [.text(label)]),
      ],
    );
  }
}
