import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/open_source_card.dart';

class OpenSourceSection extends StatelessComponent {
  const OpenSourceSection({super.key});

  @override
  Component build(BuildContext context) {
    if (portfolio.openSourceContributions.isEmpty) return div([]);

    return div(id: 'open-source', [
      SectionWrapper(
        index: '// 06 · OPEN SOURCE',
        heading: 'Open Source.',
        children: [
          div(classes: 'two-col', [
            for (final contribution in portfolio.openSourceContributions)
              OpenSourceCard(contribution: contribution),
          ]),
        ],
      ),
    ]);
  }
}
