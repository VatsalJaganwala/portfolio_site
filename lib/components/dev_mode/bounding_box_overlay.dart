import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class BoundingBoxOverlay extends StatelessComponent {
  final String? visibleSection;

  const BoundingBoxOverlay({this.visibleSection, super.key});

  @override
  Component build(BuildContext context) {
    const sections = [
      ('hero', 'Hero'),
      ('projects', 'ProjectsSection'),
      ('about', 'AboutSection'),
      ('experience', 'ExperienceTimeline'),
      ('contact', 'ContactSection'),
    ];

    return div(classes: 'dt-bbox-overlay', [
      for (final s in sections)
        _BoundingBox(
          sectionId: s.$1,
          label: s.$2,
          visible: visibleSection == s.$1,
        ),
    ]);
  }
}

class _BoundingBox extends StatelessComponent {
  final String sectionId;
  final String label;
  final bool visible;

  const _BoundingBox({
    required this.sectionId,
    required this.label,
    required this.visible,
  });

  @override
  Component build(BuildContext context) {
    // Phase 1: static placeholder boxes — Phase 2 will use getBoundingClientRect
    return div(
      classes: 'dt-bbox${visible ? ' visible' : ''}',
      attributes: {
        'data-section': sectionId,
        'style': 'top: 0; left: 0; right: 0; height: 100px; display: ${visible ? 'block' : 'none'}',
      },
      [
        if (visible)
          span(classes: 'dt-bbox-label', [.text(label)]),
      ],
    );
  }
}
