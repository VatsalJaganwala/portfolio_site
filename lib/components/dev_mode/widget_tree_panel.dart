import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';
import '../../data/portfolio_data.dart';

class TreeNodeData {
  final String id;
  final String label;
  final String args;
  final int indent;
  final bool hasChildren;
  final String? section;
  final String? parentId;

  const TreeNodeData({
    required this.id,
    required this.label,
    required this.args,
    required this.indent,
    required this.hasChildren,
    this.section,
    this.parentId,
  });
}

/// Builds the widget tree node list from the live portfolio data.
/// This ensures tree labels, counts, and names always match the actual content.
List<TreeNodeData> buildTreeNodes() {
  final p = portfolio;
  final pi = p.personalInformation;

  return [
    // ── Root ────────────────────────────────────────────────────────────────
    TreeNodeData(id: 'material-app', label: 'MaterialApp',
        args: 'title: "${pi.name}"', indent: 0, hasChildren: true),
    TreeNodeData(id: 'scaffold', label: 'Scaffold',
        args: '', indent: 1, hasChildren: true, parentId: 'material-app'),
    TreeNodeData(id: 'navbar', label: 'NavBar',
        args: '', indent: 2, hasChildren: false, parentId: 'scaffold'),
    TreeNodeData(id: 'body', label: 'SingleChildScrollView',
        args: '', indent: 2, hasChildren: true, parentId: 'scaffold'),

    // ── Hero ────────────────────────────────────────────────────────────────
    TreeNodeData(id: 'hero', label: 'HeroSection',
        args: '', indent: 3, hasChildren: true, parentId: 'body', section: 'hero'),
    TreeNodeData(id: 'hero-cta-work', label: 'CTAButton',
        args: 'label: "View my work →"', indent: 4, hasChildren: false, parentId: 'hero'),
    TreeNodeData(id: 'hero-cta-contact', label: 'CTAButton',
        args: 'label: "Contact ↗"', indent: 4, hasChildren: false, parentId: 'hero'),
    TreeNodeData(id: 'hero-code-card', label: 'DeveloperProfileCard',
        args: '', indent: 4, hasChildren: false, parentId: 'hero'),

    // ── Projects ────────────────────────────────────────────────────────────
    TreeNodeData(id: 'projects', label: 'ProjectsSection',
        args: 'itemCount: ${p.projects.length}',
        indent: 3, hasChildren: p.projects.isNotEmpty, parentId: 'body', section: 'projects'),
    for (int i = 0; i < p.projects.length; i++)
      TreeNodeData(
        id: 'project-${i + 1}',
        label: 'ProjectCard',
        args: 'title: "${p.projects[i].name}"',
        indent: 4,
        hasChildren: false,
        parentId: 'projects',
        section: 'project-${i + 1}',
      ),

    // ── About ───────────────────────────────────────────────────────────────
    TreeNodeData(id: 'about', label: 'AboutSection',
        args: '', indent: 3, hasChildren: true, parentId: 'body', section: 'about'),
    TreeNodeData(id: 'about-blockquote', label: 'Blockquote',
        args: '', indent: 4, hasChildren: false, parentId: 'about'),
    TreeNodeData(id: 'about-code', label: 'DeveloperCodeBlock',
        args: '', indent: 4, hasChildren: false, parentId: 'about'),
    TreeNodeData(id: 'about-status', label: 'StatusCard',
        args: 'available: ${pi.isAvailable}', indent: 4, hasChildren: false, parentId: 'about'),

    // ── Skills ──────────────────────────────────────────────────────────────
    TreeNodeData(id: 'skills', label: 'SkillsSection',
        args: '', indent: 3, hasChildren: true, parentId: 'body', section: 'skills'),
    TreeNodeData(id: 'skills-tech', label: 'SkillPillRow',
        args: 'group: "technical_skills"', indent: 4, hasChildren: false, parentId: 'skills'),
    TreeNodeData(id: 'skills-soft', label: 'SkillPillRow',
        args: 'group: "soft_skills"', indent: 4, hasChildren: false, parentId: 'skills'),
    TreeNodeData(id: 'skills-lang', label: 'SkillPillRow',
        args: 'group: "languages"', indent: 4, hasChildren: false, parentId: 'skills'),

    // ── Experience ──────────────────────────────────────────────────────────
    TreeNodeData(id: 'experience', label: 'ExperienceSection',
        args: 'entries: ${p.workExperience.length}',
        indent: 3, hasChildren: p.workExperience.isNotEmpty, parentId: 'body', section: 'experience'),
    for (int i = 0; i < p.workExperience.length; i++)
      TreeNodeData(
        id: 'exp-entry-${i + 1}',
        label: 'ExperienceEntry',
        args: 'company: "${p.workExperience[i].company}"',
        indent: 4,
        hasChildren: false,
        parentId: 'experience',
      ),
    if (pi.isAvailable)
      TreeNodeData(id: 'exp-cta', label: 'CTAButton',
          args: 'label: "Open to new opportunities"',
          indent: 4, hasChildren: false, parentId: 'experience'),

    // ── Open Source ─────────────────────────────────────────────────────────
    TreeNodeData(id: 'open-source', label: 'OpenSourceSection',
        args: 'packages: ${p.openSourceContributions.length}',
        indent: 3, hasChildren: p.openSourceContributions.isNotEmpty,
        parentId: 'body', section: 'open-source'),
    for (final os in p.openSourceContributions)
      TreeNodeData(
        id: 'os-${os.name}',
        label: 'OpenSourceCard',
        args: 'name: "${os.name}"',
        indent: 4,
        hasChildren: false,
        parentId: 'open-source',
      ),

    // ── Education ───────────────────────────────────────────────────────────
    TreeNodeData(id: 'education', label: 'EducationSection',
        args: 'entries: ${p.education.length}',
        indent: 3, hasChildren: p.education.isNotEmpty, parentId: 'body', section: 'education'),
    for (int i = 0; i < p.education.length; i++)
      TreeNodeData(
        id: 'edu-${i + 1}',
        label: 'EducationRow',
        args: 'degree: "${_shortDegree(p.education[i].degree)}"',
        indent: 4,
        hasChildren: false,
        parentId: 'education',
      ),

    // ── Achievements ────────────────────────────────────────────────────────
    TreeNodeData(id: 'achievements', label: 'AchievementsSection',
        args: 'count: ${p.achievements.length}',
        indent: 3, hasChildren: p.achievements.isNotEmpty,
        parentId: 'body', section: 'achievements'),
    for (int i = 0; i < p.achievements.length; i++)
      TreeNodeData(
        id: 'ach-${i + 1}',
        label: 'AchievementCard',
        args: 'title: "${p.achievements[i].title}"',
        indent: 4,
        hasChildren: false,
        parentId: 'achievements',
      ),

    // ── Contact ─────────────────────────────────────────────────────────────
    TreeNodeData(id: 'contact', label: 'ContactSection',
        args: '', indent: 3, hasChildren: true, parentId: 'body', section: 'contact'),
    TreeNodeData(id: 'contact-email', label: 'CTAButton',
        args: 'label: "Send an email"', indent: 4, hasChildren: false, parentId: 'contact'),
    TreeNodeData(id: 'contact-linkedin', label: 'CTAButton',
        args: 'label: "LinkedIn ↗"', indent: 4, hasChildren: false, parentId: 'contact'),
    TreeNodeData(id: 'contact-github', label: 'CTAButton',
        args: 'label: "GitHub ↗"', indent: 4, hasChildren: false, parentId: 'contact'),
    TreeNodeData(id: 'contact-footer', label: 'Footer',
        args: '', indent: 4, hasChildren: false, parentId: 'contact'),

    // ── FAB ─────────────────────────────────────────────────────────────────
    TreeNodeData(id: 'fab', label: 'FloatingActionButton',
        args: 'onPressed: HireCallback', indent: 2, hasChildren: false, parentId: 'scaffold'),
  ];
}

