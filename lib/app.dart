import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import 'components/nav_bar.dart';
import 'models/portfolio_data.dart';
import 'sections/about_section.dart';
import 'sections/achievements_section.dart';
import 'sections/contact_section.dart';
import 'sections/education_section.dart';
import 'sections/experience_section.dart';
import 'sections/hero_section.dart';
import 'sections/open_source_section.dart';
import 'sections/projects_section.dart';
import 'sections/skills_section.dart';

class App extends StatelessComponent {
  final PortfolioData data;

  const App({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'pt-navbar', [
      NavBar(data: data),
      HeroSection(data: data),
      ProjectsSection(data: data),
      AboutSection(data: data),
      SkillsSection(data: data),
      ExperienceSection(data: data),
      OpenSourceSection(data: data),
      EducationSection(data: data),
      AchievementsSection(data: data),
      ContactSection(data: data),
    ]);
  }
}
