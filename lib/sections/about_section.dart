import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';


class AboutSection extends StatelessComponent {
  final PortfolioData data;
  const AboutSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    final pi = data.personalInformation;
    final currentJob = data.workExperience.isNotEmpty ? data.workExperience.first : null;

    // First sentence of summary for blockquote
    final sentences = data.summary.split('. ');
    final pullQuote = sentences.isNotEmpty ? '${sentences.first}.' : data.summary;
    final remainingSummary = sentences.length > 1 ? sentences.skip(1).join('. ').trim() : '';

    final codeLines = [
      '// about_${pi.firstName}.dart',
      '',
      'final ${pi.firstName} = Developer(',
      "  name: '${pi.name}',",
      '  yearsXP: ${data.yearsExperience > 0 ? data.yearsExperience : 1},',
      "  location: '${pi.location}',",
      "  role: '${pi.title}',",
      '  skills: [',
      ...data.skills.technicalSkills.take(5).map((s) => "    '$s',"),
      '  ],',
      '  isAvailable: true,',
      ');',
    ];

    return div(
      [
        SectionWrapper(
          index: '// 03 · ABOUT',
          heading: 'About Me.',
          children: [
            div(classes: 'two-col-60-40', [
              // Left column
              div([
                if (sentences.isNotEmpty)
                  blockquote(classes: 'about-blockquote', [.text(pullQuote)]),
                if (remainingSummary.isNotEmpty)
                  p(classes: 'about-body', [.text(remainingSummary)]),
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
      id: 'about',
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
    // Highlight keywords and strings
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
      parts.isEmpty ? [span(classes: 'code-normal', [.text(line)])] : parts,
    );
  }
}
