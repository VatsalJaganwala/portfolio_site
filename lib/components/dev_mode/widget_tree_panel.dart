import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

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

const List<TreeNodeData> kTreeNodes = [
  // ── Root ──────────────────────────────────────────────────────────────────
  TreeNodeData(id: 'material-app',    label: 'MaterialApp',             args: 'title: "Vatsal Jaganwala"',     indent: 0, hasChildren: true),
  TreeNodeData(id: 'scaffold',        label: 'Scaffold',                args: '',                              indent: 1, hasChildren: true,  parentId: 'material-app'),
  TreeNodeData(id: 'navbar',          label: 'NavBar',                  args: '',                              indent: 2, hasChildren: false, parentId: 'scaffold'),
  TreeNodeData(id: 'body',            label: 'SingleChildScrollView',   args: '',                              indent: 2, hasChildren: true,  parentId: 'scaffold'),

  // ── Hero ──────────────────────────────────────────────────────────────────
  TreeNodeData(id: 'hero',            label: 'HeroSection',             args: '',                              indent: 3, hasChildren: true,  parentId: 'body', section: 'hero'),
  TreeNodeData(id: 'hero-cta-work',   label: 'CTAButton',               args: 'label: "View my work →"',       indent: 4, hasChildren: false, parentId: 'hero'),
  TreeNodeData(id: 'hero-cta-contact',label: 'CTAButton',               args: 'label: "Contact ↗"',            indent: 4, hasChildren: false, parentId: 'hero'),
  TreeNodeData(id: 'hero-code-card',  label: 'DeveloperProfileCard',    args: '',                              indent: 4, hasChildren: false, parentId: 'hero'),

  // ── Projects ──────────────────────────────────────────────────────────────
  TreeNodeData(id: 'projects',        label: 'ProjectsSection',         args: 'itemCount: 5',                  indent: 3, hasChildren: true,  parentId: 'body', section: 'projects'),
  TreeNodeData(id: 'project-1',       label: 'ProjectCard',             args: 'title: "Business Management System"',   indent: 4, hasChildren: false, parentId: 'projects', section: 'project-1'),
  TreeNodeData(id: 'project-2',       label: 'ProjectCard',             args: 'title: "Rehabilitation Workflow App"',  indent: 4, hasChildren: false, parentId: 'projects', section: 'project-2'),
  TreeNodeData(id: 'project-3',       label: 'ProjectCard',             args: 'title: "Parking Management Platform"', indent: 4, hasChildren: false, parentId: 'projects', section: 'project-3'),
  TreeNodeData(id: 'project-4',       label: 'ProjectCard',             args: 'title: "Community Management App"',    indent: 4, hasChildren: false, parentId: 'projects', section: 'project-4'),
  TreeNodeData(id: 'project-5',       label: 'ProjectCard',             args: 'title: "2D to 3D Visualization"',      indent: 4, hasChildren: false, parentId: 'projects', section: 'project-5'),

  // ── About ─────────────────────────────────────────────────────────────────
  TreeNodeData(id: 'about',           label: 'AboutSection',            args: '',                              indent: 3, hasChildren: true,  parentId: 'body', section: 'about'),
  TreeNodeData(id: 'about-blockquote',label: 'Blockquote',              args: '',                              indent: 4, hasChildren: false, parentId: 'about'),
  TreeNodeData(id: 'about-code',      label: 'DeveloperCodeBlock',      args: '',                              indent: 4, hasChildren: false, parentId: 'about'),
  TreeNodeData(id: 'about-status',    label: 'StatusCard',              args: 'available: true',               indent: 4, hasChildren: false, parentId: 'about'),

  // ── Skills ────────────────────────────────────────────────────────────────
  TreeNodeData(id: 'skills',          label: 'SkillsSection',           args: '',                              indent: 3, hasChildren: true,  parentId: 'body', section: 'skills'),
  TreeNodeData(id: 'skills-tech',     label: 'SkillPillRow',            args: 'group: "technical_skills"',     indent: 4, hasChildren: false, parentId: 'skills'),
  TreeNodeData(id: 'skills-soft',     label: 'SkillPillRow',            args: 'group: "soft_skills"',          indent: 4, hasChildren: false, parentId: 'skills'),
  TreeNodeData(id: 'skills-lang',     label: 'SkillPillRow',            args: 'group: "languages"',            indent: 4, hasChildren: false, parentId: 'skills'),

  // ── Experience ────────────────────────────────────────────────────────────
  TreeNodeData(id: 'experience',      label: 'ExperienceSection',       args: 'entries: 1',                    indent: 3, hasChildren: true,  parentId: 'body', section: 'experience'),
  TreeNodeData(id: 'exp-entry-1',     label: 'ExperienceEntry',         args: 'company: "Instance IT Solutions"', indent: 4, hasChildren: false, parentId: 'experience'),
  TreeNodeData(id: 'exp-cta',         label: 'CTAButton',               args: 'label: "Open to new opportunities"', indent: 4, hasChildren: false, parentId: 'experience'),

  // ── Open Source ───────────────────────────────────────────────────────────
  TreeNodeData(id: 'open-source',     label: 'OpenSourceSection',       args: 'packages: 2',                   indent: 3, hasChildren: true,  parentId: 'body', section: 'open-source'),
  TreeNodeData(id: 'os-smartpub',     label: 'OpenSourceCard',          args: 'name: "smartpub"',              indent: 4, hasChildren: false, parentId: 'open-source'),
  TreeNodeData(id: 'os-logger',       label: 'OpenSourceCard',          args: 'name: "flutter_logger_pro"',    indent: 4, hasChildren: false, parentId: 'open-source'),

  // ── Education ─────────────────────────────────────────────────────────────
  TreeNodeData(id: 'education',       label: 'EducationSection',        args: 'entries: 3',                    indent: 3, hasChildren: true,  parentId: 'body', section: 'education'),
  TreeNodeData(id: 'edu-1',           label: 'EducationRow',            args: 'degree: "B.E. in IT"',          indent: 4, hasChildren: false, parentId: 'education'),
  TreeNodeData(id: 'edu-2',           label: 'EducationRow',            args: 'degree: "Higher Secondary"',    indent: 4, hasChildren: false, parentId: 'education'),
  TreeNodeData(id: 'edu-3',           label: 'EducationRow',            args: 'degree: "Secondary School"',    indent: 4, hasChildren: false, parentId: 'education'),

  // ── Achievements ──────────────────────────────────────────────────────────
  TreeNodeData(id: 'achievements',    label: 'AchievementsSection',     args: 'count: 2',                      indent: 3, hasChildren: true,  parentId: 'body', section: 'achievements'),
  TreeNodeData(id: 'ach-1',           label: 'AchievementCard',         args: 'title: "Silent Achiever Award"', indent: 4, hasChildren: false, parentId: 'achievements'),
  TreeNodeData(id: 'ach-2',           label: 'AchievementCard',         args: 'title: "On The Spot Award"',    indent: 4, hasChildren: false, parentId: 'achievements'),

  // ── Contact ───────────────────────────────────────────────────────────────
  TreeNodeData(id: 'contact',         label: 'ContactSection',          args: '',                              indent: 3, hasChildren: true,  parentId: 'body', section: 'contact'),
  TreeNodeData(id: 'contact-email',   label: 'CTAButton',               args: 'label: "Send an email"',        indent: 4, hasChildren: false, parentId: 'contact'),
  TreeNodeData(id: 'contact-linkedin',label: 'CTAButton',               args: 'label: "LinkedIn ↗"',           indent: 4, hasChildren: false, parentId: 'contact'),
  TreeNodeData(id: 'contact-github',  label: 'CTAButton',               args: 'label: "GitHub ↗"',             indent: 4, hasChildren: false, parentId: 'contact'),
  TreeNodeData(id: 'contact-footer',  label: 'Footer',                  args: '',                              indent: 4, hasChildren: false, parentId: 'contact'),

  // ── FAB ───────────────────────────────────────────────────────────────────
  TreeNodeData(id: 'fab',             label: 'FloatingActionButton',    args: 'onPressed: HireCallback',       indent: 2, hasChildren: false, parentId: 'scaffold'),
];

/// Renders the widget tree panel. Interactivity handled by devmode.js.
class WidgetTreePanel extends StatelessComponent {
  const WidgetTreePanel({super.key});

  @override
  Component build(BuildContext context) {
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
        ..._buildAllNodes(),
      ]),
    ]);
  }

  List<Component> _buildAllNodes() {
    return kTreeNodes.map(_buildNode).toList();
  }

  Component _buildNode(TreeNodeData node) {
    const basePx = 4;
    final String arrow = node.hasChildren ? '▼' : '•';

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
      attributes: {
        ...attrs,
        'style': 'padding-left: ${basePx}px',
      },
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
