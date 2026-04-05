import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../models/portfolio_data.dart';
import '../components/section_wrapper.dart';
import '../components/education_row.dart';

class EducationSection extends StatelessComponent {
  final PortfolioData data;
  const EducationSection({required this.data, super.key});

  @override
  Component build(BuildContext context) {
    return div(id: 'education', [
      SectionWrapper(
        index: '// 07 · EDUCATION',
        heading: 'Education.',
        children: [
          div(classes: 'education-list', [
            for (final edu in data.education)
              EducationRow(education: edu),
          ]),
        ],
      ),
    ]);
  }
}
