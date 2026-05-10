import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/skill_pill_row.dart';

class SkillsSection extends StatelessComponent {
  const SkillsSection({super.key});

  @override
  Component build(BuildContext context) {
    final skills = portfolio.skills;

    return div(id: 'skills', [
      SectionWrapper(
        index: '// 04 · SKILLS',
        heading: 'Skills.',
        children: [
          if (skills.technicalSkills.isNotEmpty)
            _skillsGroup('// technical_skills', skills.technicalSkills),
          if (skills.technicalSkills.isNotEmpty && skills.softSkills.isNotEmpty)
            div(classes: 'skills-divider', []),
          if (skills.softSkills.isNotEmpty)
            _skillsGroup('// soft_skills', skills.softSkills),
          if (skills.softSkills.isNotEmpty && skills.languages.isNotEmpty)
            div(classes: 'skills-divider', []),
          if (skills.languages.isNotEmpty)
            _skillsGroup('// languages', skills.languages),
        ],
      ),
    ]);
  }

  static Component _skillsGroup(String label, List<String> skills) {
    return div(classes: 'skills-group', [
      div(classes: 'skills-sublabel', [.text(label)]),
      SkillPillRow(skills: skills),
    ]);
  }
}
