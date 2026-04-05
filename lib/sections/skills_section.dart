import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/skill_pill_row.dart';

class SkillsSection extends StatelessComponent {
  final PortfolioData data;
  const SkillsSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    final skills = data.skills;

    return div(id: 'skills', [
      SectionWrapper(
        index: '// 04 · SKILLS',
        heading: 'Skills.',
        children: [
          // Technical Skills
          if (skills.technicalSkills.isNotEmpty)
            _skillsGroup('// technical_skills', skills.technicalSkills),

          if (skills.technicalSkills.isNotEmpty && skills.softSkills.isNotEmpty)
            div(classes: 'skills-divider', []),

          // Soft Skills
          if (skills.softSkills.isNotEmpty)
            _skillsGroup('// soft_skills', skills.softSkills),

          if (skills.softSkills.isNotEmpty && skills.languages.isNotEmpty)
            div(classes: 'skills-divider', []),

          // Languages
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
