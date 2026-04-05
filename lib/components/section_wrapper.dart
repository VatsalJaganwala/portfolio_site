import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class SectionWrapper extends StatelessComponent {
  final String index;
  final String heading;
  final List<Component> children;

  const SectionWrapper({
    required this.index,
    required this.heading,
    required this.children,
    super.key,
  });

  @override
  Component build(BuildContext context) {
    return section(
      classes: 'section-wrapper section-animate',
      [
        div(classes: 'container', [
          div(classes: 'section-index', [.text(index)]),
          h2(classes: 'section-heading', [.text(heading)]),
          ...children,
        ]),
      ],
    );
  }
}
