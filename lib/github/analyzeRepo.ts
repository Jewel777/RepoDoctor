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

type GitTreeItem = {
    path?: string;
    type?: string;
};

type GitHubContentItem = {
    name?: string;
    path?: string;
    type?: string;
    download_url?: string | null;
};

type GitHubRelease = {
    tag_name?: string;
    published_at?: string | null;
    draft?: boolean;
    prerelease?: boolean;
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

type PackageAnalysis = {
    exists: boolean;
    packageManager: string | null;
    scripts: string[];
    dependencies: string[];
    hasBuildScript: boolean;
    hasTestScript: boolean;
    hasLintScript: boolean;
    hasTypeCheckScript: boolean;
};

type WorkflowAnalysis = {
    exists: boolean;
    files: string[];
    hasBuild: boolean;
    hasTest: boolean;
    hasLint: boolean;
    hasTypeCheck: boolean;
    hasDeploy: boolean;
    hasSecurity: boolean;
    hasRelease: boolean;
};

type ReleaseAnalysis = {
    exists: boolean;
    tag: string | null;
    publishedAt: string | null;
    daysSinceRelease: number | null;
};

type TestAnalysis = {
    hasTests: boolean;
    testFiles: string[];
    frameworks: string[];
};

export async function analyzeRepo(owner: string, repo: string) {
    const base = `https://api.github.com/repos/${owner}/${repo}`;

    const githubHeaders = {
        Accept: "application/vnd.github+json",
    };

    async function githubFetch(url: string, accept?: string) {
        return fetch(url, {
            headers: {
                Accept: accept ?? githubHeaders.Accept,
            },
            next: { revalidate: 300 },
        });
    }

    const repoResponse = await githubFetch(base);

    if (!repoResponse.ok) {
        throw new Error(
            "Repository not found or the GitHub API request could not be completed."
        );
    }

    const repoData = (await repoResponse.json()) as GitHubRepository;

    async function exists(path: string) {
        const response = await githubFetch(`${base}/contents/${path}`);
        return response.ok;
    }

    async function existsAny(paths: string[]) {
        const results = await Promise.all(paths.map((path) => exists(path)));
        return results.some(Boolean);
    }

    async function getRawFile(path: string): Promise<string | null> {
        const response = await githubFetch(
            `${base}/contents/${path}`,
            "application/vnd.github.raw+json"
        );

        if (!response.ok) return null;
        return response.text();
    }

    async function getReadme(): Promise<string | null> {
        const response = await githubFetch(
            `${base}/readme`,
            "application/vnd.github.raw+json"
        );

        if (!response.ok) return null;
        return response.text();
    }

    async function getRepositoryTree(): Promise<GitTreeItem[]> {
        const response = await githubFetch(
            `${base}/git/trees/${repoData.default_branch}?recursive=1`
        );

        if (!response.ok) return [];

        const data = await response.json();
        return Array.isArray(data.tree) ? data.tree : [];
    }

    async function analyzePackageJson(): Promise<PackageAnalysis> {
        const raw = await getRawFile("package.json");

        if (!raw) {
            return {
                exists: false,
                packageManager: null,
                scripts: [],
                dependencies: [],
                hasBuildScript: false,
                hasTestScript: false,
                hasLintScript: false,
                hasTypeCheckScript: false,
            };
        }

        try {
            const packageJson = JSON.parse(raw) as {
                packageManager?: string;
                scripts?: Record<string, string>;
                dependencies?: Record<string, string>;
                devDependencies?: Record<string, string>;
            };

            const scripts = Object.keys(packageJson.scripts ?? {});
            const dependencies = [
                ...Object.keys(packageJson.dependencies ?? {}),
                ...Object.keys(packageJson.devDependencies ?? {}),
            ];

            return {
                exists: true,
                packageManager: packageJson.packageManager ?? null,
                scripts,
                dependencies,
                hasBuildScript: scripts.some((script) => /(^|:)build($|:)/i.test(script)),
                hasTestScript: scripts.some((script) => /(^|:)test($|:)/i.test(script)),
                hasLintScript: scripts.some((script) => /(^|:)lint($|:)/i.test(script)),
                hasTypeCheckScript: scripts.some((script) =>
                    /(^|:)(typecheck|type-check|check-types|types)($|:)/i.test(script)
                ),
            };
        } catch {
            return {
                exists: true,
                packageManager: null,
                scripts: [],
                dependencies: [],
                hasBuildScript: false,
                hasTestScript: false,
                hasLintScript: false,
                hasTypeCheckScript: false,
            };
        }
    }

    async function analyzeWorkflows(): Promise<WorkflowAnalysis> {
        const response = await githubFetch(`${base}/contents/.github/workflows`);

        if (!response.ok) {
            return emptyWorkflowAnalysis();
        }

        const items = (await response.json()) as GitHubContentItem[];
        const workflowFiles = items.filter(
            (item) =>
                item.type === "file" &&
                Boolean(item.name) &&
                /\.(yml|yaml)$/i.test(item.name!)
        );

        const contents = await Promise.all(
            workflowFiles.map(async (file) => {
                if (file.download_url) {
                    const rawResponse = await fetch(file.download_url, {
                        next: { revalidate: 300 },
                    });

                    if (rawResponse.ok) return rawResponse.text();
                }

                if (file.path) {
                    return (await getRawFile(file.path)) ?? "";
                }

                return "";
            })
        );

        const combined = contents.join("\n").toLowerCase();

        return {
            exists: workflowFiles.length > 0,
            files: workflowFiles
                .map((file) => file.name)
                .filter((name): name is string => Boolean(name)),
            hasBuild:
                /\bbuild\b/.test(combined) ||
                /npm run build|pnpm build|yarn build|dotnet build|mvn .*package|gradle .*build/.test(
                    combined
                ),
            hasTest:
                /\btest(s|ing)?\b/.test(combined) ||
                /npm test|npm run test|pnpm test|yarn test|pytest|vitest|jest|dotnet test|mvn .*test|gradle .*test/.test(
                    combined
                ),
            hasLint:
                /\blint\b/.test(combined) ||
                /eslint|ruff|flake8|pylint|golangci-lint/.test(combined),
            hasTypeCheck:
                /typecheck|type-check|tsc --noemit|mypy|pyright/.test(combined),
            hasDeploy:
                /\bdeploy\b/.test(combined) ||
                /vercel|netlify|pages|firebase deploy|aws-actions|azure\/webapps-deploy|google-github-actions\/deploy/.test(
                    combined
                ),
            hasSecurity:
                /codeql|security|snyk|trivy|semgrep|dependency-review-action/.test(combined),
            hasRelease:
                /\brelease\b/.test(combined) ||
                /softprops\/action-gh-release|semantic-release|changesets\/action/.test(combined),
        };
    }

    async function getLatestRelease(): Promise<ReleaseAnalysis> {
        const response = await githubFetch(`${base}/releases/latest`);

        if (!response.ok) {
            return {
                exists: false,
                tag: null,
                publishedAt: null,
                daysSinceRelease: null,
            };
        }

        const release = (await response.json()) as GitHubRelease;
        const publishedAt = release.published_at ?? null;

        return {
            exists: Boolean(release.tag_name),
            tag: release.tag_name ?? null,
            publishedAt,
            daysSinceRelease: publishedAt ? getDaysSince(publishedAt) : null,
        };
    }

    const [
        readmeText,
        tree,
        packageAnalysis,
        workflowAnalysis,
        releaseAnalysis,
        license,
        securityPolicy,
        contributing,
        codeOfConduct,
        pullRequestTemplate,
        issueTemplates,
        dependabot,
        gitignore,
        editorConfig,
        envExample,
    ] = await Promise.all([
        getReadme(),
        getRepositoryTree(),
        analyzePackageJson(),
        analyzeWorkflows(),
        getLatestRelease(),
        existsAny(["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING"]),
        existsAny(["SECURITY.md", ".github/SECURITY.md"]),
        existsAny(["CONTRIBUTING.md", ".github/CONTRIBUTING.md"]),
        existsAny([
            "CODE_OF_CONDUCT.md",
            ".github/CODE_OF_CONDUCT.md",
            "docs/CODE_OF_CONDUCT.md",
        ]),
        existsAny([
            ".github/PULL_REQUEST_TEMPLATE.md",
            ".github/pull_request_template.md",
            "docs/PULL_REQUEST_TEMPLATE.md",
            ".github/PULL_REQUEST_TEMPLATE",
        ]),
        exists(".github/ISSUE_TEMPLATE"),
        existsAny([".github/dependabot.yml", ".github/dependabot.yaml"]),
        exists(".gitignore"),
        exists(".editorconfig"),
        existsAny([".env.example", ".env.sample", ".env.template"]),
    ]);

    const readme = readmeText !== null;
    const readmeAnalysis = analyzeReadme(readmeText ?? "", repoData.description);
    const treePaths = tree
        .map((item) => item.path)
        .filter((path): path is string => Boolean(path));

    const testAnalysis = analyzeTests(treePaths, packageAnalysis);

    const hasLockfile = treePaths.some((path) =>
        /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|poetry\.lock|pipfile\.lock|composer\.lock|gemfile\.lock|cargo\.lock)$/i.test(
            path
        )
    );

    const hasTypeScript = treePaths.some(
        (path) =>
            /(^|\/)tsconfig(\.[^/]+)?\.json$/i.test(path) ||
            /\.(ts|tsx)$/i.test(path)
    );

    const hasLintConfig = treePaths.some((path) =>
        /(^|\/)(eslint\.config\.(js|mjs|cjs|ts)|\.eslintrc(\..+)?|ruff\.toml|\.flake8|pylintrc|golangci\.ya?ml)$/i.test(
            path
        )
    );

    const hasFormatterConfig = treePaths.some((path) =>
        /(^|\/)(prettier\.config\.(js|mjs|cjs|ts)|\.prettierrc(\..+)?|\.editorconfig)$/i.test(
            path
        )
    );

    const hasDockerfile = treePaths.some((path) =>
        /(^|\/)dockerfile(\..+)?$/i.test(path)
    );

    const detectedPackageManager = detectPackageManager(
        treePaths,
        packageAnalysis.packageManager
    );

    const daysSinceLastPush = getDaysSince(repoData.pushed_at);

    const maintenanceStatus = repoData.archived
        ? "Archived"
        : daysSinceLastPush <= 30
            ? "Active"
            : daysSinceLastPush <= 90
                ? "Needs Attention"
                : daysSinceLastPush <= 180
                    ? "Stale"
                    : "Inactive";

    const activityScore = repoData.archived
        ? 0
        : daysSinceLastPush <= 30
            ? 30
            : daysSinceLastPush <= 90
                ? 22
                : daysSinceLastPush <= 180
                    ? 12
                    : 0;

    const documentation = clampScore(
        Math.round(readmeAnalysis.score * 0.6) +
        (license ? 10 : 0) +
        (contributing ? 10 : 0) +
        (codeOfConduct ? 10 : 0) +
        (gitignore ? 10 : 0)
    );

    const securityScore = clampScore(
        25 +
        (securityPolicy ? 25 : 0) +
        (dependabot ? 20 : 0) +
        (workflowAnalysis.hasSecurity ? 15 : 0) +
        (hasLockfile ? 15 : 0)
    );

    const testingScore = clampScore(
        testAnalysis.hasTests && testAnalysis.frameworks.length > 0
            ? 80 +
            (packageAnalysis.hasTestScript ? 10 : 0) +
            (workflowAnalysis.hasTest ? 10 : 0)
            : testAnalysis.hasTests
                ? 65 +
                (packageAnalysis.hasTestScript ? 10 : 0) +
                (workflowAnalysis.hasTest ? 10 : 0)
                : testAnalysis.frameworks.length > 0
                    ? 50 +
                    (packageAnalysis.hasTestScript ? 10 : 0) +
                    (workflowAnalysis.hasTest ? 10 : 0)
                    : workflowAnalysis.hasTest
                        ? 50
                        : 35
    );

    const community = clampScore(
        20 +
        (contributing ? 20 : 0) +
        (codeOfConduct ? 15 : 0) +
        (issueTemplates ? 15 : 0) +
        (pullRequestTemplate ? 15 : 0) +
        (securityPolicy ? 15 : 0)
    );

    const automationScore = clampScore(
        20 +
        (workflowAnalysis.exists ? 15 : 0) +
        (workflowAnalysis.hasBuild ? 10 : 0) +
        (workflowAnalysis.hasTest ? 15 : 0) +
        (workflowAnalysis.hasLint ? 10 : 0) +
        (workflowAnalysis.hasTypeCheck ? 10 : 0) +
        (workflowAnalysis.hasSecurity ? 10 : 0) +
        (workflowAnalysis.hasDeploy ? 5 : 0) +
        (dependabot ? 5 : 0)
    );

    const codeQualityScore = clampScore(
        20 +
        (gitignore ? 10 : 0) +
        (editorConfig ? 10 : 0) +
        (hasLintConfig || packageAnalysis.hasLintScript ? 20 : 0) +
        (hasFormatterConfig ? 15 : 0) +
        (hasTypeScript || packageAnalysis.hasTypeCheckScript ? 15 : 0) +
        (hasLockfile ? 10 : 0) +
        (envExample ? 5 : 0) +
        (hasDockerfile ? 5 : 0)
    );

    const maintenance = clampScore(
        20 +
        activityScore +
        (gitignore ? 10 : 0) +
        (workflowAnalysis.exists ? 15 : 0) +
        (dependabot ? 10 : 0) +
        (releaseAnalysis.exists ? 15 : 0)
    );

    const overall = Math.round(
        documentation * 0.17 +
        securityScore * 0.17 +
        testingScore * 0.17 +
        community * 0.12 +
        maintenance * 0.14 +
        automationScore * 0.12 +
        codeQualityScore * 0.11
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
                        : `README quality is ${readmeAnalysis.score}/100. Consider expanding the documentation.`,
            });
        }
    }

    addFileFinding(
        license,
        issues,
        passed,
        "LICENSE file is missing",
        "Add an open-source license so users clearly understand how they may use, modify, and distribute the project.",
        "LICENSE found",
        "The repository includes a license that defines how the project may be used."
    );

    addFileFinding(
        securityPolicy,
        issues,
        passed,
        "SECURITY.md is missing",
        "Add a security policy explaining how vulnerabilities should be reported and which project versions are supported.",
        "SECURITY.md found",
        "The repository provides a documented process for reporting security vulnerabilities."
    );

    if (!testAnalysis.hasTests && testAnalysis.frameworks.length === 0) {
        issues.push({
            title: "No automated tests detected",
            description:
                "RepoDoctor could not detect common test files, test directories, or a recognized testing framework.",
        });
    } else if (testAnalysis.hasTests && testAnalysis.frameworks.length > 0) {
        passed.push({
            title: "Automated testing is configured",
            description: `Test files were detected and RepoDoctor identified: ${testAnalysis.frameworks.join(
                ", "
            )}.`,
        });
    } else if (testAnalysis.hasTests) {
        passed.push({
            title: "Test files detected",
            description:
                "The repository contains automated test files or a recognized test directory.",
        });

        recommendations.push({
            title: "Add or expose test framework configuration",
            description:
                "Tests were detected, but RepoDoctor could not identify a supported framework configuration or dependency.",
        });
    } else {
        recommendations.push({
            title: "Add automated test files",
            description: `RepoDoctor detected ${testAnalysis.frameworks.join(
                ", "
            )}, but did not find common automated test files.`,
        });
    }

    if (packageAnalysis.exists && !packageAnalysis.hasTestScript) {
        recommendations.push({
            title: "Add a test script",
            description:
                "package.json was detected, but no standard test script was found. Add one so tests are easy to run locally and in CI.",
        });
    } else if (packageAnalysis.hasTestScript) {
        passed.push({
            title: "Test script configured",
            description:
                "package.json includes a test script that can be used by developers and automation.",
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

    if (!workflowAnalysis.exists) {
        recommendations.push({
            title: "Add GitHub Actions CI",
            description:
                "Create a workflow that runs build, lint, tests, and other quality checks on pushes and pull requests.",
        });
    } else {
        passed.push({
            title: "GitHub Actions detected",
            description: `${workflowAnalysis.files.length} workflow file${workflowAnalysis.files.length === 1 ? "" : "s"
                } detected.`,
        });

        if (!workflowAnalysis.hasTest && testAnalysis.hasTests) {
            recommendations.push({
                title: "Run tests in CI",
                description:
                    "Automated tests exist, but RepoDoctor could not detect a test step in GitHub Actions.",
            });
        }

        if (!workflowAnalysis.hasLint && packageAnalysis.hasLintScript) {
            recommendations.push({
                title: "Run linting in CI",
                description:
                    "A lint script exists, but RepoDoctor could not detect linting in GitHub Actions.",
            });
        }

        if (workflowAnalysis.hasTest) {
            passed.push({
                title: "CI runs tests",
                description:
                    "GitHub Actions appears to execute automated tests as part of the repository workflow.",
            });
        }

        if (workflowAnalysis.hasSecurity) {
            passed.push({
                title: "Security automation detected",
                description:
                    "The repository appears to use an automated security or dependency scanning workflow.",
            });
        }
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

    if (!hasLockfile && packageAnalysis.exists) {
        recommendations.push({
            title: "Commit a dependency lockfile",
            description:
                "A package manifest exists, but RepoDoctor did not detect a dependency lockfile. Lockfiles improve reproducible installs and dependency review.",
        });
    } else if (hasLockfile) {
        passed.push({
            title: "Dependency lockfile found",
            description:
                "The repository includes a lockfile for reproducible dependency installation.",
        });
    }

    if (!envExample && packageAnalysis.exists) {
        recommendations.push({
            title: "Consider adding an environment template",
            description:
                "If the application uses environment variables, include .env.example or a similar template without secrets.",
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
            description: `The last code push was ${daysSinceLastPush} days ago. The repository may benefit from a maintenance review.`,
        });
    } else {
        passed.push({
            title: "Repository activity is healthy",
            description: `The repository received a code push within the last ${daysSinceLastPush} day${daysSinceLastPush === 1 ? "" : "s"
                }.`,
        });
    }

    if (releaseAnalysis.exists && releaseAnalysis.tag) {
        passed.push({
            title: "Release history detected",
            description: releaseAnalysis.publishedAt
                ? `Latest release ${releaseAnalysis.tag} was published ${releaseAnalysis.daysSinceRelease} day${releaseAnalysis.daysSinceRelease === 1 ? "" : "s"
                } ago.`
                : `Latest release detected: ${releaseAnalysis.tag}.`,
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
            "Code Quality": codeQualityScore,
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

        testing: {
            hasTests: testAnalysis.hasTests,
            testFiles: testAnalysis.testFiles,
            frameworks: testAnalysis.frameworks,
            hasTestScript: packageAnalysis.hasTestScript,
            ciRunsTests: workflowAnalysis.hasTest,
        },

        automation: {
            workflowsExist: workflowAnalysis.exists,
            workflowFiles: workflowAnalysis.files,
            hasBuild: workflowAnalysis.hasBuild,
            hasTest: workflowAnalysis.hasTest,
            hasLint: workflowAnalysis.hasLint,
            hasTypeCheck: workflowAnalysis.hasTypeCheck,
            hasDeploy: workflowAnalysis.hasDeploy,
            hasSecurity: workflowAnalysis.hasSecurity,
            hasRelease: workflowAnalysis.hasRelease,
        },

        security: {
            hasSecurityPolicy: securityPolicy,
            dependabot,
            automatedSecurityScanning: workflowAnalysis.hasSecurity,
            hasLockfile,
        },

        project: {
            hasPackageJson: packageAnalysis.exists,
            packageManager: detectedPackageManager,
            scripts: packageAnalysis.scripts,
            hasBuildScript: packageAnalysis.hasBuildScript,
            hasTestScript: packageAnalysis.hasTestScript,
            hasLintScript: packageAnalysis.hasLintScript,
            hasTypeCheckScript: packageAnalysis.hasTypeCheckScript,
            hasTypeScript,
            hasLintConfig,
            hasFormatterConfig,
            hasDockerfile,
            hasEnvExample: envExample,
            hasEditorConfig: editorConfig,
            hasLockfile,
        },

        release: releaseAnalysis,

        issues,
        recommendations,
        passed,
    };
}

function emptyWorkflowAnalysis(): WorkflowAnalysis {
    return {
        exists: false,
        files: [],
        hasBuild: false,
        hasTest: false,
        hasLint: false,
        hasTypeCheck: false,
        hasDeploy: false,
        hasSecurity: false,
        hasRelease: false,
    };
}

function analyzeTests(
    treePaths: string[],
    packageAnalysis: PackageAnalysis
): TestAnalysis {
    const testFiles = treePaths.filter((path) =>
        /(^|\/)(__tests__|tests?|spec)(\/|$)|\.(test|spec)\.(js|jsx|ts|tsx|mjs|cjs|py|php|rb|go|java|kt|cs)$/i.test(
            path
        )
    );

    const frameworks = new Set<string>();
    const dependencies = new Set(
        packageAnalysis.dependencies.map((dependency) => dependency.toLowerCase())
    );

    if (
        dependencies.has("jest") ||
        treePaths.some((path) => /(^|\/)jest\.config\.(js|ts|mjs|cjs)$/i.test(path))
    ) {
        frameworks.add("Jest");
    }

    if (
        dependencies.has("vitest") ||
        treePaths.some((path) => /(^|\/)vitest\.config\.(js|ts|mts|mjs)$/i.test(path))
    ) {
        frameworks.add("Vitest");
    }

    if (dependencies.has("mocha")) frameworks.add("Mocha");
    if (dependencies.has("ava")) frameworks.add("AVA");
    if (dependencies.has("jasmine")) frameworks.add("Jasmine");
    if (dependencies.has("tap")) frameworks.add("Tap");

    if (
        dependencies.has("@playwright/test") ||
        treePaths.some((path) => /(^|\/)playwright\.config\.(js|ts|mts|mjs)$/i.test(path))
    ) {
        frameworks.add("Playwright");
    }

    if (
        dependencies.has("cypress") ||
        treePaths.some((path) => /(^|\/)cypress\.config\.(js|ts|mjs|cjs)$/i.test(path))
    ) {
        frameworks.add("Cypress");
    }

    if (
        treePaths.some((path) =>
            /(^|\/)(pytest\.ini|conftest\.py|tox\.ini)$/i.test(path)
        ) ||
        treePaths.some((path) => /(^|\/)tests?\/.*\.py$/i.test(path))
    ) {
        frameworks.add("Pytest/Python");
    }

    if (
        treePaths.some((path) => /(^|\/)(phpunit\.xml|phpunit\.xml\.dist)$/i.test(path))
    ) {
        frameworks.add("PHPUnit");
    }

    if (
        treePaths.some((path) => /(^|\/)karma\.conf\.(js|ts)$/i.test(path))
    ) {
        frameworks.add("Karma");
    }

    if (treePaths.some((path) => /(^|\/).*_test\.go$/i.test(path))) {
        frameworks.add("Go Test");
    }

    if (
        treePaths.some((path) =>
            /(^|\/)(src\/test|test)\/.*\.(java|kt)$/i.test(path)
        )
    ) {
        frameworks.add("JVM Tests");
    }

    if (
        treePaths.some((path) =>
            /(^|\/).*Tests?\/.*\.cs$/i.test(path)
        )
    ) {
        frameworks.add(".NET Tests");
    }

    return {
        hasTests: testFiles.length > 0,
        testFiles: testFiles.slice(0, 25),
        frameworks: Array.from(frameworks).sort(),
    };
}

function detectPackageManager(treePaths: string[], declared: string | null) {
    if (declared) return declared;

    if (treePaths.some((path) => /(^|\/)pnpm-lock\.yaml$/i.test(path))) {
        return "pnpm";
    }

    if (treePaths.some((path) => /(^|\/)yarn\.lock$/i.test(path))) {
        return "Yarn";
    }

    if (treePaths.some((path) => /(^|\/)bun\.lockb?$/i.test(path))) {
        return "Bun";
    }

    if (treePaths.some((path) => /(^|\/)package-lock\.json$/i.test(path))) {
        return "npm";
    }

    if (treePaths.some((path) => /(^|\/)poetry\.lock$/i.test(path))) {
        return "Poetry";
    }

    if (treePaths.some((path) => /(^|\/)pipfile\.lock$/i.test(path))) {
        return "Pipenv";
    }

    if (treePaths.some((path) => /(^|\/)composer\.lock$/i.test(path))) {
        return "Composer";
    }

    if (treePaths.some((path) => /(^|\/)cargo\.lock$/i.test(path))) {
        return "Cargo";
    }

    return null;
}

function addFileFinding(
    exists: boolean,
    issues: HealthItem[],
    passed: HealthItem[],
    missingTitle: string,
    missingDescription: string,
    foundTitle: string,
    foundDescription: string
) {
    if (!exists) {
        issues.push({
            title: missingTitle,
            description: missingDescription,
        });
        return;
    }

    passed.push({
        title: foundTitle,
        description: foundDescription,
    });
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
        Boolean(repositoryDescription?.trim()) || containsMeaningfulIntro(content);

  const hasInstallation = hasHeading(content, [
    "installation",
    "install",
    "setup",
    "development setup",
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
    "live demo",
  ]);;

  const hasContributing = hasHeading(content, [
    "contributing",
    "contribution",
    "contributors",
    "development",
  ]);

    const hasLicense = hasHeading(content, ["license", "licensing"]);
    const hasCodeExamples = /```[\s\S]*?```/m.test(content);

    const hasBadges =
        /shields\.io/i.test(content) ||
        /\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/i.test(content) ||
        /!\[[^\]]*(badge|build|coverage|license|version)[^\]]*]/i.test(content);

    let score = 0;

    if (wordCount >= 300) score += 20;
    else if (wordCount >= 150) score += 15;
    else if (wordCount >= 75) score += 10;
    else if (wordCount >= 25) score += 5;

    if (hasDescription) score += 15;
    if (hasInstallation) score += 15;
    if (hasUsage) score += 15;
    if (hasContributing) score += 10;
    if (hasLicense) score += 10;
    if (hasCodeExamples) score += 10;
    if (hasBadges) score += 5;

    return {
        score: clampScore(score),
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
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const headings = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) =>
      normalize(
        line.replace(/^#{1,6}\s+/, "")
      )
    );

  return names.some((name) => {
    const normalizedName = normalize(name);

    return headings.some(
      (heading) =>
        heading === normalizedName ||
        heading.startsWith(`${normalizedName} `) ||
        heading.includes(normalizedName)
    );
  });
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

    return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

function getMissingReadmeAreas(analysis: ReadmeAnalysis) {
    const missing: string[] = [];

    if (analysis.wordCount < 150) {
        missing.push("more detailed project documentation");
    }

    if (!analysis.hasDescription) missing.push("project description");
    if (!analysis.hasInstallation) missing.push("installation/setup instructions");
    if (!analysis.hasUsage) missing.push("usage examples");
    if (!analysis.hasContributing) missing.push("contribution guidance");
    if (!analysis.hasLicense) missing.push("license section");
    if (!analysis.hasCodeExamples) missing.push("code examples");
    if (!analysis.hasBadges) missing.push("project badges");

    return missing;
}

function clampScore(value: number) {
    return Math.min(100, Math.max(0, Math.round(value)));
}

function getDaysSince(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 9999;
    }

    const difference = Date.now() - date.getTime();

    return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
}
