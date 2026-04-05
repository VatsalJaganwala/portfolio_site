// ignore_for_file: avoid_dynamic_calls

class PersonalInformation {
  final String name;
  final String title;
  final String email;
  final String phone;
  final String location;
  final String linkedin;
  final String github;

  const PersonalInformation({
    required this.name,
    required this.title,
    required this.email,
    required this.phone,
    required this.location,
    required this.linkedin,
    required this.github,
  });

  factory PersonalInformation.fromJson(Map<String, dynamic> json) {
    return PersonalInformation(
      name: json['name'] as String? ?? '',
      title: json['title'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      location: json['location'] as String? ?? '',
      linkedin: json['linkedin'] as String? ?? '',
      github: json['github'] as String? ?? '',
    );
  }

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

  factory Skills.fromJson(Map<String, dynamic> json) {
    return Skills(
      technicalSkills: List<String>.from(json['technical_skills'] as List? ?? []),
      softSkills: List<String>.from(json['soft_skills'] as List? ?? []),
      languages: List<String>.from(json['languages'] as List? ?? []),
    );
  }
}

class WorkExperience {
  final String jobTitle;
  final String company;
  final String location;
  final String startDate;
  final String endDate;
  final List<String> responsibilities;

  const WorkExperience({
    required this.jobTitle,
    required this.company,
    required this.location,
    required this.startDate,
    required this.endDate,
    required this.responsibilities,
  });

  factory WorkExperience.fromJson(Map<String, dynamic> json) {
    return WorkExperience(
      jobTitle: json['job_title'] as String? ?? '',
      company: json['company'] as String? ?? '',
      location: json['location'] as String? ?? '',
      startDate: json['start_date'] as String? ?? '',
      endDate: json['end_date'] as String? ?? '',
      responsibilities: List<String>.from(json['responsibilities'] as List? ?? []),
    );
  }

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

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      name: json['name'] as String? ?? '',
      platforms: List<String>.from(json['platforms'] as List? ?? []),
      description: json['description'] as String? ?? '',
      technologiesUsed: List<String>.from(json['technologies_used'] as List? ?? []),
      github: json['github'] as String?,
      liveUrl: json['live_url'] as String?,
    );
  }

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

  factory OpenSourceContribution.fromJson(Map<String, dynamic> json) {
    return OpenSourceContribution(
      name: json['name'] as String? ?? '',
      role: json['role'] as String? ?? '',
      description: json['description'] as String? ?? '',
      keyFeatures: List<String>.from(json['key_features'] as List? ?? []),
      technologiesUsed: List<String>.from(json['technologies_used'] as List? ?? []),
      github: json['github'] as String?,
    );
  }
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

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      degree: json['degree'] as String? ?? '',
      institution: json['institution'] as String? ?? '',
      location: json['location'] as String? ?? '',
      startDate: json['start_date'] as String?,
      endDate: json['end_date'] as String? ?? '',
      cgpa: json['cgpa'] as String?,
    );
  }

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

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      title: json['title'] as String? ?? '',
      organization: json['organization'] as String? ?? '',
      date: json['date'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }
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

  factory PortfolioData.fromJson(Map<String, dynamic> json) {
    return PortfolioData(
      personalInformation: PersonalInformation.fromJson(
        json['personal_information'] as Map<String, dynamic>,
      ),
      summary: json['summary'] as String? ?? '',
      skills: Skills.fromJson(json['skills'] as Map<String, dynamic>),
      workExperience: (json['work_experience'] as List? ?? [])
          .map((e) => WorkExperience.fromJson(e as Map<String, dynamic>))
          .toList(),
      projects: (json['projects'] as List? ?? [])
          .map((e) => Project.fromJson(e as Map<String, dynamic>))
          .toList(),
      openSourceContributions: (json['open_source_contributions'] as List? ?? [])
          .map((e) => OpenSourceContribution.fromJson(e as Map<String, dynamic>))
          .toList(),
      education: (json['education'] as List? ?? [])
          .map((e) => Education.fromJson(e as Map<String, dynamic>))
          .toList(),
      achievements: (json['achievements'] as List? ?? [])
          .map((e) => Achievement.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  int get yearsExperience {
    if (workExperience.isEmpty) return 0;
    // Compute from earliest start date
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
