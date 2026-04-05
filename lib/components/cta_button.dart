import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

enum ButtonVariant { primary, ghost }

class CTAButton extends StatelessComponent {
  final String label;
  final String? href;
  final ButtonVariant variant;
  final bool isSmall;

  const CTAButton({
    required this.label,
    this.href,
    this.variant = ButtonVariant.primary,
    this.isSmall = false,
    super.key,
  });

  @override
  Component build(BuildContext context) {
    final cls = [
      'btn',
      variant == ButtonVariant.primary ? 'btn-primary' : 'btn-ghost',
      if (isSmall) 'btn-sm',
    ].join(' ');

    final link = href;
    if (link != null) {
      final isExternal = link.startsWith('http') || link.startsWith('mailto') || link.startsWith('tel');
      // ignore: sort_children_last
      return a(
        [.text(label)],
        href: link,
        target: isExternal ? Target.blank : null,
        attributes: isExternal ? {'rel': 'noopener noreferrer'} : null,
        classes: cls,
      );
    }
    // ignore: sort_children_last
    return button([.text(label)], classes: cls);
  }
}
