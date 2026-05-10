import 'dart:convert';
import 'package:jaspr/server.dart';
import 'package:jaspr/dom.dart';

import 'app.dart';
import 'data/portfolio_data.dart';
import 'models/portfolio_data.dart';

void main() {
  Jaspr.initializeApp();

  final pi = portfolio.personalInformation;

  final siteUrl = pi.siteUrl;

  // Meta description: 140–155 chars, includes "Flutter Developer from Surat", ends with CTA.
  // Built from portfolio data — name and location come from personalInformation.
  final locationParts = pi.location.split(',').map((part) => part.trim()).toList();
  final city = locationParts.isNotEmpty ? locationParts.first : pi.location;
  final metaDescription =
      '${pi.name} — ${pi.title} from $city. '
      'Cross-platform apps for Android, iOS & Web. '
      'Explore my projects.';

  // Keywords: name + title + top technical skills (all from portfolio_data.dart).
  final keywords = [
    pi.name,
    pi.title,
    ...portfolio.skills.technicalSkills,
    pi.location,
  ].join(', ');

  runApp(Document(
    title: '${pi.name} — ${pi.title}',
    lang: 'en',
    head: [
      // ── Primary SEO ──────────────────────────────────────────────────────
      meta(name: 'description', content: metaDescription),
      meta(name: 'author', content: pi.name),
      meta(name: 'keywords', content: keywords),
      meta(name: 'viewport', content: 'width=device-width, initial-scale=1.0'),
      meta(name: 'robots', content: 'index, follow'),
      // ── Canonical URL ────────────────────────────────────────────────────
      link(href: siteUrl, rel: 'canonical'),
      // ── Favicon ──────────────────────────────────────────────────────────
      link(href: '/favicon.ico', rel: 'icon', attributes: {'type': 'image/x-icon'}),
      link(href: '/favicon-32x32.png', rel: 'icon', attributes: {'type': 'image/png', 'sizes': '32x32'}),
      link(href: '/favicon-16x16.png', rel: 'icon', attributes: {'type': 'image/png', 'sizes': '16x16'}),
      link(href: '/apple-touch-icon.png', rel: 'apple-touch-icon', attributes: {'sizes': '180x180'}),
      link(href: '/site.webmanifest', rel: 'manifest'),
      // ── Open Graph ───────────────────────────────────────────────────────
      meta(attributes: {'property': 'og:type', 'content': 'website'}),
      meta(attributes: {'property': 'og:title', 'content': '${pi.name} — ${pi.title}'}),
      meta(attributes: {'property': 'og:description', 'content': metaDescription}),
      meta(attributes: {'property': 'og:site_name', 'content': '${pi.name} Portfolio'}),
      meta(attributes: {'property': 'og:url', 'content': siteUrl}),
      meta(attributes: {'property': 'og:image', 'content': pi.ogImage}),
      meta(attributes: {'property': 'og:image:alt', 'content': '${pi.name} — ${pi.title}'}),
      meta(attributes: {'property': 'og:image:width', 'content': '1200'}),
      meta(attributes: {'property': 'og:image:height', 'content': '620'}),
      // ── Twitter Card ─────────────────────────────────────────────────────
      meta(name: 'twitter:card', content: 'summary_large_image'),
      meta(name: 'twitter:title', content: '${pi.name} — ${pi.title}'),
      meta(name: 'twitter:description', content: metaDescription),
      meta(name: 'twitter:image', content: pi.ogImage),
      meta(name: 'twitter:image:alt', content: '${pi.name} — ${pi.title}'),
      // ── Schema.org Person (JSON-LD) ───────────────────────────────────────
      script(
        attributes: {'type': 'application/ld+json'},
        content: _buildPersonSchema(pi, siteUrl),
      ),
      // ── Schema.org SoftwareSourceCode — open-source packages ─────────────
      script(
        attributes: {'type': 'application/ld+json'},
        content: _buildSoftwareSchemas(pi, siteUrl),
      ),
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

/// Builds a Schema.org Person JSON-LD structured data block.
/// All data is sourced from portfolio_data.dart — no hardcoded values.
/// Helps Google display rich snippets (social links, job title, location).
String _buildPersonSchema(PersonalInformation pi, String siteUrl) {
  // Parse "City, Country" from pi.location (e.g. "Surat, India" → "Surat", "IN").
  // Falls back gracefully if the format differs.
  final locationParts = pi.location.split(',').map((part) => part.trim()).toList();
  final city = locationParts.isNotEmpty ? locationParts.first : pi.location;
  // Map full country name to ISO 3166-1 alpha-2 if known, else use as-is.
  final rawCountry = locationParts.length > 1 ? locationParts.last : '';
  final countryCode = _countryCode(rawCountry);

  return jsonEncode({
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': pi.name,
    'jobTitle': pi.title,
    'url': siteUrl,
    'email': 'mailto:${pi.email}',
    'telephone': pi.phone,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city,
      if (countryCode.isNotEmpty) 'addressCountry': countryCode,
    },
    'sameAs': [
      pi.linkedin,
      pi.github,
    ],
    // Use technical skills from portfolio_data.dart as the knowsAbout list.
    'knowsAbout': portfolio.skills.technicalSkills,
  });
}

/// Builds a JSON-LD @graph of Schema.org SoftwareSourceCode nodes,
/// one per open-source contribution. Helps Google surface published packages
/// in search results with author, description, and programming language.
/// All data sourced from portfolio_data.dart — no hardcoded values.
String _buildSoftwareSchemas(PersonalInformation pi, String siteUrl) {
  final items = portfolio.openSourceContributions.map((os) {
    final pubUrl = 'https://pub.dev/packages/${os.name}';
    final repoUrl = os.github ?? 'https://github.com/${pi.github.split('/').last}/${os.name}';

    return {
      '@type': 'SoftwareSourceCode',
      'name': os.name,
      'description': os.description,
      'url': pubUrl,
      'codeRepository': repoUrl,
      'programmingLanguage': {
        '@type': 'ComputerLanguage',
        'name': 'Dart',
      },
      'runtimePlatform': 'Flutter',
      'author': {
        '@type': 'Person',
        'name': pi.name,
        'url': siteUrl,
      },
      'keywords': os.technologiesUsed.join(', '),
      'featureList': os.keyFeatures,
      'maintainer': {
        '@type': 'Person',
        'name': pi.name,
      },
    };
  }).toList();

  return jsonEncode({
    '@context': 'https://schema.org',
    '@graph': items,
  });
}

/// Maps common country names to ISO 3166-1 alpha-2 codes.
/// Add entries here as needed when pi.location changes.
String _countryCode(String country) {
  const codes = {
    'india': 'IN',
    'united states': 'US',
    'united kingdom': 'GB',
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
  };
  return codes[country.toLowerCase()] ?? country;
}


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
