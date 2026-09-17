type HealthItem = {
  title: string;
  description: string;
};

type GitHubRepository = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  language: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
};

type ReadmeAnalysis = {
  score: number;
  wordCount: number;
  hasDescription: boolean;
  hasInstallation: boolean;
  hasUsage: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  hasCodeExamples: boolean;
  hasBadges: boolean;
};

export async function analyzeRepo(owner: string, repo: string) {
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const repoResponse = await fetch(base, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 300 },
  });

  if (!repoResponse.ok) {
    throw new Error(
      "Repository not found or the GitHub API request could not be completed."
    );
  }

  const repoData = (await repoResponse.json()) as GitHubRepository;

  async function exists(path: string) {
    const response = await fetch(`${base}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 300 },
    });

    return response.ok;
  }

  async function getReadme(): Promise<string | null> {
    const response = await fetch(`${base}/readme`, {
      headers: {
        Accept: "application/vnd.github.raw+json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    return response.text();
  }

  const [
    readmeText,
    license,
    security,
    contributing,
    workflows,
    tests,
    codeOfConduct,
    pullRequestTemplate,
    issueTemplates,
    dependabot,
    gitignore,
  ] = await Promise.all([
    getReadme(),
    exists("LICENSE"),
    exists("SECURITY.md"),
    exists("CONTRIBUTING.md"),
    exists(".github/workflows"),
    exists("tests"),
    exists("CODE_OF_CONDUCT.md"),
    exists(".github/PULL_REQUEST_TEMPLATE.md"),
    exists(".github/ISSUE_TEMPLATE"),
    exists(".github/dependabot.yml"),
    exists(".gitignore"),
  ]);

  const readme = readmeText !== null;

  const readmeAnalysis = analyzeReadme(
    readmeText ?? "",
    repoData.description
  );

  const daysSinceLastPush = getDaysSince(repoData.pushed_at);

  const maintenanceStatus =
    repoData.archived
      ? "Archived"
      : daysSinceLastPush <= 30
        ? "Active"
        : daysSinceLastPush <= 90
          ? "Needs Attention"
          : daysSinceLastPush <= 180
            ? "Stale"
            : "Inactive";

  const activityScore =
    repoData.archived
      ? 0
      : daysSinceLastPush <= 30
        ? 20
        : daysSinceLastPush <= 90
          ? 15
          : daysSinceLastPush <= 180
            ? 10
            : 0;

  const documentation =
    Math.round(readmeAnalysis.score * 0.6) +
    (license ? 10 : 0) +
    (contributing ? 10 : 0) +
    (codeOfConduct ? 10 : 0) +
    (gitignore ? 10 : 0);

  const securityScore =
    40 +
    (security ? 35 : 0) +
    (dependabot ? 25 : 0);

  const testingScore = tests ? 100 : 40;

  const community =
    30 +
    (contributing ? 20 : 0) +
    (codeOfConduct ? 15 : 0) +
    (issueTemplates ? 15 : 0) +
    (pullRequestTemplate ? 20 : 0);

  const automationScore =
    30 +
    (workflows ? 45 : 0) +
    (dependabot ? 25 : 0);

  const maintenance =
    30 +
    (gitignore ? 15 : 0) +
    (workflows ? 20 : 0) +
    (dependabot ? 15 : 0) +
    activityScore;

  const overall = Math.round(
    documentation * 0.2 +
      securityScore * 0.2 +
      testingScore * 0.2 +
      community * 0.15 +
      maintenance * 0.15 +
      automationScore * 0.1
  );

  const issues: HealthItem[] = [];
  const recommendations: HealthItem[] = [];
  const passed: HealthItem[] = [];

  if (!readme) {
    issues.push({
      title: "README.md is missing",
      description:
        "Add a README that explains what the project does, how to install it, how to use it, and how others can contribute.",
    });
  } else {
    passed.push({
      title: "README.md found",
      description: `RepoDoctor detected a README containing approximately ${readmeAnalysis.wordCount} words.`,
    });

    if (readmeAnalysis.score >= 80) {
      passed.push({
        title: "README quality is strong",
        description: `The README earned ${readmeAnalysis.score}/100 and covers most important project-documentation areas.`,
      });
    } else {
      const missingReadmeAreas = getMissingReadmeAreas(readmeAnalysis);

      recommendations.push({
        title: "Improve README quality",
        description:
          missingReadmeAreas.length > 0
            ? `README quality is ${readmeAnalysis.score}/100. Consider adding or improving: ${missingReadmeAreas.join(
                ", "
              )}.`
            : `README quality is ${readmeAnalysis.score}/100. Consider expanding the documentation with more complete project guidance.`,
      });
    }
  }

  if (!license) {
    issues.push({
      title: "LICENSE file is missing",
      description:
        "Add an open-source license so users clearly understand how they may use, modify, and distribute the project.",
    });
  } else {
    passed.push({
      title: "LICENSE found",
      description:
        "The repository includes a license that defines how the project may be used.",
    });
  }

  if (!security) {
    issues.push({
      title: "SECURITY.md is missing",
      description:
        "Add a security policy explaining how vulnerabilities should be reported and which project versions are supported.",
    });
  } else {
    passed.push({
      title: "SECURITY.md found",
      description:
        "The repository provides a documented process for reporting security vulnerabilities.",
    });
  }

  if (!tests) {
    issues.push({
      title: "No tests directory detected",
      description:
        "Add automated tests to help catch regressions and verify that important functionality continues to work.",
    });
  } else {
    passed.push({
      title: "Tests directory found",
      description:
        "The repository contains a tests directory that provides a foundation for automated quality checks.",
    });
  }

  if (!contributing) {
    recommendations.push({
      title: "Add CONTRIBUTING.md",
      description:
        "Document how contributors should set up the project, create branches, submit changes, and open pull requests.",
    });
  } else {
    passed.push({
      title: "CONTRIBUTING.md found",
      description:
        "Contribution instructions are available for developers who want to help improve the project.",
    });
  }

  if (!workflows) {
    recommendations.push({
      title: "Add a GitHub Actions workflow",
      description:
        "Set up CI to automatically run checks such as linting, testing, and builds whenever code is pushed or a pull request is opened.",
    });
  } else {
    passed.push({
      title: "GitHub Actions workflow detected",
      description:
        "The repository contains GitHub Actions automation for development or deployment workflows.",
    });
  }

  if (!codeOfConduct) {
    recommendations.push({
      title: "Add CODE_OF_CONDUCT.md",
      description:
        "Define expected behavior and community standards so contributors know how to participate respectfully.",
    });
  } else {
    passed.push({
      title: "CODE_OF_CONDUCT.md found",
      description:
        "The repository includes community behavior guidelines for contributors.",
    });
  }

  if (!pullRequestTemplate) {
    recommendations.push({
      title: "Add a pull request template",
      description:
        "Provide a standard pull request template so contributors include useful context, testing details, and change summaries.",
    });
  } else {
    passed.push({
      title: "Pull request template found",
      description:
        "The repository includes a standard template for pull requests.",
    });
  }

  if (!issueTemplates) {
    recommendations.push({
      title: "Add issue templates",
      description:
        "Create issue templates for bug reports and feature requests so maintainers receive consistent and useful information.",
    });
  } else {
    passed.push({
      title: "Issue templates found",
      description:
        "The repository includes templates that help users submit structured issues.",
    });
  }

  if (!dependabot) {
    recommendations.push({
      title: "Enable Dependabot",
      description:
        "Add .github/dependabot.yml so dependency updates and security fixes can be proposed automatically.",
    });
  } else {
    passed.push({
      title: "Dependabot configuration found",
      description:
        "The repository is configured to receive automated dependency update proposals.",
    });
  }

  if (!gitignore) {
    recommendations.push({
      title: "Add .gitignore",
      description:
        "Exclude generated files, dependencies, local configuration, and development artifacts from version control.",
    });
  } else {
    passed.push({
      title: ".gitignore found",
      description:
        "The repository excludes common generated or local-only files from version control.",
    });
  }

  if (repoData.archived) {
    issues.push({
      title: "Repository is archived",
      description:
        "This repository has been archived on GitHub and is no longer considered actively maintained.",
    });
  } else if (daysSinceLastPush > 180) {
    recommendations.push({
      title: "Repository appears inactive",
      description: `The repository has not received a code push for ${daysSinceLastPush} days. Consider updating the project or clearly documenting its maintenance status.`,
    });
  } else if (daysSinceLastPush > 90) {
    recommendations.push({
      title: "Repository activity is stale",
      description: `The last code push was ${daysSinceLastPush} days ago. Consider reviewing outstanding maintenance work and dependencies.`,
    });
  } else if (daysSinceLastPush > 30) {
    recommendations.push({
      title: "Repository may need maintenance attention",
      description: `The last code push was ${daysSinceLastPush} days ago. The repository is still reasonably active but may benefit from a maintenance review.`,
    });
  } else {
    passed.push({
      title: "Repository activity is healthy",
      description: `The repository received a code push within the last ${daysSinceLastPush} day${
        daysSinceLastPush === 1 ? "" : "s"
      }.`,
    });
  }

  return {
    overall,

    scores: {
      Documentation: documentation,
      Security: securityScore,
      Testing: testingScore,
      Community: community,
      Maintenance: maintenance,
      Automation: automationScore,
    },

    repository: {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      defaultBranch: repoData.default_branch,
      language: repoData.language,
      archived: repoData.archived,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      daysSinceLastPush,
      maintenanceStatus,
    },

    readme: {
      exists: readme,
      qualityScore: readmeAnalysis.score,
      wordCount: readmeAnalysis.wordCount,
      hasDescription: readmeAnalysis.hasDescription,
      hasInstallation: readmeAnalysis.hasInstallation,
      hasUsage: readmeAnalysis.hasUsage,
      hasContributing: readmeAnalysis.hasContributing,
      hasLicense: readmeAnalysis.hasLicense,
      hasCodeExamples: readmeAnalysis.hasCodeExamples,
      hasBadges: readmeAnalysis.hasBadges,
    },

    issues,
    recommendations,
    passed,
  };
}

function analyzeReadme(
  content: string,
  repositoryDescription: string | null
): ReadmeAnalysis {
  if (!content.trim()) {
    return {
      score: 0,
      wordCount: 0,
      hasDescription: false,
      hasInstallation: false,
      hasUsage: false,
      hasContributing: false,
      hasLicense: false,
      hasCodeExamples: false,
      hasBadges: false,
    };
  }

  const wordCount = countWords(content);

  const hasDescription =
    Boolean(repositoryDescription?.trim()) ||
    containsMeaningfulIntro(content);

  const hasInstallation = hasHeading(content, [
    "installation",
    "install",
    "setup",
    "getting started",
    "quick start",
    "quickstart",
  ]);

  const hasUsage = hasHeading(content, [
    "usage",
    "how to use",
    "examples",
    "example",
    "demo",
  ]);

  const hasContributing = hasHeading(content, [
    "contributing",
    "contribution",
    "contributors",
  ]);

  const hasLicense = hasHeading(content, [
    "license",
    "licensing",
  ]);

  const hasCodeExamples = /```[\s\S]*?```/m.test(content);

  const hasBadges =
    /shields\.io/i.test(content) ||
    /\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/i.test(content) ||
    /!\[[^\]]*(badge|build|coverage|license|version)[^\]]*]/i.test(content);

  let score = 0;

  if (wordCount >= 300) {
    score += 20;
  } else if (wordCount >= 150) {
    score += 15;
  } else if (wordCount >= 75) {
    score += 10;
  } else if (wordCount >= 25) {
    score += 5;
  }

  if (hasDescription) score += 15;
  if (hasInstallation) score += 15;
  if (hasUsage) score += 15;
  if (hasContributing) score += 10;
  if (hasLicense) score += 10;
  if (hasCodeExamples) score += 10;
  if (hasBadges) score += 5;

  return {
    score: Math.min(score, 100),
    wordCount,
    hasDescription,
    hasInstallation,
    hasUsage,
    hasContributing,
    hasLicense,
    hasCodeExamples,
    hasBadges,
  };
}

function hasHeading(content: string, names: string[]) {
  const headings = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .toLowerCase()
    );

  return names.some((name) =>
    headings.some(
      (heading) =>
        heading === name ||
        heading.startsWith(`${name} `) ||
        heading.includes(name)
    )
  );
}

function containsMeaningfulIntro(content: string) {
  const cleanedLines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("#")) return false;
      if (line.startsWith("![")) return false;
      if (line.startsWith("[![")) return false;
      if (line.startsWith(">")) return false;
      if (line.startsWith("```")) return false;
      if (line.startsWith("<")) return false;

      return true;
    });

  const introductoryText = cleanedLines
    .slice(0, 5)
    .join(" ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .trim();

  return introductoryText.length >= 80;
}

function countWords(content: string) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_|~-]/g, " ");

  return cleaned
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getMissingReadmeAreas(analysis: ReadmeAnalysis) {
  const missing: string[] = [];

  if (analysis.wordCount < 150) {
    missing.push("more detailed project documentation");
  }

  if (!analysis.hasDescription) {
    missing.push("project description");
  }

  if (!analysis.hasInstallation) {
    missing.push("installation/setup instructions");
  }

  if (!analysis.hasUsage) {
    missing.push("usage examples");
  }

  if (!analysis.hasContributing) {
    missing.push("contribution guidance");
  }

  if (!analysis.hasLicense) {
    missing.push("license section");
  }

  if (!analysis.hasCodeExamples) {
    missing.push("code examples");
  }

  if (!analysis.hasBadges) {
    missing.push("project badges");
  }

  return missing;
}

function getDaysSince(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 9999;
  }

  const difference = Date.now() - date.getTime();

  return Math.max(
    0,
    Math.floor(difference / (1000 * 60 * 60 * 24))
  );
}