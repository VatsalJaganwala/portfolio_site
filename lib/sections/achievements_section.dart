import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/achievement_card.dart';

class AchievementsSection extends StatelessComponent {
  const AchievementsSection({super.key});

  @override
  Component build(BuildContext context) {
    if (portfolio.achievements.isEmpty) return div([]);

    return div(id: 'achievements', [
      SectionWrapper(
        index: '// 08 · ACHIEVEMENTS',
        heading: 'Achievements.',
        children: [
          div(classes: 'two-col', [
            for (final achievement in portfolio.achievements)
              AchievementCard(achievement: achievement),
          ]),
        ],
      ),
    ]);
  }
}
