import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import 'components/nav_bar.dart';
import 'components/dev_mode/dev_mode_pill.dart';
import 'components/dev_mode/flutter_run_overlay.dart';
import 'components/dev_mode/dev_mode_shell.dart';
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
  const App({super.key});

  @override
  Component build(BuildContext context) {
    // portfolioContent is the same section tree passed into the DevTools shell.
    // It cannot be const because the list is constructed at build time.
    final portfolioContent = [
      div(classes: 'pt-navbar', [
        const NavBar(),
        const HeroSection(),
        const ProjectsSection(),
        const AboutSection(),
        const SkillsSection(),
        const ExperienceSection(),
        const OpenSourceSection(),
        const EducationSection(),
        const AchievementsSection(),
        const ContactSection(),
      ]),
    ];

    return div([
      // Normal site content (always in DOM, hidden by devtools-shell overlay)
      div(classes: 'pt-navbar', [
        const NavBar(),
        const HeroSection(),
        const ProjectsSection(),
        const AboutSection(),
        const SkillsSection(),
        const ExperienceSection(),
        const OpenSourceSection(),
        const EducationSection(),
        const AchievementsSection(),
        const ContactSection(),
      ]),
      // DevMode components (hidden until activated by JS)
      const DevModePill(),
      const FlutterRunOverlay(),
      DevModeShell(portfolioContent: portfolioContent),
    ]);
  }
}
