import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';

class EducationRow extends StatelessComponent {
  final Education education;
  const EducationRow({required this.education, super.key});

  @override
  Component build(BuildContext context) {
    return div(classes: 'card education-row', [
      // Left: degree + institution
      div(classes: 'education-left', [
        div(classes: 'education-degree', [.text(education.degree)]),
        div(classes: 'education-institution', [
          .text('${education.institution}, ${education.location}'),
        ]),
      ]),

      // Right: duration + CGPA
      div(classes: 'education-right', [
        span(classes: 'education-duration', [.text(education.duration)]),
        if (education.cgpa != null)
          span(classes: 'cgpa-badge', [.text('CGPA: ${education.cgpa}')]),
      ]),
    ]);
  }
}
