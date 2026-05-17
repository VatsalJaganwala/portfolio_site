import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import 'components/nav_bar.dart';
import 'components/whatsapp_widget.dart';
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
    return div([
      // Normal site content — the single source of truth for all headings.
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
      // WhatsApp floating widget — QR card on desktop, FAB on mobile.
      const WhatsAppWidget(),
      // DevMode components (hidden until activated by JS).
      // Content is cloned from the real DOM above by devmode.js — no duplicate
      // headings are rendered in the static HTML.
      const DevModePill(),
      const FlutterRunOverlay(),
      const DevModeShell(),
    ]);
  }
}