/// Abbreviates a degree string for the tree args display.
String _shortDegree(String degree) {
  if (degree.length <= 30) return degree;
  return '${degree.substring(0, 28)}…';
}

/// Renders the widget tree panel. Interactivity handled by devmode.js.
class WidgetTreePanel extends StatelessComponent {
  const WidgetTreePanel({super.key});

  @override
  Component build(BuildContext context) {
    final nodes = buildTreeNodes();

    return div(classes: 'dt-tree-panel devtools-panel', [
      div(classes: 'dt-panel-header', [
        span(classes: 'dt-panel-title', [.text('Widget tree')]),
        button(classes: 'dt-panel-action', [.text('↺')]),
      ]),
      div(classes: 'dt-tree-search-wrap', [
        span(classes: 'dt-tree-search-icon', [.text('🔍')]),
        input(
          classes: 'dt-tree-search',
          type: InputType.text,
          attributes: {'placeholder': 'Search widgets...'},
        ),
      ]),
      div(classes: 'dt-tree-body', [
        for (final node in nodes) _buildNode(node),
      ]),
    ]);
  }

  Component _buildNode(TreeNodeData node) {
    const basePx = 4;
    final arrow = node.hasChildren ? '▼' : '•';

    final attrs = <String, String>{
      'data-node': node.id,
      if (node.section != null) 'data-section': node.section!,
      if (node.parentId != null) 'data-parent': node.parentId!,
    };

    final guides = List.generate(
      node.indent,
      (_) => span(classes: 'tree-node-guide', []),
    );

    return div(
      classes: 'tree-node',
      attributes: {...attrs, 'style': 'padding-left: ${basePx}px'},
      [
        ...guides,
        span(classes: 'tree-node-toggle', [.text(arrow)]),
        div(classes: 'tree-node-content', [
          span(classes: 'tree-node-name', [.text(node.label)]),
          span(classes: 'tree-node-paren', [.text('(')]),
          if (node.args.isNotEmpty)
            span(classes: 'tree-node-args', [.text(node.args)]),
          span(classes: 'tree-node-paren', [.text(')')]),
        ]),
      ],
    );
  }
}
