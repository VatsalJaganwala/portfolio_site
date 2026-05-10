import 'dart:convert';
import 'package:jaspr/server.dart';
import 'package:jaspr/dom.dart';

import 'app.dart';
import 'data/portfolio_data.dart';

void main() {
  Jaspr.initializeApp();

  final pi = portfolio.personalInformation;

  runApp(Document(
    title: '${pi.name} — ${pi.title}',
    head: [
      // ── Primary SEO ──────────────────────────────────────────────────────
      meta(name: 'description', content: portfolio.summary),
      meta(name: 'author', content: pi.name),
      meta(
        name: 'keywords',
        content: ([pi.title] + portfolio.skills.technicalSkills.take(5).toList()).join(', '),
      ),
      meta(name: 'viewport', content: 'width=device-width, initial-scale=1.0'),
      // ── Open Graph ───────────────────────────────────────────────────────
      meta(attributes: {'property': 'og:type', 'content': 'website'}),
      meta(attributes: {'property': 'og:title', 'content': '${pi.name} — ${pi.title}'}),
      meta(attributes: {'property': 'og:description', 'content': portfolio.summary}),
      meta(attributes: {'property': 'og:site_name', 'content': '${pi.name} Portfolio'}),
      // ── Portfolio data for devmode.js ─────────────────────────────────────
      // Embedded as a <meta name="devmode-data"> tag.
      // Jaspr renders <meta> reliably in static mode — unlike script(content:).
      // devmode.js reads it via:
      //   JSON.parse(document.querySelector('meta[name="devmode-data"]').content)
      meta(name: 'devmode-data', content: _buildPortfolioJson()),
      // ── Fonts ────────────────────────────────────────────────────────────
      link(href: 'https://fonts.googleapis.com', rel: 'preconnect'),
      link(
        href: 'https://fonts.gstatic.com',
        rel: 'preconnect',
        attributes: {'crossorigin': ''},
      ),
      link(
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap',
        rel: 'stylesheet',
      ),
      link(href: 'styles.css', rel: 'stylesheet'),
      link(href: 'devtools.css', rel: 'stylesheet'),
      script(src: 'animate.js'),
      script(src: 'devmode.js'),
    ],
    body: const App(),
  ));
}

/// Serialises portfolio data to a JSON string for the devmode-data meta tag.
/// Uses dart:convert jsonEncode — safe escaping, no manual string building.
String _buildPortfolioJson() {
  final p = portfolio;
  final pi = p.personalInformation;

  return jsonEncode({
    'name': pi.name,
    'title': pi.title,
    'email': pi.email,
    'phone': pi.phone,
    'location': pi.location,
    'linkedin': pi.linkedin,
    'github': pi.github,
    'projectCount': p.projects.length,
    'osCount': p.openSourceContributions.length,
    'experienceCount': p.workExperience.length,
    'educationCount': p.education.length,
    'achievementCount': p.achievements.length,
    'projects': {
      for (var i = 0; i < p.projects.length; i++)
        'project-${i + 1}': {
          'title': p.projects[i].name,
          'platforms': p.projects[i].platforms.join(', '),
          'tech': p.projects[i].technologiesUsed.join(', '),
        },
    },
    'experience': {
      for (var i = 0; i < p.workExperience.length; i++)
        'exp-entry-${i + 1}': {
          'jobTitle': p.workExperience[i].jobTitle,
          'company': p.workExperience[i].company,
          'location': p.workExperience[i].location,
          'startDate': p.workExperience[i].startDate,
          'endDate': p.workExperience[i].endDate,
          'responsibilities': p.workExperience[i].responsibilities.length,
        },
    },
    'openSource': {
      for (final os in p.openSourceContributions)
        'os-${os.name}': {
          'name': os.name,
          'role': os.role,
          'tech': os.technologiesUsed.join(', '),
          'features': os.keyFeatures.length,
        },
    },
    'education': {
      for (var i = 0; i < p.education.length; i++)
        'edu-${i + 1}': {
          'degree': p.education[i].degree,
          'institution': p.education[i].institution,
          'duration': p.education[i].duration,
          if (p.education[i].cgpa != null) 'cgpa': p.education[i].cgpa!,
        },
    },
    'achievements': {
      for (var i = 0; i < p.achievements.length; i++)
        'ach-${i + 1}': {
          'title': p.achievements[i].title,
          'organization': p.achievements[i].organization,
          'date': p.achievements[i].date,
        },
    },
  });
}
