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
          chipClass:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
          glowClass: "shadow-emerald-500/10",
        }
      : analysis.overall >= 60
        ? {
            label: "Needs Improvement",
            chipClass:
              "border-amber-400/20 bg-amber-400/10 text-amber-300",
            glowClass: "shadow-amber-500/10",
          }
        : {
            label: "At Risk",
            chipClass: "border-red-400/20 bg-red-400/10 text-red-300",
            glowClass: "shadow-red-500/10",
          };

  const createdAt = formatDate(analysis.repository.createdAt);
  const latestReleaseDate = analysis.release.publishedAt
    ? formatDate(analysis.release.publishedAt)
    : "Not available";

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute left-[7%] top-[34%] h-[320px] w-[320px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute right-[8%] top-[45%] h-[320px] w-[320px] rounded-full bg-violet-500/5 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-2xl sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-zinc-300 transition hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              🩺
            </div>
            <div>
              <div className="font-semibold tracking-tight">RepoDoctor</div>
              <div className="text-[10px] text-zinc-500">
                Repository health intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/compare"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
            >
              Compare
            </Link>

            <a
              href={`https://github.com/${analysis.repository.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
            >
              GitHub ↗
            </a>
          </div>
        </header>

        <section
          className={`mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl ${status.glowClass} backdrop-blur-2xl sm:p-8`}
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                  Repository Health Report
                </span>

                {analysis.repository.analysisMode === "safe-large-repository" && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] text-amber-300">
                    Large repository · Safe scan
                  </span>
                )}
              </div>

              <h1 className="mt-4 break-words text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {analysis.repository.fullName}
              </h1>

              {analysis.repository.description && (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                  {analysis.repository.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-end gap-4">
                <div className="flex items-end gap-3">
                  <span className="text-7xl font-semibold tracking-[-0.05em] sm:text-8xl">
                    {analysis.overall}
                  </span>
                  <span className="pb-3 text-base text-zinc-600">/ 100</span>
                </div>

                <div className="pb-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.chipClass}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${getScoreGradientClass(
                    analysis.overall
                  )}`}
                  style={{
                    width: `${Math.min(Math.max(analysis.overall, 0), 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <SummaryStat value={totalChecks} label="Checks" />
              <SummaryStat value={analysis.issues.length} label="Critical" tone="danger" />
              <SummaryStat
                value={analysis.recommendations.length}
                label="Recommended"
                tone="warning"
              />
              <SummaryStat value={analysis.passed.length} label="Passed" tone="success" />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <SectionHeading
            title="Repository Overview"
            description="Live metadata and maintenance intelligence from GitHub"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetadataCard label="Stars" value={`★ ${analysis.repository.stars.toLocaleString()}`} />
            <MetadataCard label="Forks" value={`⑂ ${analysis.repository.forks.toLocaleString()}`} />
            <MetadataCard label="Open Issues" value={analysis.repository.openIssues.toLocaleString()} />
            <MetadataCard label="Language" value={analysis.repository.language ?? "Not detected"} />
            <MetadataCard label="Default Branch" value={analysis.repository.defaultBranch} />
            <MetadataCard
              label="Last Push"
              value={`${analysis.repository.daysSinceLastPush} day${
                analysis.repository.daysSinceLastPush === 1 ? "" : "s"
              } ago`}
            />
            <MetadataCard label="Created" value={createdAt} />
            <MetadataCard
              label="Maintenance"
              value={analysis.repository.maintenanceStatus}
              valueClass={getMaintenanceClass(analysis.repository.maintenanceStatus)}
            />
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <GlassScoreSection
            title="README Quality"
            description="Content quality, completeness, and developer usability"
            score={analysis.readme.qualityScore}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <BooleanCard label="README Exists" passed={analysis.readme.exists} />
              <BooleanCard label="Project Description" passed={analysis.readme.hasDescription} />
              <BooleanCard label="Installation" passed={analysis.readme.hasInstallation} />
              <BooleanCard label="Usage" passed={analysis.readme.hasUsage} />
              <BooleanCard label="Contributing" passed={analysis.readme.hasContributing} />
              <BooleanCard label="License Section" passed={analysis.readme.hasLicense} />
              <BooleanCard label="Code Examples" passed={analysis.readme.hasCodeExamples} />
              <BooleanCard label="Badges" passed={analysis.readme.hasBadges} />
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Approximate README length:{" "}
              <span className="font-medium text-zinc-300">
                {analysis.readme.wordCount.toLocaleString()} words
              </span>
            </p>
          </GlassScoreSection>

          <GlassScoreSection
            title="Testing Intelligence"
            description="Automated test discovery, frameworks, scripts, and CI execution"
            score={analysis.scores.Testing}
          >
            <div className="grid gap-3 sm:grid-cols-2">
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
                state={analysis.testing.frameworks.length > 0 ? "success" : "neutral"}
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
          </GlassScoreSection>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <GlassScoreSection
            title="CI/CD Intelligence"
            description="Build, test, quality, security, deployment, and release workflows"
            score={analysis.scores.Automation}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <BooleanIntelligence label="GitHub Actions" passed={analysis.automation.workflowsExist} />
              <BooleanIntelligence label="Build" passed={analysis.automation.hasBuild} />
              <BooleanIntelligence label="Tests" passed={analysis.automation.hasTest} />
              <BooleanIntelligence label="Lint" passed={analysis.automation.hasLint} />
              <BooleanIntelligence label="Type Check" passed={analysis.automation.hasTypeCheck} />
              <BooleanIntelligence label="Security Scan" passed={analysis.automation.hasSecurity} />
              <BooleanIntelligence label="Deploy" passed={analysis.automation.hasDeploy} />
              <BooleanIntelligence label="Release" passed={analysis.automation.hasRelease} />
            </div>
          </GlassScoreSection>

          <GlassScoreSection
            title="Security Intelligence"
            description="Security policy, dependency controls, lockfiles, and automated scanning"
            score={analysis.scores.Security}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <BooleanIntelligence label="Security Policy" passed={analysis.security.hasSecurityPolicy} />
              <BooleanIntelligence label="Dependabot" passed={analysis.security.dependabot} />
              <BooleanIntelligence
                label="Security Scanning"
                passed={analysis.security.automatedSecurityScanning}
              />
              <BooleanIntelligence label="Dependency Lockfile" passed={analysis.security.hasLockfile} />
            </div>
          </GlassScoreSection>
        </div>

        <GlassScoreSection
          title="Project Engineering"
          description="Development ergonomics, tooling, reproducibility, configuration, and code-quality signals"
          score={analysis.scores["Code Quality"]}
          className="mt-6"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <IntelligenceCard
              label="Package Manager"
              value={analysis.project.packageManager ?? "Not detected"}
              state={analysis.project.packageManager ? "success" : "neutral"}
            />
            <BooleanIntelligence label="package.json" passed={analysis.project.hasPackageJson} />
            <BooleanIntelligence label="Build Script" passed={analysis.project.hasBuildScript} />
            <BooleanIntelligence label="Lint Script" passed={analysis.project.hasLintScript} />
            <BooleanIntelligence
              label="Type Check Script"
              passed={analysis.project.hasTypeCheckScript}
            />
            <BooleanIntelligence label="TypeScript" passed={analysis.project.hasTypeScript} />
            <BooleanIntelligence label="Lint Config" passed={analysis.project.hasLintConfig} />
            <BooleanIntelligence
              label="Formatter Config"
              passed={analysis.project.hasFormatterConfig}
            />
            <BooleanIntelligence label=".editorconfig" passed={analysis.project.hasEditorConfig} />
            <BooleanIntelligence label=".env Example" passed={analysis.project.hasEnvExample} />
            <BooleanIntelligence label="Lockfile" passed={analysis.project.hasLockfile} />
            <BooleanIntelligence label="Dockerfile" passed={analysis.project.hasDockerfile} />
          </div>
        </GlassScoreSection>

        <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <SectionHeading
            title="Release Intelligence"
            description="Published release history and versioning signals"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <IntelligenceCard
              label="Release History"
              value={analysis.release.exists ? "Detected" : "Not detected"}
              state={analysis.release.exists ? "success" : "neutral"}
            />
            <MetadataCard label="Latest Tag" value={analysis.release.tag ?? "No release"} />
            <MetadataCard label="Published" value={latestReleaseDate} />
            <MetadataCard
              label="Age"
              value={
                analysis.release.daysSinceRelease === null
                  ? "Not available"
                  : `${analysis.release.daysSinceRelease} day${
                      analysis.release.daysSinceRelease === 1 ? "" : "s"
                    } ago`
              }
            />
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading
            title="Category Scores"
            description="Weighted health scores across the major repository-quality dimensions"
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(analysis.scores).map(([name, score]) => (
              <ScoreCard key={name} name={name} score={score} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid items-start gap-6 lg:grid-cols-3">
          <FindingColumn
            title="Critical Issues"
            count={analysis.issues.length}
            tone="danger"
            emptyText="No critical issues detected."
          >
            {analysis.issues.map((issue) => (
              <FindingCard
                key={issue.title}
                title={issue.title}
                description={issue.description}
                tone="danger"
              />
            ))}
          </FindingColumn>

          <FindingColumn
            title="Recommendations"
            count={analysis.recommendations.length}
            tone="warning"
            emptyText="No recommendations right now."
          >
            {analysis.recommendations.map((item) => (
              <FindingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="warning"
              />
            ))}
          </FindingColumn>

          <FindingColumn
            title="Passed Checks"
            count={analysis.passed.length}
            tone="success"
            emptyText="No checks passed yet."
          >
            {analysis.passed.map((item) => (
              <FindingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="success"
              />
            ))}
          </FindingColumn>
        </section>

        <footer className="mt-10 border-t border-white/5 py-7 text-center text-xs text-zinc-700">
          RepoDoctor · Open Source · Repository health intelligence
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function GlassScoreSection({
  title,
  description,
  score,
  children,
  className = "",
}: {
  title: string;
  description: string;
  score: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>

        <div className="flex shrink-0 items-end gap-1.5">
          <span className={`text-3xl font-semibold ${getScoreTextClass(score)}`}>
            {score}
          </span>
          <span className="pb-1 text-xs text-zinc-700">/100</span>
        </div>
      </div>

      <ScoreBar score={score} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full ${getScoreGradientClass(score)}`}
        style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
      />
    </div>
  );
}

