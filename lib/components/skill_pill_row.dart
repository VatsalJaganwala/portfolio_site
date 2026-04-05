import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import 'skill_pill.dart';

class SkillPillRow extends StatelessComponent {
  final List<String> skills;
  const SkillPillRow({required this.skills, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'pill-row', [
      for (final skill in skills) SkillPill(label: skill),
    ]);
  }
}
