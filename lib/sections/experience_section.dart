import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/experience_entry.dart';
import '../components/cta_button.dart';

class ExperienceSection extends StatelessComponent {
  const ExperienceSection({super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'experience', [
      SectionWrapper(
        index: '// 05 · EXPERIENCE',
        heading: 'Experience.',
        children: [
          div(classes: 'timeline', [
            for (final exp in portfolio.workExperience)
              ExperienceEntry(experience: exp),
          ]),
          div(classes: 'experience-bottom', [
            if (portfolio.personalInformation.isAvailable)
              CTAButton(
                label: '● Open to new opportunities',
                href: 'mailto:${portfolio.personalInformation.email}',
                variant: ButtonVariant.primary,
              ),
          ]),
        ],
      ),
    ]);
  }
}
