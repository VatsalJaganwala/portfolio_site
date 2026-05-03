import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// Renders the performance tab. Bar animations triggered by devmode.js.
class PerformanceTab extends StatelessComponent {
  const PerformanceTab({super.key});

  @override
  Component build(BuildContext context) {
    const bars = [
      ('Flutter / Dart',    100, 60, '#98C379'),
      ('State Management',  100, 60, '#98C379'),
      ('UI / Animations',    97, 58, '#98C379'),
      ('Firebase / Backend', 80, 48, '#E5C07B'),
      ('REST APIs',          78, 47, '#E5C07B'),
      ('Unit Testing',       53, 32, '#E5C07B'),
      ('Writing Docs',       35, 21, '#E06C75'),
      ('Attending meetings', 13,  8, '#E06C75'),
    ];

    return div(
      id: 'dt-perf-view',
      classes: 'dt-perf-view',
      attributes: {'style': 'display: none'},
      [
        p(classes: 'dt-perf-title', [.text('Frame rendering timeline')]),
        p(classes: 'dt-perf-subtitle', [
          .text('Target: 60fps  |  Showing last 300ms'),
        ]),
        for (var i = 0; i < bars.length; i++)
          _buildBar(bars[i].$1, bars[i].$2, bars[i].$3, bars[i].$4, i),
        p(classes: 'dt-perf-footer', [
          .text('// Performance data collected over 2+ years of Flutter development.\n// Low fps values indicate room for growth, not skill gaps.'),
        ]),
      ],
    );
  }

  Component _buildBar(String label, int targetPct, int fps, String color, int index) {
    final delay = '${index * 100}ms';
    return div(classes: 'dt-flame-row', [
      span(classes: 'dt-flame-label', [.text(label)]),
      div(classes: 'dt-flame-track', [
        div(
          classes: 'dt-flame-fill',
          attributes: {
            'data-target': '$targetPct%',
            'style': 'width: 0%; background: $color; transition-delay: $delay',
          },
          [],
        ),
      ]),
      span(
        classes: 'dt-flame-fps',
        attributes: {'style': 'color: $color'},
        [.text('${fps}fps')],
      ),
    ]);
  }
}
