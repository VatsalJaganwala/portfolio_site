import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/experience_entry.dart';
import '../components/cta_button.dart';

class ExperienceSection extends StatelessComponent {
  final PortfolioData data;
  const ExperienceSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'experience', [
      SectionWrapper(
        index: '// 05 · EXPERIENCE',
        heading: 'Experience.',
        children: [
          // Timeline
          div(classes: 'timeline', [
            for (final exp in data.workExperience)
              ExperienceEntry(experience: exp),
          ]),

          // Bottom: open to work pill
          div(classes: 'experience-bottom', [
            CTAButton(
              label: '● Open to new opportunities',
              href: 'mailto:${data.personalInformation.email}',
              variant: ButtonVariant.primary,
            ),
          ]),
        ],
      ),
    ]);
  }
}
