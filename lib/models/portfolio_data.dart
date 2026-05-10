/// Strongly-typed, immutable portfolio models.
/// No JSON parsing — all data lives in lib/data/portfolio_data.dart as const.
library;

class PersonalInformation {
  final String name;
  final String title;
  final String email;
  final String phone;
  final String location;
  final String linkedin;
  final String github;
  final String siteUrl;
  /// Absolute URL of the Open Graph share image (1200×620px).
  /// Used for og:image and twitter:image meta tags.
  final String ogImage;
  /// Whether the developer is currently open to new opportunities.
  /// Drives the status card in the About section and the CTA in Experience.
  final bool isAvailable;

  const PersonalInformation({
    required this.name,
    required this.title,
    required this.email,
    required this.phone,
    required this.location,
    required this.linkedin,
    required this.github,
    required this.siteUrl,
    required this.ogImage,
    this.isAvailable = true,
  });

  String get firstName => name.split(' ').first.toLowerCase();
}

class Skills {
  final List<String> technicalSkills;
  final List<String> softSkills;
  final List<String> languages;

  const Skills({
    required this.technicalSkills,
    required this.softSkills,
    required this.languages,
  });
}

class WorkExperience {
  final String jobTitle;
  final String company;
  final String location;
  final String startDate;
  final String endDate;
  final List<String> responsibilities;
  /// Employment type, e.g. 'Full-time', 'Part-time', 'Contract', 'Internship'.
  final String employmentType;

  const WorkExperience({
    required this.jobTitle,
    required this.company,
    required this.location,
    required this.startDate,
    required this.endDate,
    required this.responsibilities,
    this.employmentType = 'Full-time',
  });

  String get duration => '$startDate — $endDate';
}

class Project {
  final String name;
  final List<String> platforms;
  final String description;
  final List<String> technologiesUsed;
  final String? github;
  final String? liveUrl;

  const Project({
    required this.name,
    required this.platforms,
    required this.description,
    required this.technologiesUsed,
    this.github,
    this.liveUrl,
  });

  String get platformLabel => platforms.join(' · ');
}

class OpenSourceContribution {
  final String name;
  final String role;
  final String description;
  final List<String> keyFeatures;
  final List<String> technologiesUsed;
  final String? github;

  const OpenSourceContribution({
    required this.name,
    required this.role,
    required this.description,
    required this.keyFeatures,
    required this.technologiesUsed,
    this.github,
  });
}

class Education {
  final String degree;
  final String institution;
  final String location;
  final String? startDate;
  final String endDate;
  final String? cgpa;

  const Education({
    required this.degree,
    required this.institution,
    required this.location,
    this.startDate,
    required this.endDate,
    this.cgpa,
  });

  String get duration {
    if (startDate != null) return '$startDate – $endDate';
    return endDate;
  }
}

class Achievement {
  final String title;
  final String organization;
  final String date;
  final String description;

  const Achievement({
    required this.title,
    required this.organization,
    required this.date,
    required this.description,
  });
}

class PortfolioData {
  final PersonalInformation personalInformation;
  final String summary;
  final Skills skills;
  final List<WorkExperience> workExperience;
  final List<Project> projects;
  final List<OpenSourceContribution> openSourceContributions;
  final List<Education> education;
  final List<Achievement> achievements;

  const PortfolioData({
    required this.personalInformation,
    required this.summary,
    required this.skills,
    required this.workExperience,
    required this.projects,
    required this.openSourceContributions,
    required this.education,
    required this.achievements,
  });

  int get yearsExperience {
    if (workExperience.isEmpty) return 0;
    try {
      final parts = workExperience.last.startDate.split('/');
      if (parts.length == 2) {
        final year = int.parse(parts[1]);
        return DateTime.now().year - year;
      }
    } catch (_) {}
    return 1;
  }
}
