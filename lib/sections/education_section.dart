import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../data/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/education_row.dart';

class EducationSection extends StatelessComponent {
  const EducationSection({super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'education', [
      SectionWrapper(
        index: '// 07 · EDUCATION',
        heading: 'Education.',
        children: [
          div(classes: 'education-list', [
            for (final edu in portfolio.education)
              EducationRow(education: edu),
          ]),
        ],
      ),
    ]);
  }
}
