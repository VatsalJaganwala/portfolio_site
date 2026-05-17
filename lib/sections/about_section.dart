import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';

class AboutSection extends StatelessComponent {
  const AboutSection({super.key});

  @override
  Component build(BuildContext context) {
    final pi = portfolio.personalInformation;
    final currentJob = portfolio.workExperience.isNotEmpty ? portfolio.workExperience.first : null;

    final sentences = portfolio.summary.split('. ');
    final pullQuote = sentences.isNotEmpty ? '${sentences.first}.' : portfolio.summary;
    final remainingSummary = sentences.length > 1 ? sentences.skip(1).join('. ').trim() : '';

    final codeLines = [
      '// about_${pi.firstName}.dart',
      '',
      'final ${pi.firstName} = Developer(',
      "  name: '${pi.name}',",
      '  yearsXP: ${portfolio.yearsExperience},',
      "  location: '${pi.location}',",
      "  role: '${pi.title}',",
      '  skills: [',
      ...portfolio.skills.technicalSkills.take(5).map((skill) => "    '$skill',"),
      '  ],',
      if (pi.isAvailable) '  isAvailable: ${pi.isAvailable},',
      ');',
    ];

    return div(
      id: 'about',
      [
        SectionWrapper(
          index: '// 03 · ABOUT',
          heading: 'About ${pi.name}.',
          children: [
            // SEO: explicit subtitle reinforces "Flutter Developer" keyword
            // under the <h2>, improving title coherence score.
            p(classes: 'about-role-label', [
              .text('${pi.title} · ${pi.location}'),
            ]),
            div(classes: 'two-col-60-40', [
              // Left column
              div([
                if (sentences.isNotEmpty) blockquote(classes: 'about-blockquote', [.text(pullQuote)]),
                if (remainingSummary.isNotEmpty) p(classes: 'about-body', [.text(remainingSummary)]),
                div(classes: 'about-stats-grid', [
                  if (currentJob != null) ...[
                    _statCard('CURRENT ROLE', currentJob.jobTitle),
                    _statCard('COMPANY', currentJob.company),
                    _statCard('SINCE', currentJob.startDate),
                  ],
                ]),
              ]),
              // Right column: code card + status
              div([
                div(classes: 'code-block', [
                  for (final line in codeLines) _buildCodeLine(line),
                ]),
                if (pi.isAvailable)
                  div(classes: 'status-card', [
                    div(classes: 'status-dot', []),
                    span(classes: 'status-text', [
                      .text('Available for new opportunities'),
                    ]),
                  ]),
              ]),
            ]),
          ],
        ),
      ],
    );
  }

  static Component _statCard(String label, String value) {
    return div(classes: 'about-stat-card', [
      div(classes: 'about-stat-label', [.text(label)]),
      div(classes: 'about-stat-value', [.text(value)]),
    ]);
  }

  static Component _buildCodeLine(String line) {
    if (line.isEmpty) return br();
    if (line.trimLeft().startsWith('//')) {
      return div(classes: 'code-comment', [.text(line)]);
    }
    final regex = RegExp(r"'[^']*'|\b(final|class|List|bool|get|return|true|false|const)\b");
    final parts = <Component>[];
    int last = 0;
    for (final m in regex.allMatches(line)) {
      if (m.start > last) {
        parts.add(span(classes: 'code-normal', [.text(line.substring(last, m.start))]));
      }
      final matched = m.group(0)!;
      if (matched.startsWith("'")) {
        parts.add(span(classes: 'code-string', [.text(matched)]));
      } else {
        parts.add(span(classes: 'code-keyword', [.text(matched)]));
      }
      last = m.end;
    }
    if (last < line.length) {
      parts.add(span(classes: 'code-normal', [.text(line.substring(last))]));
    }
    return div(
      classes: 'code-line',
      parts.isEmpty
          ? [
              span(classes: 'code-normal', [.text(line)]),
            ]
          : parts,
    );
  }
}
