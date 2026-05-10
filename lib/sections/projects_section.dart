import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/project_card.dart';
import '../components/section_wrapper.dart';

class ProjectsSection extends StatelessComponent {
  const ProjectsSection({super.key});

  @override
  Component build(BuildContext context) {
    final projects = portfolio.projects;

    return div(id: 'projects', [
      SectionWrapper(
        index: '// 02 · FEATURED WORK',
        heading: 'Featured Work.',
        children: [
          div(classes: 'projects-grid', [
            for (int i = 0; i < projects.length; i += 2)
              i + 1 < projects.length
                  ? div(classes: 'project-row', [
                      ProjectCard(project: projects[i], index: i + 1),
                      ProjectCard(project: projects[i + 1], index: i + 2),
                    ])
                  : ProjectCard(project: projects[i], index: i + 1),
          ]),
        ],
      ),
    ]);
  }
}
