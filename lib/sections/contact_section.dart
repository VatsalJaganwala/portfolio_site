import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/cta_button.dart';

class ContactSection extends StatelessComponent {
  const ContactSection({super.key});

  @override
  Component build(BuildContext context) {
    final pi = portfolio.personalInformation;

    final sentences = portfolio.summary.split('. ');
    final subtext = sentences.length > 1
        ? '${sentences.last.trim()}${sentences.last.trim().endsWith('.') ? '' : '.'}'
        : portfolio.summary;

    final year = DateTime.now().year;

    return div(id: 'contact', [
      SectionWrapper(
        index: '// 09 · CONTACT',
        heading: "Let's Build\nTogether.",
        children: [
          p(classes: 'contact-subtext', [.text(subtext)]),
          div(classes: 'contact-buttons', [
            CTAButton(label: '✉ Send an email', href: 'mailto:${pi.email}', variant: ButtonVariant.primary),
            CTAButton(label: 'LinkedIn ↗', href: pi.linkedin, variant: ButtonVariant.primary),
            CTAButton(label: 'GitHub ↗', href: pi.github, variant: ButtonVariant.ghost),
            CTAButton(label: pi.phone, href: 'tel:${pi.phone}', variant: ButtonVariant.ghost),
          ]),
          div(classes: 'contact-info-grid', [
            _infoCard('EMAIL', pi.email),
            _infoCard('LOCATION', pi.location),
            _infoCard('LINKEDIN', _trimUrl(pi.linkedin)),
            _infoCard('GITHUB', _trimUrl(pi.github)),
          ]),
        ],
      ),
      footer(classes: 'footer', [
        div(classes: 'footer-inner', [
          span(classes: 'footer-text', [
            // .text('Built with '),
            // span([.text('<Jaspr />')]),
            // .text(' · Designed from scratch'),
          ]),
          span(classes: 'footer-text', [.text('${pi.siteUrl} · $year')]),
        ]),
      ]),
    ]);
  }

  static Component _infoCard(String label, String value) {
    return div(classes: 'contact-info-card', [
      div(classes: 'contact-info-label', [.text(label)]),
      div(classes: 'contact-info-value', [.text(value)]),
    ]);
  }

  static String _trimUrl(String url) =>
      url.replaceFirst('https://', '').replaceFirst('http://', '');
}
