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

export async function analyzeRepo(owner: string, repo: string) {
    const base = `https://api.github.com/repos/${owner}/${repo}`;

    // ------------------------------------------------------------
    // Repository metadata
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Repository file checks
    // ------------------------------------------------------------

    async function exists(path: string) {
        const res = await fetch(`${base}/contents/${path}`, {
            headers: {
                Accept: "application/vnd.github+json",
            },
            next: { revalidate: 300 },
        });

        return res.ok;
    }

    const [
        readme,
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
        exists("README.md"),
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

    // ------------------------------------------------------------
    // Repository activity
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Scoring
    // ------------------------------------------------------------

    const documentation =
        (readme ? 50 : 0) +
        (license ? 15 : 0) +
        (contributing ? 15 : 0) +
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

    // ------------------------------------------------------------
    // Findings
    // ------------------------------------------------------------

    const issues: HealthItem[] = [];
    const recommendations: HealthItem[] = [];
    const passed: HealthItem[] = [];

    if (!readme) {
        issues.push({
            title: "README.md is missing",
            description:
                "Add a README that clearly explains what the project does, how to install it, how to use it, and how others can contribute.",
        });
    } else {
        passed.push({
            title: "README.md found",
            description:
                "The repository includes a README that helps users understand the project.",
        });
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

    // ------------------------------------------------------------
    // Maintenance findings
    // ------------------------------------------------------------

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
            description: `The repository received a code push within the last ${daysSinceLastPush} day${daysSinceLastPush === 1 ? "" : "s"}.`,
        });
    }

    // ------------------------------------------------------------
    // Result
    // ------------------------------------------------------------

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

        issues,
        recommendations,
        passed,
    };
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