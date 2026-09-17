import Link from "next/link";
import { analyzeRepo } from "@/lib/github/analyzeRepo";

type Props = {
    params: Promise<{
        owner: string;
        repo: string;
    }>;
};

type HealthState = "success" | "warning" | "danger" | "neutral";

export default async function ReportPage({ params }: Props) {
    const { owner, repo } = await params;
    const analysis = await analyzeRepo(owner, repo);

    const totalChecks =
        analysis.issues.length +
        analysis.recommendations.length +
        analysis.passed.length;

    const status =
        analysis.overall >= 80
            ? {
                label: "Healthy",
                textClass: "text-green-400",
                borderClass: "border-green-900/40",
                bgClass: "bg-green-950/10",
            }
            : analysis.overall >= 60
                ? {
                    label: "Needs Improvement",
                    textClass: "text-yellow-400",
                    borderClass: "border-yellow-900/40",
                    bgClass: "bg-yellow-950/10",
                }
                : {
                    label: "At Risk",
                    textClass: "text-red-400",
                    borderClass: "border-red-900/40",
                    bgClass: "bg-red-950/10",
                };

    const createdAt = formatDate(analysis.repository.createdAt);
    const latestReleaseDate = analysis.release.publishedAt
        ? formatDate(analysis.release.publishedAt)
        : "Not available";

    return (
        <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 sm:py-10">
            <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to RepoDoctor
          </Link>

                {/* Main health summary */}
                <section
                    className={`mt-8 rounded-3xl border ${status.borderClass} ${status.bgClass} p-6 sm:p-8`}
                >
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">
                                Repository Health Report
                            </p>

                            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                                {analysis.repository.fullName}
                            </h1>

                            {analysis.repository.description && (
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                                    {analysis.repository.description}
                                </p>
                            )}

                            <div className="mt-8 flex items-end gap-3">
                                <span className="text-6xl font-bold tracking-tight sm:text-7xl">
                                    {analysis.overall}
                                </span>

                                <span className="pb-2 text-lg text-zinc-500 sm:text-xl">
                                    / 100
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <p className={`text-lg font-semibold ${status.textClass}`}>
                                    {status.label}
                                </p>

                                {analysis.repository.archived && (
                                    <span className="rounded-full border border-red-900/60 bg-red-950/30 px-3 py-1 text-xs font-medium text-red-300">
                                        Archived
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <SummaryStat
                                value={totalChecks}
                                label="Checks"
                                className="border-zinc-800"
                            />
                            <SummaryStat
                                value={analysis.issues.length}
                                label="Critical"
                                className="border-red-900/50"
                            />
                            <SummaryStat
                                value={analysis.recommendations.length}
                                label="Recommended"
                                className="border-yellow-900/50"
                            />
                            <SummaryStat
                                value={analysis.passed.length}
                                label="Passed"
                                className="border-green-900/50"
                            />
                        </div>
                    </div>
                </section>

                {/* Repository overview */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <SectionHeading
                        title="Repository Overview"
                        description="Live metadata and maintenance intelligence from GitHub"
                        action={
                            <a
                                href={`https://github.com/${analysis.repository.fullName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-zinc-400 transition hover:text-white"
                            >
                                Open on GitHub ↗
                            </a>
                        }
                    />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetadataCard
                            label="Stars"
                            value={`★ ${analysis.repository.stars.toLocaleString()}`}
                        />
                        <MetadataCard
                            label="Forks"
                            value={`⑂ ${analysis.repository.forks.toLocaleString()}`}
                        />
                        <MetadataCard
                            label="Open Issues"
                            value={analysis.repository.openIssues.toLocaleString()}
                        />
                        <MetadataCard
                            label="Language"
                            value={analysis.repository.language ?? "Not detected"}
                        />
                        <MetadataCard
                            label="Default Branch"
                            value={analysis.repository.defaultBranch}
                        />
                        <MetadataCard
                            label="Last Push"
                            value={`${analysis.repository.daysSinceLastPush} day${analysis.repository.daysSinceLastPush === 1 ? "" : "s"
                                } ago`}
                        />
                        <MetadataCard label="Created" value={createdAt} />
                        <MetadataCard
                            label="Maintenance"
                            value={analysis.repository.maintenanceStatus}
                            valueClass={getMaintenanceClass(
                                analysis.repository.maintenanceStatus
                            )}
                        />
                    </div>
                </section>

                {/* README Quality */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <ScoreSectionHeading
                        title="README Quality"
                        description="Content quality, completeness, and developer usability"
                        score={analysis.readme.qualityScore}
                    />

                    <ScoreBar score={analysis.readme.qualityScore} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <BooleanCard label="README Exists" passed={analysis.readme.exists} />
                        <BooleanCard
                            label="Project Description"
                            passed={analysis.readme.hasDescription}
                        />
                        <BooleanCard
                            label="Installation"
                            passed={analysis.readme.hasInstallation}
                        />
                        <BooleanCard label="Usage" passed={analysis.readme.hasUsage} />
                        <BooleanCard
                            label="Contributing"
                            passed={analysis.readme.hasContributing}
                        />
                        <BooleanCard
                            label="License Section"
                            passed={analysis.readme.hasLicense}
                        />
                        <BooleanCard
                            label="Code Examples"
                            passed={analysis.readme.hasCodeExamples}
                        />
                        <BooleanCard label="Badges" passed={analysis.readme.hasBadges} />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <span>Approximate README length:</span>
                        <span className="font-semibold text-zinc-300">
                            {analysis.readme.wordCount.toLocaleString()} words
                        </span>
                    </div>
                </section>

                {/* Testing Intelligence */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <ScoreSectionHeading
                        title="Testing Intelligence"
                        description="Automated test discovery, framework configuration, scripts, and CI execution"
                        score={analysis.scores.Testing}
                    />

                    <ScoreBar score={analysis.scores.Testing} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <IntelligenceCard
                            label="Test Files"
                            value={analysis.testing.hasTests ? "Detected" : "Not detected"}
                            state={analysis.testing.hasTests ? "success" : "danger"}
                        />
                        <IntelligenceCard
                            label="Frameworks"
                            value={
                                analysis.testing.frameworks.length > 0
                                    ? analysis.testing.frameworks.join(", ")
                                    : "Not detected"
                            }
                            state={
                                analysis.testing.frameworks.length > 0 ? "success" : "neutral"
                            }
                        />
                        <IntelligenceCard
                            label="Test Script"
                            value={analysis.testing.hasTestScript ? "Configured" : "Missing"}
                            state={analysis.testing.hasTestScript ? "success" : "warning"}
                        />
                        <IntelligenceCard
                            label="CI Runs Tests"
                            value={analysis.testing.ciRunsTests ? "Detected" : "Not detected"}
                            state={analysis.testing.ciRunsTests ? "success" : "warning"}
                        />
                    </div>

                    {analysis.testing.testFiles.length > 0 && (
                        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                                Detected test files
                            </p>
                            <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
                                {analysis.testing.testFiles.slice(0, 8).join(", ")}
                                {analysis.testing.testFiles.length > 8
                                    ? ` +${analysis.testing.testFiles.length - 8} more`
                                    : ""}
                            </p>
                        </div>
                    )}
                </section>

                {/* CI/CD Intelligence */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <ScoreSectionHeading
                        title="CI/CD Intelligence"
                        description="GitHub Actions coverage across build, test, quality, security, deployment, and release workflows"
                        score={analysis.scores.Automation}
                    />

                    <ScoreBar score={analysis.scores.Automation} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <BooleanIntelligence
                            label="GitHub Actions"
                            passed={analysis.automation.workflowsExist}
                        />
                        <BooleanIntelligence
                            label="Build"
                            passed={analysis.automation.hasBuild}
                        />
                        <BooleanIntelligence
                            label="Tests"
                            passed={analysis.automation.hasTest}
                        />
                        <BooleanIntelligence
                            label="Lint"
                            passed={analysis.automation.hasLint}
                        />
                        <BooleanIntelligence
                            label="Type Check"
                            passed={analysis.automation.hasTypeCheck}
                        />
                        <BooleanIntelligence
                            label="Security Scan"
                            passed={analysis.automation.hasSecurity}
                        />
                        <BooleanIntelligence
                            label="Deploy"
                            passed={analysis.automation.hasDeploy}
                        />
                        <BooleanIntelligence
                            label="Release"
                            passed={analysis.automation.hasRelease}
                        />
                    </div>

                    <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                            Workflow Files
                        </p>
                        <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
                            {analysis.automation.workflowFiles.length > 0
                                ? analysis.automation.workflowFiles.join(", ")
                                : "No GitHub Actions workflow files detected."}
                        </p>
                    </div>
                </section>

                {/* Security Intelligence */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <ScoreSectionHeading
                        title="Security Intelligence"
                        description="Security policy, dependency controls, lockfiles, and automated scanning"
                        score={analysis.scores.Security}
                    />

                    <ScoreBar score={analysis.scores.Security} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <BooleanIntelligence
                            label="Security Policy"
                            passed={analysis.security.hasSecurityPolicy}
                        />
                        <BooleanIntelligence
                            label="Dependabot"
                            passed={analysis.security.dependabot}
                        />
                        <BooleanIntelligence
                            label="Security Scanning"
                            passed={analysis.security.automatedSecurityScanning}
                        />
                        <BooleanIntelligence
                            label="Dependency Lockfile"
                            passed={analysis.security.hasLockfile}
                        />
                    </div>
                </section>

                {/* Project Engineering */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <ScoreSectionHeading
                        title="Project Engineering"
                        description="Development ergonomics, tooling, reproducibility, configuration, and code-quality signals"
                        score={analysis.scores["Code Quality"]}
                    />

                    <ScoreBar score={analysis.scores["Code Quality"]} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <IntelligenceCard
                            label="Package Manager"
                            value={analysis.project.packageManager ?? "Not detected"}
                            state={
                                analysis.project.packageManager ? "success" : "neutral"
                            }
                        />
                        <BooleanIntelligence
                            label="package.json"
                            passed={analysis.project.hasPackageJson}
                        />
                        <BooleanIntelligence
                            label="Build Script"
                            passed={analysis.project.hasBuildScript}
                        />
                        <BooleanIntelligence
                            label="Lint Script"
                            passed={analysis.project.hasLintScript}
                        />
                        <BooleanIntelligence
                            label="Type Check Script"
                            passed={analysis.project.hasTypeCheckScript}
                        />
                        <BooleanIntelligence
                            label="TypeScript"
                            passed={analysis.project.hasTypeScript}
                        />
                        <BooleanIntelligence
                            label="Lint Config"
                            passed={analysis.project.hasLintConfig}
                        />
                        <BooleanIntelligence
                            label="Formatter Config"
                            passed={analysis.project.hasFormatterConfig}
                        />
                        <BooleanIntelligence
                            label=".editorconfig"
                            passed={analysis.project.hasEditorConfig}
                        />
                        <BooleanIntelligence
                            label=".env Example"
                            passed={analysis.project.hasEnvExample}
                        />
                        <BooleanIntelligence
                            label="Lockfile"
                            passed={analysis.project.hasLockfile}
                        />
                        <BooleanIntelligence
                            label="Dockerfile"
                            passed={analysis.project.hasDockerfile}
                        />
                    </div>

                    {analysis.project.scripts.length > 0 && (
                        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                                package.json Scripts
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {analysis.project.scripts.map((script) => (
                                    <span
                                        key={script}
                                        className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300"
                                    >
                                        {script}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Release Intelligence */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <SectionHeading
                        title="Release Intelligence"
                        description="Published release history and versioning signals"
                    />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <IntelligenceCard
                            label="Release History"
                            value={analysis.release.exists ? "Detected" : "Not detected"}
                            state={analysis.release.exists ? "success" : "neutral"}
                        />
                        <MetadataCard
                            label="Latest Tag"
                            value={analysis.release.tag ?? "No release"}
                        />
                        <MetadataCard
                            label="Published"
                            value={latestReleaseDate}
                        />
                        <MetadataCard
                            label="Age"
                            value={
                                analysis.release.daysSinceRelease === null
                                    ? "Not available"
                                    : `${analysis.release.daysSinceRelease} day${analysis.release.daysSinceRelease === 1 ? "" : "s"
                                    } ago`
                            }
                        />
                    </div>
                </section>

                {/* Category scores */}
                <section className="mt-6">
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-white">Category Scores</p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Weighted health scores across the major repository-quality dimensions
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(analysis.scores).map(([name, score]) => (
                            <ScoreCard key={name} name={name} score={score} />
                        ))}
                    </div>
                </section>

                {/* Findings */}
                <section className="mt-8 grid items-start gap-6 lg:grid-cols-3">
                    <FindingColumn
                        title="Critical Issues"
                        count={analysis.issues.length}
                        titleClass="text-red-400"
                        borderClass="border-red-900/50"
                        backgroundClass="bg-red-950/20"
                        emptyText="No critical issues detected."
                    >
                        {analysis.issues.map((issue) => (
                            <FindingCard
                                key={issue.title}
                                title={`⚠ ${issue.title}`}
                                description={issue.description}
                                titleClass="text-red-300"
                                borderClass="border-red-900/40"
                            />
                        ))}
                    </FindingColumn>

                    <FindingColumn
                        title="Recommendations"
                        count={analysis.recommendations.length}
                        titleClass="text-yellow-400"
                        borderClass="border-yellow-900/50"
                        backgroundClass="bg-yellow-950/20"
                        emptyText="No recommendations right now."
                    >
                        {analysis.recommendations.map((item) => (
                            <FindingCard
                                key={item.title}
                                title={`• ${item.title}`}
                                description={item.description}
                                titleClass="text-yellow-300"
                                borderClass="border-yellow-900/40"
                            />
                        ))}
                    </FindingColumn>

                    <FindingColumn
                        title="Passed Checks"
                        count={analysis.passed.length}
                        titleClass="text-green-400"
                        borderClass="border-green-900/50"
                        backgroundClass="bg-green-950/20"
                        emptyText="No checks passed yet."
                    >
                        {analysis.passed.map((item) => (
                            <FindingCard
                                key={item.title}
                                title={`✓ ${item.title}`}
                                description={item.description}
                                titleClass="text-green-300"
                                borderClass="border-green-900/40"
                            />
                        ))}
                    </FindingColumn>
                </section>
            </div>
        </main>
    );
}

function SectionHeading({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
            {action}
        </div>
    );
}

function ScoreSectionHeading({
    title,
    description,
    score,
}: {
    title: string;
    description: string;
    score: number;
}) {
    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>

            <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${getScoreTextClass(score)}`}>
                    {score}
                </span>
                <span className="pb-1 text-sm text-zinc-600">/ 100</span>
            </div>
        </div>
    );
}

function ScoreBar({ score }: { score: number }) {
    return (
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-900">
            <div
                className={`h-full rounded-full ${getScoreBarClass(score)}`}
                style={{
                    width: `${Math.min(Math.max(score, 0), 100)}%`,
                }}
            />
        </div>
    );
}

function SummaryStat({
    value,
    label,
    className,
}: {
    value: number;
    label: string;
    className: string;
}) {
    return (
        <div
            className={`min-w-[90px] rounded-2xl border bg-black/30 px-4 py-3 ${className}`}
        >
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
        </div>
    );
}

function MetadataCard({
    label,
    value,
    valueClass = "text-zinc-200",
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                {label}
            </p>
            <p className={`mt-2 break-words text-sm font-semibold ${valueClass}`}>
                {value}
            </p>
        </div>
    );
}

function BooleanCard({
    label,
    passed,
}: {
    label: string;
    passed: boolean;
}) {
    return (
        <div
            className={`rounded-xl border p-4 ${passed
                    ? "border-green-900/40 bg-green-950/10"
                    : "border-zinc-800 bg-black/30"
                }`}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`text-sm font-bold ${passed ? "text-green-400" : "text-zinc-600"
                        }`}
                >
                    {passed ? "✓" : "○"}
                </span>
                <span
                    className={`text-sm font-medium ${passed ? "text-zinc-200" : "text-zinc-500"
                        }`}
                >
                    {label}
                </span>
            </div>
        </div>
    );
}

function BooleanIntelligence({
    label,
    passed,
}: {
    label: string;
    passed: boolean;
}) {
    return (
        <IntelligenceCard
            label={label}
            value={passed ? "Detected" : "Not detected"}
            state={passed ? "success" : "neutral"}
        />
    );
}

function IntelligenceCard({
    label,
    value,
    state,
}: {
    label: string;
    value: string;
    state: HealthState;
}) {
    const stateClass =
        state === "success"
            ? "border-green-900/40 bg-green-950/10"
            : state === "warning"
                ? "border-yellow-900/40 bg-yellow-950/10"
                : state === "danger"
                    ? "border-red-900/40 bg-red-950/10"
                    : "border-zinc-800 bg-black/30";

    const textClass =
        state === "success"
            ? "text-green-400"
            : state === "warning"
                ? "text-yellow-400"
                : state === "danger"
                    ? "text-red-400"
                    : "text-zinc-400";

    const icon =
        state === "success"
            ? "✓"
            : state === "warning"
                ? "!"
                : state === "danger"
                    ? "✕"
                    : "○";

    return (
        <div className={`rounded-xl border p-5 ${stateClass}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                {label}
            </p>

            <div className="mt-3 flex items-start gap-2">
                <span className={`font-bold ${textClass}`}>{icon}</span>
                <p className={`break-words text-sm font-semibold ${textClass}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function ScoreCard({
    name,
    score,
}: {
    name: string;
    score: number;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-zinc-500">{name}</p>
                <span className="text-sm text-zinc-600">/ 100</span>
            </div>

            <p className={`mt-2 text-3xl font-bold ${getScoreTextClass(score)}`}>
                {score}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                    className={`h-full rounded-full ${getScoreBarClass(score)}`}
                    style={{
                        width: `${Math.min(Math.max(score, 0), 100)}%`,
                    }}
                />
            </div>
        </div>
    );
}

function FindingColumn({
    title,
    count,
    titleClass,
    borderClass,
    backgroundClass,
    emptyText,
    children,
}: {
    title: string;
    count: number;
    titleClass: string;
    borderClass: string;
    backgroundClass: string;
    emptyText: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl border p-6 ${borderClass} ${backgroundClass}`}
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className={`text-lg font-semibold ${titleClass}`}>{title}</h2>

                <span className="rounded-full border border-zinc-800 bg-black/30 px-2.5 py-1 text-xs text-zinc-500">
                    {count}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {count > 0 ? children : (
                    <p className="text-sm text-zinc-500">{emptyText}</p>
                )}
            </div>
        </div>
    );
}

function FindingCard({
    title,
    description,
    titleClass,
    borderClass,
}: {
    title: string;
    description: string;
    titleClass: string;
    borderClass: string;
}) {
    return (
        <div className={`rounded-xl border bg-black/30 p-4 ${borderClass}`}>
            <p className={`text-sm font-semibold ${titleClass}`}>{title}</p>
            <p className="mt-2 text-sm leading-5 text-zinc-400">{description}</p>
        </div>
    );
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function getMaintenanceClass(status: string) {
    switch (status) {
        case "Active":
            return "text-green-400";
        case "Needs Attention":
            return "text-yellow-400";
        case "Stale":
            return "text-orange-400";
        case "Inactive":
        case "Archived":
            return "text-red-400";
        default:
            return "text-zinc-200";
    }
}

function getScoreBarClass(score: number) {
    if (score >= 80) return "bg-green-400";
    if (score >= 60) return "bg-yellow-400";
    return "bg-red-400";
}

function getScoreTextClass(score: number) {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
}
