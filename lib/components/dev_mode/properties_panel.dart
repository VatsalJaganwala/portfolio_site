import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../../data/portfolio_data.dart';

/// Renders the properties panel. Inspected node content injected by devmode.js.
class PropertiesPanel extends StatelessComponent {
  const PropertiesPanel({super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'dt-props-panel devtools-panel', [
      div(classes: 'dt-panel-header', [
        span(classes: 'dt-panel-title', [.text('Properties')]),
      ]),
      div(classes: 'dt-props-body', [
        span(classes: 'dt-props-section-title', [.text('App info')]),
        ..._buildMetadata(),
        div(classes: 'dt-prop-divider', []),
        // This slot is updated by devmode.js on node hover
        div(id: 'dt-props-inspected', [
          p(classes: 'dt-props-hint', [.text('// Hover any widget to inspect')]),
        ]),
      ]),
    ]);
  }

  List<Component> _buildMetadata() {
    final pi = portfolio.personalInformation;
    // locale: derive from location — "en_IN" for India, default "en_US"
    final locale = pi.location.contains('India') ? 'en_IN' : 'en_US';

    final meta = [
      ('app',        '"${pi.name} Portfolio"'),
      ('version',    '"2.3.1+42"'),
      ('dartSDK',    '"3.3.0"'),
      ('flutterVer', '"3.19.0"'),
      ('buildMode',  '"debug"'),
      ('platform',   '"web"'),
      ('theme',      '"dark"'),
      ('locale',     '"$locale"'),
    ];

    return meta.map((e) => div(classes: 'dt-prop-row', [
      span(classes: 'dt-prop-key', [.text(e.$1)]),
      span(classes: 'dt-prop-sep', [.text(':')]),
      span(classes: 'dt-prop-val', [.text(e.$2)]),
    ])).toList();
  }
}
