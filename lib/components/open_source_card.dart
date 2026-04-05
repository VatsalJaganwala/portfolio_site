import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import 'skill_pill_row.dart';
import 'cta_button.dart';

class OpenSourceCard extends StatelessComponent {
  final OpenSourceContribution contribution;
  const OpenSourceCard({required this.contribution, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'card', [
      // Name
      div(classes: 'os-card-name', [.text(contribution.name)]),

      // Role badge
      span(classes: 'os-card-role-badge', [.text(contribution.role)]),

      // Description
      p(classes: 'os-card-desc', [.text(contribution.description)]),

      // Key features
      div(classes: 'os-card-features', [
        for (final feature in contribution.keyFeatures)
          div(classes: 'os-card-feature', [span([.text(feature)])]),
      ]),

      // Tech pills
      SkillPillRow(skills: contribution.technologiesUsed),

      // Links
      div(classes: 'os-card-links', [
        if (contribution.github != null)
          CTAButton(
            label: 'GitHub ↗',
            href: contribution.github,
            variant: ButtonVariant.ghost,
            isSmall: true,
          ),
        CTAButton(
          label: 'pub.dev ↗',
          href: 'https://pub.dev/packages/${contribution.name}',
          variant: ButtonVariant.ghost,
          isSmall: true,
        ),
      ]),
    ]);
  }
}
