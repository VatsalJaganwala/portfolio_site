import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import '../data/portfolio_data.dart';

/// Floating WhatsApp contact widget.
///
/// Desktop (>768 px): a fixed card in the bottom-right corner that shows a
/// styled SVG QR code (rendered by qr-code-styling via web/js/qr.js) with
/// the WhatsApp logo embedded in the centre. Clicking the card opens WhatsApp.
///
/// Mobile (≤768 px): a circular FAB in the bottom-right corner with the
/// WhatsApp logo. Tapping opens WhatsApp.
///
/// QR generation is handled entirely by JS after hydration — Dart only
/// renders the container div with the target URL as a data attribute.
/// This avoids any external image API dependency and keeps the QR dynamic.
class WhatsAppWidget extends StatelessComponent {
  const WhatsAppWidget({super.key});

  @override
  Component build(BuildContext context) {
    // Strip non-digit characters (e.g. '+91...' → '91...').
    final rawPhone = portfolio.personalInformation.phone;
    final phone = rawPhone.replaceAll(RegExp(r'\D'), '');

    // wa.me is the canonical short-link format for WhatsApp deep links.
    // final waUrl = 'https://wa.me/$phone&text=Hello';
    final waUrl = 'https://wa.me/$phone?text=Hello';

    return div([
      // ── Desktop QR card ──────────────────────────────────────────────────
      // The outer <a> makes the whole card clickable — same href as the QR.
      a(
        href: waUrl,
        target: Target.blank,
        attributes: {'rel': 'noopener noreferrer'},
        classes: 'wa-qr-card',
        [
          div(classes: 'wa-qr-wrapper', [
            // Empty container — qr.js renders the SVG QR code into this div
            // after hydration. The data-wa-url attribute carries the target
            // URL so JS never needs to re-compute it from Dart state.
            div(
              id: 'wa-qr-canvas',
              classes: 'wa-qr-canvas',
              attributes: {'data-wa-url': waUrl},
              [],
            ),
          ]),
          div(classes: 'wa-qr-label', [.text('Scan to chat')]),
        ],
      ),

      // ── Mobile FAB ───────────────────────────────────────────────────────
      a(
        href: waUrl,
        target: Target.blank,
        attributes: {
          'rel': 'noopener noreferrer',
          'aria-label': 'Chat on WhatsApp',
        },
        classes: 'wa-fab',
        [
          img(
            src: '/assets/whatsapp.svg',
            alt: 'WhatsApp',
            classes: 'wa-fab-icon',
            width: 28,
            height: 28,
          ),
        ],
      ),
    ]);
  }
}
