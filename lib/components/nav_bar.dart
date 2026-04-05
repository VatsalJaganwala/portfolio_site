import 'package:jaspr/jaspr.dart';
import 'package:jaspr/dom.dart';
import '../models/portfolio_data.dart';

class NavBar extends StatelessComponent {
  const NavBar({required this.data, super.key});

  final PortfolioData data;

  @override
  Component build(BuildContext context) {
    final pi = data.personalInformation;
    final name = pi.name.replaceAll(' ', '_').toLowerCase();
    final email = pi.email;

    return div([
      nav(classes: 'navbar', [
        div(classes: 'navbar-inner', [
          // Logo
          a([.text('${name}')], href: '#hero', classes: 'navbar-logo'),

          // Desktop nav links
          div(classes: 'navbar-links', [
            a([.text('work')], href: '#projects', classes: 'nav-link'),
            a([.text('about')], href: '#about', classes: 'nav-link'),
            a([.text('experience')], href: '#experience', classes: 'nav-link'),
            a([.text('contact')], href: '#contact', classes: 'nav-link'),
          ]),

          // Right: open to work pill + hamburger
          div(classes: 'navbar-right', [
            a(
              [.text('Open to work')],
              href: 'mailto:$email',
              classes: 'open-to-work-pill',
            ),
          ]),
        ]),
      ]),

      // Bottom Navigation Bar for Mobile
      div(
        [
          a([.text('work')], href: '#projects', classes: 'bottom-nav-link'),
          a([.text('about')], href: '#about', classes: 'bottom-nav-link'),
          a([.text('experience')], href: '#experience', classes: 'bottom-nav-link'),
          a([.text('contact')], href: '#contact', classes: 'bottom-nav-link'),
        ],
        classes: 'bottom-nav',
      ),
    ]);
  }
}