function SummaryStat({
  value,
  label,
  tone = "neutral",
}: {
  value: number;
  label: string;
  tone?: HealthState;
}) {
  const classes =
    tone === "success"
      ? "border-emerald-400/15 bg-emerald-400/[0.05]"
      : tone === "warning"
        ? "border-amber-400/15 bg-amber-400/[0.05]"
        : tone === "danger"
          ? "border-red-400/15 bg-red-400/[0.05]"
          : "border-white/10 bg-black/30";

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
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
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-600">{label}</p>
      <p className={`mt-2 break-words text-sm font-medium ${valueClass}`}>{value}</p>
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
      className={`rounded-2xl border p-4 ${
        passed
          ? "border-emerald-400/15 bg-emerald-400/[0.05]"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={passed ? "text-emerald-300" : "text-zinc-700"}>
          {passed ? "✓" : "○"}
        </span>
        <span className={passed ? "text-sm text-zinc-200" : "text-sm text-zinc-500"}>
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
      ? "border-emerald-400/15 bg-emerald-400/[0.05]"
      : state === "warning"
        ? "border-amber-400/15 bg-amber-400/[0.05]"
        : state === "danger"
          ? "border-red-400/15 bg-red-400/[0.05]"
          : "border-white/10 bg-black/30";

  const textClass =
    state === "success"
      ? "text-emerald-300"
      : state === "warning"
        ? "text-amber-300"
        : state === "danger"
          ? "text-red-300"
          : "text-zinc-400";

  const icon =
    state === "success" ? "✓" : state === "warning" ? "!" : state === "danger" ? "✕" : "○";

  return (
    <div className={`rounded-2xl border p-4 ${stateClass}`}>
      <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-600">{label}</p>
      <div className="mt-3 flex items-start gap-2">
        <span className={`text-sm font-semibold ${textClass}`}>{icon}</span>
        <p className={`break-words text-sm font-medium ${textClass}`}>{value}</p>
      </div>
    </div>
  );
}

function ScoreCard({ name, score }: { name: string; score: number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{name}</p>
        <span className="text-[11px] text-zinc-700">/100</span>
      </div>

      <p className={`mt-3 text-3xl font-semibold ${getScoreTextClass(score)}`}>{score}</p>
      <ScoreBar score={score} />
    </div>
  );
}

function FindingColumn({
  title,
  count,
  tone,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  tone: "success" | "warning" | "danger";
  emptyText: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-400/15 bg-emerald-400/[0.04]"
      : tone === "warning"
        ? "border-amber-400/15 bg-amber-400/[0.04]"
        : "border-red-400/15 bg-red-400/[0.04]";

  const titleClass =
    tone === "success"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : "text-red-300";

  return (
    <div className={`rounded-[24px] border p-6 backdrop-blur-xl ${styles}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-lg font-semibold ${titleClass}`}>{title}</h2>
        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-zinc-500">
          {count}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {count > 0 ? children : <p className="text-sm text-zinc-500">{emptyText}</p>}
      </div>
    </div>
  );
}

function FindingCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "success" | "warning" | "danger";
}) {
  const titleClass =
    tone === "success"
      ? "text-emerald-200"
      : tone === "warning"
        ? "text-amber-200"
        : "text-red-200";

  const icon = tone === "success" ? "✓" : tone === "warning" ? "•" : "⚠";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className={`text-sm font-medium ${titleClass}`}>
        {icon} {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
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
      return "text-emerald-300";
    case "Needs Attention":
      return "text-amber-300";
    case "Stale":
      return "text-orange-300";
    case "Inactive":
    case "Archived":
      return "text-red-300";
    default:
      return "text-zinc-200";
  }
}

function getScoreTextClass(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-red-300";
}

function getScoreGradientClass(score: number) {
  if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-cyan-400";
  if (score >= 60) return "bg-gradient-to-r from-amber-400 to-yellow-300";
  return "bg-gradient-to-r from-red-500 to-orange-400";
}
