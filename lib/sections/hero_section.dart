import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/cta_button.dart';

class HeroSection extends StatelessComponent {
  const HeroSection({super.key});

  @override
  Component build(BuildContext context) {
    final pi = portfolio.personalInformation;
    final nameParts = pi.name.split(' ');
    final firstName =
        nameParts.isNotEmpty ? nameParts.first.toLowerCase() : pi.name.toLowerCase();
    final lastName =
        nameParts.length > 1 ? nameParts.sublist(1).join(' ').toLowerCase() : '';

    final projectCount = portfolio.projects.length;
    final osCount = portfolio.openSourceContributions.length;
    final yearsXP = portfolio.yearsExperience;

    final sentences = portfolio.summary.split('. ');
    final subHeadline = sentences.isNotEmpty ? '${sentences.first}.' : portfolio.summary;

    return div(
      id: 'hero',
      classes: 'section-animate',
      [
        div(classes: 'hero', [
          div(classes: 'hero-inner', [
            // Left: content
            div(classes: 'hero-content', [
              div(classes: 'hero-index', [.text('// 01 · HERO')]),
              h1(classes: 'hero-headline', [
                span(classes: 'hero-name-first', [.text(firstName)]),
                span(classes: 'hero-name-last', [.text('$lastName.')]),
              ]),
              p(classes: 'hero-subtext', [.text(subHeadline)]),
              div(classes: 'hero-stats', [
                _stat('$yearsXP+', 'YEARS EXPERIENCE'),
                _stat('$projectCount+', 'PROJECTS DELIVERED'),
                _stat('$osCount+', 'OPEN SOURCE PKGS'),
              ]),
              div(classes: 'hero-buttons', [
                CTAButton(label: 'View my work →', href: '#projects', variant: ButtonVariant.primary),
                CTAButton(label: 'Contact ↗', href: '#contact', variant: ButtonVariant.ghost),
              ]),
              div(classes: 'hero-scroll mt-48', [.text('↓  SCROLL')]),
            ]),

            // Right: decorative Dart code card
            div(classes: 'hero-code-card', [
              span(classes: 'code-comment', [.text('// developer_profile.dart')]),
              br(),
              _cl([
                span(classes: 'code-keyword', [.text('class ')]),
                span(classes: 'code-normal', [.text('Developer {')]),
              ]),
              _cl([
                span(classes: 'code-normal', [.text('  ')]),
                span(classes: 'code-keyword', [.text('final ')]),
                span(classes: 'code-normal', [.text('String name = ')]),
                span(classes: 'code-string', [.text("'${pi.name}'")]),
                span(classes: 'code-normal', [.text(';')]),
              ]),
              _cl([
                span(classes: 'code-normal', [.text('  ')]),
                span(classes: 'code-keyword', [.text('final ')]),
                span(classes: 'code-normal', [.text('String role = ')]),
                span(classes: 'code-string', [.text("'${pi.title}'")]),
                span(classes: 'code-normal', [.text(';')]),
              ]),
              _cl([
                span(classes: 'code-normal', [.text('  ')]),
                span(classes: 'code-keyword', [.text('final ')]),
                span(classes: 'code-normal', [.text('String location = ')]),
                span(classes: 'code-string', [.text("'${pi.location}'")]),
                span(classes: 'code-normal', [.text(';')]),
              ]),
              br(),
              _cl([
                span(classes: 'code-normal', [.text('  ')]),
                span(classes: 'code-keyword', [.text('List')]),
                span(classes: 'code-normal', [.text('<String> skills = [')]),
              ]),
              for (int i = 0; i < portfolio.skills.technicalSkills.length && i < 5; i++)
                _cl([
                  span(classes: 'code-normal', [.text('    ')]),
                  span(classes: 'code-string', [
                    .text("'${portfolio.skills.technicalSkills[i]}',"),
                  ]),
                ]),
              _cl([span(classes: 'code-normal', [.text('  ];')])]),
              br(),
              _cl([
                span(classes: 'code-normal', [.text('  ')]),
                span(classes: 'code-keyword', [.text('bool ')]),
                span(classes: 'code-normal', [.text('get isAvailable => ')]),
                span(classes: 'code-keyword', [.text('${pi.isAvailable}')]),
                span(classes: 'code-normal', [.text(';')]),
              ]),
              _cl([span(classes: 'code-normal', [.text('}')])]),
            ]),
          ]),
        ]),
      ],
    );
  }

  static Component _stat(String value, String label) {
    return div(classes: 'hero-stat', [
      div(classes: 'hero-stat-value', [.text(value)]),
      div(classes: 'hero-stat-label', [.text(label)]),
    ]);
  }

  static Component _cl(List<Component> children) {
    return div(classes: 'code-line', children);
  }
}
