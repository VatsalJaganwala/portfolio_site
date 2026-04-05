import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/project_card.dart';
import '../components/section_wrapper.dart';

class ProjectsSection extends StatelessComponent {
  final PortfolioData data;
  const ProjectsSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    final projects = data.projects;

    return div(id: 'projects', [
      SectionWrapper(
        index: '// 02 · FEATURED WORK',
        heading: 'Featured Work.',
        children: [
          div(classes: 'projects-grid', [
            // Pair projects in rows of 2
            for (int i = 0; i < projects.length; i += 2)
              i + 1 < projects.length
                  ? div(classes: 'project-row', [
                      ProjectCard(project: projects[i]),
                      ProjectCard(project: projects[i + 1]),
                    ])
                  : ProjectCard(project: projects[i]),
          ]),
        ],
      ),
    ]);
  }
}
