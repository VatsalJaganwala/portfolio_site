import 'dart:convert';
import 'package:jaspr/server.dart';
import 'package:jaspr/dom.dart';

import 'app.dart';
import 'data/portfolio_static.dart';
import 'models/portfolio_data.dart';

void main() {
  Jaspr.initializeApp();
  
  // Parse statically injected JSON instead of doing it continuously from disk!
  final json = jsonDecode(portfolioDataRaw);
  final data = PortfolioData.fromJson(json);

  runApp(Document(
    title: 'Vatsal Jaganwala — Flutter Developer',
    head: [
      meta(
        name: 'description',
        content: 'Vatsal Jaganwala — Flutter Developer building cross-platform apps with Flutter & Dart.',
      ),
      meta(
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      ),
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
      script(src: 'animate.js'),
    ],
    body: App(data: data),
  ));
}
