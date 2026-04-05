import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';

class AchievementCard extends StatelessComponent {
  final Achievement achievement;
  const AchievementCard({required this.achievement, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'card', [
      div(classes: 'achievement-card-title', [.text(achievement.title)]),
      div(classes: 'achievement-org-date', [
        .text('${achievement.organization} · ${achievement.date}'),
      ]),
      p(classes: 'achievement-desc', [.text(achievement.description)]),
    ]);
  }
}
