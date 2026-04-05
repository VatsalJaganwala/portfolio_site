import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';

class ExperienceEntry extends StatelessComponent {
  final WorkExperience experience;
  const ExperienceEntry({required this.experience, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'timeline-item', [
      // Dot on timeline
      div(classes: 'timeline-dot', []),

      // Duration label
      div(classes: 'timeline-duration', [.text(experience.duration)]),

      // Job title
      h3(classes: 'timeline-title', [.text(experience.jobTitle)]),

      // Company + location
      p(classes: 'timeline-company', [
        .text('${experience.company} · Full-time · ${experience.location}'),
      ]),

      // Responsibilities
      div(classes: 'timeline-responsibilities', [
        for (final resp in experience.responsibilities)
          div(classes: 'timeline-resp-item', [
            span([.text(resp)]),
          ]),
      ]),
    ]);
  }
}
