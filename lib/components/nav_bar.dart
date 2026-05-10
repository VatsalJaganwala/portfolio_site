import 'package:jaspr/jaspr.dart';
import 'package:jaspr/dom.dart';
import '../data/portfolio_data.dart';

class NavBar extends StatelessComponent {
  const NavBar({super.key});

  @override
  Component build(BuildContext context) {
    final pi = portfolio.personalInformation;
    final name = pi.name.replaceAll(' ', '_').toLowerCase();

    return div([
      nav(classes: 'navbar', [
        div(classes: 'navbar-inner', [
          a(href: '#hero', classes: 'navbar-logo', [.text(name)]),
          div(classes: 'navbar-links', [
            a(href: '#projects', classes: 'nav-link', [.text('work')]),
            a(href: '#about', classes: 'nav-link', [.text('about')]),
            a(href: '#experience', classes: 'nav-link', [.text('experience')]),
            a(href: '#contact', classes: 'nav-link', [.text('contact')]),
          ]),
          div(classes: 'navbar-right', [
            if (pi.isAvailable)
              a(
                href: 'mailto:${pi.email}',
                classes: 'open-to-work-pill',
                [.text('Open to work')],
              ),
          ]),
        ]),
      ]),
      // Mobile bottom nav
      div(classes: 'bottom-nav', [
        a(href: '#projects', classes: 'bottom-nav-link', [.text('work')]),
        a(href: '#about', classes: 'bottom-nav-link', [.text('about')]),
        a(href: '#experience', classes: 'bottom-nav-link', [.text('experience')]),
        a(href: '#contact', classes: 'bottom-nav-link', [.text('contact')]),
      ]),
    ]);
  }
}
