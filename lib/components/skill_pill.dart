import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class SkillPill extends StatelessComponent {
  final String label;
  const SkillPill({required this.label, super.key});

  @override
  Component build(BuildContext context) {
    return span(classes: 'pill', [.text(label)]);
  }
}
