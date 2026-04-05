import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/open_source_card.dart';

class OpenSourceSection extends StatelessComponent {
  final PortfolioData data;
  const OpenSourceSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    if (data.openSourceContributions.isEmpty) {
      return div([]);
    }

    return div(id: 'open-source', [
      SectionWrapper(
        index: '// 06 · OPEN SOURCE',
        heading: 'Open Source.',
        children: [
          div(classes: 'two-col', [
            for (final contribution in data.openSourceContributions)
              OpenSourceCard(contribution: contribution),
          ]),
        ],
      ),
    ]);
  }
}
