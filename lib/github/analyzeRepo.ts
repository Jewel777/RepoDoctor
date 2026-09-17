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
    };
}