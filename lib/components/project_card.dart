import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import 'skill_pill_row.dart';
import 'cta_button.dart';

class ProjectCard extends StatelessComponent {
  final Project project;
  const ProjectCard({required this.project, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'card project-card', [
      // Platform label
      div(classes: 'project-platform', [.text(project.platformLabel)]),

      // Project title
      h3(classes: 'project-title', [.text(project.name)]),

      // Description
      p(classes: 'project-desc', [.text(project.description)]),

      // Tech pills
      SkillPillRow(skills: project.technologiesUsed),

      // Action links
      if (project.github != null || project.liveUrl != null)
        div(classes: 'project-links', [
          if (project.github != null)
            CTAButton(
              label: 'GitHub ↗',
              href: project.github,
              variant: ButtonVariant.ghost,
              isSmall: true,
            ),
          if (project.liveUrl != null)
            CTAButton(
              label: 'Live ↗',
              href: project.liveUrl,
              variant: ButtonVariant.primary,
              isSmall: true,
            ),
        ]),
    ]);
  }
}
