import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/achievement_card.dart';

class AchievementsSection extends StatelessComponent {
  final PortfolioData data;
  const AchievementsSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    if (data.achievements.isEmpty) {
      return div([]);
    }

    return div(id: 'achievements', [
      SectionWrapper(
        index: '// 08 · ACHIEVEMENTS',
        heading: 'Achievements.',
        children: [
          div(classes: 'two-col', [
            for (final achievement in data.achievements)
              AchievementCard(achievement: achievement),
          ]),
        ],
      ),
    ]);
  }
}
