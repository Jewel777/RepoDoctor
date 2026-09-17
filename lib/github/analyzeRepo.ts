export async function analyzeRepo(owner: string, repo: string) {
    const base = `https://api.github.com/repos/${owner}/${repo}`;

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
    ] = await Promise.all([
        exists("README.md"),
        exists("LICENSE"),
        exists("SECURITY.md"),
        exists("CONTRIBUTING.md"),
        exists(".github/workflows"),
        exists("tests"),
    ]);

    const documentation =
        (readme ? 60 : 0) +
        (license ? 20 : 0) +
        (contributing ? 20 : 0);

    const securityScore = security ? 100 : 40;
    const testingScore = tests ? 100 : 30;
    const automationScore = workflows ? 100 : 30;

    const community =
        (contributing ? 50 : 0) +
        (license ? 50 : 0);

    const maintenance = 70;

    const overall = Math.round(
        documentation * 0.2 +
        securityScore * 0.2 +
        testingScore * 0.2 +
        community * 0.15 +
        maintenance * 0.15 +
        automationScore * 0.1
    );

    const issues: {
        title: string;
        description: string;
    }[] = [];

    const recommendations: {
        title: string;
        description: string;
    }[] = [];

    const passed: {
        title: string;
        description: string;
    }[] = [];

    if (!readme) {
        issues.push({
            title: "README.md is missing",
            description:
                "Add a README that explains what the project does, how to install it, how to use it, and how others can contribute.",
        });
    } else {
        passed.push({
            title: "README.md found",
            description:
                "The repository includes a README file that helps users understand the project.",
        });
    }

    if (!license) {
        issues.push({
            title: "LICENSE file is missing",
            description:
                "Add an open-source license so users clearly understand how they are allowed to use, modify, and distribute the project.",
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
                "The repository contains a tests directory, providing a foundation for automated quality checks.",
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
        issues,
        recommendations,
        passed,
    };
}