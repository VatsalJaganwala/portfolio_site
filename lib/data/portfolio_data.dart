import '../models/portfolio_data.dart';

/// Single source of truth for all portfolio content.
/// Edit this file to update the website — no JSON, no runtime parsing.
const PortfolioData portfolio = PortfolioData(
  // ─── Personal ────────────────────────────────────────────────────────────
  personalInformation: PersonalInformation(
    name: 'Vatsal Jaganwala',
    title: 'Flutter Developer',
    email: 'vatsaljaganwala@gmail.com',
    phone: '+917041355506',
    location: 'Surat, India',
    linkedin: 'https://linkedin.com/in/vatsaljaganwala',
    github: 'https://github.com/vatsaljaganwala',
    siteUrl: 'https://vatsaljaganwalacom.web.app',
    // OG share image — 1200×620px banner at web/images/ogImage.png.
    ogImage: 'https://vatsaljaganwalacom.web.app/images/ogImage.png',
    isAvailable: false,
  ),

  // ─── Summary ─────────────────────────────────────────────────────────────
  summary:
      'Flutter Developer, experienced in '
      'building cross-platform mobile and web applications with Flutter and '
      'GetX. Skilled in Firebase, REST APIs, SDLC execution, and agile '
      'delivery, with a strong focus on clean code, problem-solving, and '
      'shipping reliable client solutions.',

  // ─── Skills ──────────────────────────────────────────────────────────────
  skills: Skills(
    technicalSkills: [
      'Flutter',
      'Dart',
      'GetX',
      'Firebase',
      'REST APIs',
      'Cross-platform development',
      'Object-oriented programming',
      'Version control (Git)',
    ],
    softSkills: [
      'Problem-solving',
      'Team collaboration',
      'Analytical thinking',
      'Agile development',
    ],
    languages: ['English', 'Hindi', 'Gujarati'],
  ),

  // ─── Work Experience ─────────────────────────────────────────────────────
  workExperience: [
    WorkExperience(
      jobTitle: 'Associate Flutter Developer',
      company: 'Instance IT Solutions',
      location: 'Surat, India',
      startDate: '08/2023',
      endDate: 'Present',
      employmentType: 'Full-time',
      responsibilities: [
        'Develop cross-platform applications for Android, iOS, and Web using Flutter.',
        'Participate in the full software development lifecycle from requirements gathering to implementation.',
        'Write clean, testable, and maintainable code.',
        'Apply agile practices to deliver high-quality solutions within deadlines.',
        'Continuously learn and adapt to new technologies and industry changes.',
        'Use analytical thinking and problem-solving skills to support innovative client solutions.',
      ],
    ),
  ],

  // ─── Projects ────────────────────────────────────────────────────────────
  projects: [
    Project(
      name: 'Business Management System for Retail Operations',
      platforms: ['Web'],
      description:
          'Designed and developed a centralized system to manage inventory, '
          'production workflows, and point-of-sale operations for a retail '
          'business. The platform replaced manual processes and improved '
          'operational efficiency.',
      technologiesUsed: ['Flutter', 'REST APIs'],
    ),
    Project(
      name: 'Rehabilitation Workflow Management Application',
      platforms: ['Android', 'iOS', 'Web'],
      description:
          'Built a workflow-driven application to manage large-scale relocation '
          'and rehabilitation processes with geo-referenced planning and '
          'automated documentation.',
      technologiesUsed: ['Flutter', 'Geo-mapping', 'DWG visualization'],
    ),
    Project(
      name: 'Parking Management and Allocation Platform',
      platforms: ['Android', 'iOS', 'Web'],
      description:
          'Developed a platform for visualizing parking layouts, extracting '
          'parking inventory, and enabling intelligent space allocation using '
          'optimized logic.',
      technologiesUsed: ['Flutter', 'DWG visualization', 'Algorithms'],
    ),
    Project(
      name: 'Residential Community Management Application',
      platforms: ['Android', 'iOS'],
      description:
          'Created a mobile application to manage community communication, '
          'events, visitor tracking, and parcel handling through a centralized '
          'platform.',
      technologiesUsed: ['Flutter', 'Firebase'],
    ),
    Project(
      name: '2D to 3D Architectural Visualization Platform',
      platforms: ['Web'],
      description:
          'Built a web platform that converts 2D architectural plans into '
          'interactive 3D models with geo-referenced mapping and structural '
          'insights.',
      technologiesUsed: ['Flutter', '3D visualization', 'Geo-mapping'],
    ),
    Project(
      name: 'Construction Drawing Management Platform',
      platforms: ['Web'],
      description:
          'Developed a centralized web-based drawing and document management '
          'platform for construction and infrastructure projects, enabling '
          'secure access to the latest PDF and AutoDesk (.NWD/.DWG) files '
          'through QR-based workflows, version control, and Autodesk Viewer '
          'integration.',
      technologiesUsed: [
        'Flutter',
        'Web Application Development',
        'Autodesk Viewer API',
        'QR Code Integration',
        'PDF Viewer',
        'Role-Based Access Control',
        'Version Control System',
        'Payment Gateway Integration',
        'Cloud File Management',
      ],
    ),
  ],

  // ─── Open Source ─────────────────────────────────────────────────────────
  openSourceContributions: [
    OpenSourceContribution(
      name: 'smartpub',
      role: 'Creator / Maintainer',
      description:
          'A Flutter and Dart CLI tool that helps developers identify unused '
          'dependencies, organize pubspec.yaml, and maintain dependency '
          'hygiene through a safe, preview-first workflow.',
      keyFeatures: [
        'Unused dependency detection',
        'Preview-first analysis mode',
        'Interactive cleanup flow',
        'Dependency grouping and organization',
        'Backup and restore support',
      ],
      technologiesUsed: ['Dart', 'Flutter', 'CLI', 'YAML parsing'],
    ),
    OpenSourceContribution(
      name: 'flutter_logger_pro',
      role: 'Creator / Maintainer',
      description:
          'A structured logging solution for Flutter and Dart that enables '
          'developers to generate readable, formatted, and JSON-based logs '
          'with enhanced debugging capabilities across platforms.',
      keyFeatures: [
        'Structured logging with multiple levels',
        'JSON log output support',
        'Customizable formatting',
        'Improved debugging readability',
        'Cross-platform support',
      ],
      technologiesUsed: ['Dart', 'Flutter', 'Logging systems', 'JSON'],
    ),
  ],

  // ─── Education ───────────────────────────────────────────────────────────
  education: [
    Education(
      degree: 'Bachelor of Engineering in Information Technology',
      institution: 'Sardar Vallabhbhai Patel Institute of Technology',
      location: 'Vasad, Anand',
      startDate: '08/2020',
      endDate: '08/2024',
      cgpa: '8.23',
    ),
    Education(
      degree: 'Higher Secondary Education (PCM)',
      institution: 'Riverdale Academy',
      location: 'Surat',
      endDate: '03/2020',
    ),
    Education(
      degree: 'Secondary School Education',
      institution: 'S. D. R. Umrigar School',
      location: 'Surat',
      endDate: '03/2018',
    ),
  ],

  // ─── Achievements ────────────────────────────────────────────────────────
  achievements: [
    Achievement(
      title: 'Silent Achiever Award',
      organization: 'Instance IT Solutions',
      date: '01/04/2025',
      description:
          'Recognized for consistently delivering excellent results and '
          'high-quality work.',
    ),
    Achievement(
      title: 'On The Spot Award',
      organization: 'Instance IT Solutions',
      date: '01/05/2024',
      description: 'Recognized for outstanding dedication and hard work.',
    ),
  ],
);
