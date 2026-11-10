
import Link from "next/link";
import { analyzeRepo } from "@/lib/github/analyzeRepo";
import type { ReactNode } from "react";

type Props = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

type Tone = "success" | "warning" | "danger" | "neutral";

const glass =
  "rounded-[26px] border border-white/80 " +
  "bg-white/30 backdrop-blur-2xl " +
  "shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),0_18px_45px_rgba(83,72,120,0.10)]";

const inset =
  "rounded-2xl border border-white/80 " +
  "bg-white/35 " +
  "shadow-[inset_3px_3px_9px_rgba(92,82,126,0.09),inset_-3px_-3px_9px_rgba(255,255,255,0.75)]";

const colors = {
  success: {
    text: "#168066",
    background: "rgba(225,246,236,0.48)",
    border: "rgba(80,172,132,0.28)",
  },
  warning: {
    text: "#a76524",
    background: "rgba(255,238,217,0.48)",
    border: "rgba(233,157,78,0.30)",
  },
  danger: {
    text: "#b23954",
    background: "rgba(255,231,235,0.48)",
    border: "rgba(216,89,110,0.28)",
  },
  neutral: {
    text: "#7656a8",
    background: "rgba(235,227,248,0.45)",
    border: "rgba(166,138,206,0.26)",
  },
};

function clamp(score: number) {
  return Math.max(0, Math.min(100, score));
}

function scoreTone(score: number): Tone {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}

function scoreGradient(score: number) {
  if (score >= 80) {
    return "linear-gradient(90deg,#36b998,#9ad5be)";
  }

  if (score >= 60) {
    return "linear-gradient(90deg,#f0964c,#f4c28e)";
  }

  return "linear-gradient(90deg,#dc6077,#f3a092)";
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

export default async function ReportPage({ params }: Props) {
  const { owner, repo } = await params;
  const analysis = await analyzeRepo(owner, repo);

  const overall = analysis.overall;
  const overallTone = scoreTone(overall);

  const totalChecks =
    analysis.issues.length +
    analysis.recommendations.length +
    analysis.passed.length;

  const healthLabel =
    overall >= 80
      ? "Healthy"
      : overall >= 60
        ? "Needs Improvement"
        : "At Risk";

  const createdAt = formatDate(
    analysis.repository.createdAt
  );

  const latestReleaseDate = analysis.release.publishedAt
    ? formatDate(analysis.release.publishedAt)
    : "Not available";

  return (
    <main className="rd-results relative min-h-screen overflow-hidden text-[#253249]">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-orange-200/20 blur-[120px]" />
        <div className="absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-violet-300/25 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Navigation */}
        <header
          className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${glass}`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 no-underline"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-orange-100 to-violet-200 text-xl shadow-inner">
              🩺
            </span>

            <span>
              <strong className="block text-base font-extrabold tracking-tight text-slate-800">
                RepoDoctor
                <span className="text-orange-500">.</span>
              </strong>

              <small className="block text-[11px] text-slate-600">
                Repository health intelligence
              </small>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/80 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              New analysis
            </Link>

            <Link
              href="/compare"
              className="rounded-xl border border-white/80 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Compare
            </Link>

            <a
              href={`https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-orange-300/70 bg-gradient-to-r from-orange-300 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(242,123,48,0.25)] transition hover:-translate-y-0.5"
            >
              GitHub ↗
            </a>
          </nav>
        </header>

        {/* Health overview */}
        <section className={`mt-7 p-6 sm:p-8 ${glass}`}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-700">
                Repository health report
              </p>

              <h1 className="mt-4 break-words text-3xl font-extrabold tracking-[-0.045em] text-slate-800 sm:text-5xl">
                {analysis.repository.fullName}
              </h1>

              {analysis.repository.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {analysis.repository.description}
                </p>
              )}

              {analysis.repository.analysisMode ===
                "safe-large-repository" && (
                <p className="mt-4 inline-flex rounded-full border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-xs font-semibold text-orange-800">
                  Large repository · Safe scan
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <ScoreRing score={overall} />

                <div>
                  <span
                    className="inline-flex rounded-full border px-4 py-2 text-xs font-bold"
                    style={{
                      color: colors[overallTone].text,
                      background:
                        colors[overallTone].background,
                      borderColor:
                        colors[overallTone].border,
                    }}
                  >
                    {healthLabel}
                  </span>

                  <h2 className="mt-3 text-xl font-extrabold text-slate-800">
                    Overall repository health
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                    A summary of detected repository
                    engineering and maintenance signals.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total findings"
                value={totalChecks}
                tone="neutral"
              />

              <StatCard
                label="Critical issues"
                value={analysis.issues.length}
                tone="danger"
              />

              <StatCard
                label="Recommendations"
                value={analysis.recommendations.length}
                tone="warning"
              />

              <StatCard
                label="Passed checks"
                value={analysis.passed.length}
                tone="success"
              />
            </div>
          </div>
        </section>

        {/* Quick links */}
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Report sections">
          <AnchorButton href="#overview">
            Overview
          </AnchorButton>

          <AnchorButton href="#engineering">
            Engineering
          </AnchorButton>

          <AnchorButton href="#scores">
            Scores
          </AnchorButton>

          <AnchorButton href="#findings">
            Findings
          </AnchorButton>
        </nav>

        {/* Repository overview */}
        <section id="overview" className={`mt-7 scroll-mt-6 p-6 ${glass}`}>
          <SectionHeading
            title="Repository Overview"
            description="GitHub metadata and maintenance intelligence"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Stars"
              value={`★ ${analysis.repository.stars.toLocaleString()}`}
            />

            <InfoCard
              label="Forks"
              value={analysis.repository.forks.toLocaleString()}
            />

            <InfoCard
              label="Open issues"
              value={analysis.repository.openIssues.toLocaleString()}
            />

            <InfoCard
              label="Language"
              value={
                analysis.repository.language ??
                "Not detected"
              }
            />

            <InfoCard
              label="Default branch"
              value={analysis.repository.defaultBranch}
            />

            <InfoCard
              label="Last push"
              value={`${analysis.repository.daysSinceLastPush} days ago`}
            />

            <InfoCard label="Created" value={createdAt} />

            <InfoCard
              label="Maintenance"
              value={analysis.repository.maintenanceStatus}
            />
          </div>
        </section>

        {/* README and testing */}
        <div
          id="engineering"
          className="mt-6 grid scroll-mt-6 items-start gap-6 xl:grid-cols-2"
        >
          <ScoreSection
            title="README Quality"
            description="Documentation completeness and developer usability"
            score={analysis.readme.qualityScore}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckCard
                label="README exists"
                passed={analysis.readme.exists}
              />

              <CheckCard
                label="Project description"
                passed={analysis.readme.hasDescription}
              />

              <CheckCard
                label="Installation guide"
                passed={analysis.readme.hasInstallation}
              />

              <CheckCard
                label="Usage instructions"
                passed={analysis.readme.hasUsage}
              />

              <CheckCard
                label="Contributing guidelines"
                passed={analysis.readme.hasContributing}
              />

              <CheckCard
                label="License section"
                passed={analysis.readme.hasLicense}
              />

              <CheckCard
                label="Code examples"
                passed={analysis.readme.hasCodeExamples}
              />

              <CheckCard
                label="README badges"
                passed={analysis.readme.hasBadges}
              />
            </div>

            <p className="mt-5 text-xs text-slate-600">
              Approximate README length:{" "}
              <strong>
                {analysis.readme.wordCount.toLocaleString()}
                {" "}words
              </strong>
            </p>
          </ScoreSection>

          <ScoreSection
            title="Testing Intelligence"
            description="Test discovery, tooling, and CI execution"
            score={analysis.scores.Testing}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckCard
                label="Test files"
                passed={analysis.testing.hasTests}
              />

              <CheckCard
                label="Test script"
                passed={analysis.testing.hasTestScript}
              />

              <CheckCard
                label="CI executes tests"
                passed={analysis.testing.ciRunsTests}
              />

              <InfoCard
                label="Frameworks"
                value={
                  analysis.testing.frameworks.length
                    ? analysis.testing.frameworks.join(", ")
                    : "Not detected"
                }
              />
            </div>
          </ScoreSection>
        </div>

        {/* Automation and security */}
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
          <ScoreSection
            title="CI/CD Intelligence"
            description="Automation, validation, and delivery workflows"
            score={analysis.scores.Automation}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckCard
                label="GitHub Actions"
                passed={analysis.automation.workflowsExist}
              />

              <CheckCard
                label="Build workflow"
                passed={analysis.automation.hasBuild}
              />

              <CheckCard
                label="Test workflow"
                passed={analysis.automation.hasTest}
              />

              <CheckCard
                label="Lint workflow"
                passed={analysis.automation.hasLint}
              />

              <CheckCard
                label="Type checking"
                passed={analysis.automation.hasTypeCheck}
              />

              <CheckCard
                label="Security scanning"
                passed={analysis.automation.hasSecurity}
              />

              <CheckCard
                label="Deployment"
                passed={analysis.automation.hasDeploy}
              />

              <CheckCard
                label="Release automation"
                passed={analysis.automation.hasRelease}
              />
            </div>
          </ScoreSection>

          <ScoreSection
            title="Security Intelligence"
            description="Repository security signals and dependency safeguards"
            score={analysis.scores.Security}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckCard
                label="Security policy"
                passed={analysis.security.hasSecurityPolicy}
              />

              <CheckCard
                label="Dependabot"
                passed={analysis.security.dependabot}
              />

              <CheckCard
                label="Automated security scanning"
                passed={
                  analysis.security.automatedSecurityScanning
                }
              />

              <CheckCard
                label="Dependency lockfile"
                passed={analysis.security.hasLockfile}
              />
            </div>
          </ScoreSection>
        </div>

        {/* Project engineering */}
        <ScoreSection
          title="Project Engineering"
          description="Tooling, configuration, reproducibility, and development quality"
          score={analysis.scores["Code Quality"]}
          className="mt-6"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Package manager"
              value={
                analysis.project.packageManager ??
                "Not detected"
              }
            />

            <CheckCard
              label="package.json"
              passed={analysis.project.hasPackageJson}
            />

            <CheckCard
              label="Build script"
              passed={analysis.project.hasBuildScript}
            />

            <CheckCard
              label="Lint script"
              passed={analysis.project.hasLintScript}
            />

            <CheckCard
              label="Type check script"
              passed={analysis.project.hasTypeCheckScript}
            />

            <CheckCard
              label="TypeScript"
              passed={analysis.project.hasTypeScript}
            />

            <CheckCard
              label="Lint configuration"
              passed={analysis.project.hasLintConfig}
            />

            <CheckCard
              label="Formatter configuration"
              passed={analysis.project.hasFormatterConfig}
            />

            <CheckCard
              label=".editorconfig"
              passed={analysis.project.hasEditorConfig}
            />

            <CheckCard
              label=".env example"
              passed={analysis.project.hasEnvExample}
            />

            <CheckCard
              label="Lockfile"
              passed={analysis.project.hasLockfile}
            />

            <CheckCard
              label="Dockerfile"
              passed={analysis.project.hasDockerfile}
            />
          </div>
        </ScoreSection>

        {/* Release intelligence */}
        <Panel className="mt-6">
          <SectionHeading
            title="Release Intelligence"
            description="Published versions and release history"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CheckCard
              label="Release history"
              passed={analysis.release.exists}
            />

            <InfoCard
              label="Latest tag"
              value={analysis.release.tag ?? "No release"}
            />

            <InfoCard
              label="Published"
              value={latestReleaseDate}
            />

            <InfoCard
              label="Release age"
              value={
                analysis.release.daysSinceRelease === null
                  ? "Not available"
                  : `${analysis.release.daysSinceRelease} days ago`
              }
            />
          </div>
        </Panel>

        {/* Category scores */}
        <section id="scores" className="mt-9 scroll-mt-6">
          <SectionHeading
            title="Category Scores"
            description="Repository health across the main engineering dimensions"
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(analysis.scores).map(
              ([name, score]) => (
                <CategoryScore
                  key={name}
                  name={name}
                  score={Number(score)}
                />
              )
            )}
          </div>
        </section>

        {/* Findings */}
        <section
          id="findings"
          className="mt-10 scroll-mt-6"
        >
          <SectionHeading
            title="Findings & Recommendations"
            description="Review detected gaps, suggested improvements, and passed checks"
          />

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
            <FindingColumn
              title="Critical Issues"
              count={analysis.issues.length}
              tone="danger"
              emptyText="No critical issues detected."
            >
              {analysis.issues.map((issue, index) => (
                <FindingCard
                  key={`${index}-${issue.title}`}
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
              {analysis.recommendations.map(
                (item, index) => (
                  <FindingCard
                    key={`${index}-${item.title}`}
                    title={item.title}
                    description={item.description}
                    tone="warning"
                  />
                )
              )}
            </FindingColumn>

            <FindingColumn
              title="Passed Checks"
              count={analysis.passed.length}
              tone="success"
              emptyText="No checks passed yet."
            >
              {analysis.passed.map((item, index) => (
                <FindingCard
                  key={`${index}-${item.title}`}
                  title={item.title}
                  description={item.description}
                  tone="success"
                />
              ))}
            </FindingColumn>
          </div>
        </section>

        {/* Report disclaimer */}
        <p className="mx-auto mt-9 max-w-3xl text-center text-xs leading-6 text-slate-600">
          RepoDoctor evaluates observable repository
          signals. Scores are indicators of engineering
          practices, not guarantees of software security,
          correctness, or overall project quality.
        </p>

        <footer className="mt-8 border-t border-white/50 py-7 text-center text-xs text-slate-600">
          RepoDoctor · Open-source repository intelligence
        </footer>
      </div>
    </main>
  );
}

/* ==========================================
   SHARED REPORT COMPONENTS
   ========================================== */

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${glass} p-5 sm:p-6 ${className}`}>
      {children}
    </section>
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
      <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function AnchorButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/85 bg-white/55 px-4 py-2 text-xs font-bold text-violet-800 shadow-[inset_0_1px_1px_white,0_4px_12px_rgba(84,72,125,0.1)] transition hover:-translate-y-0.5 hover:bg-white/80"
    >
      {children}
    </a>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-36 w-36 shrink-0 place-items-center rounded-full p-3 shadow-lg sm:h-40 sm:w-40"
      style={{
        background: `conic-gradient(
          #e68e54 0%,
          #9e78cc ${clamp(score)}%,
          #e5dfea ${clamp(score)}%,
          #e5dfea 100%
        )`,
      }}
      aria-label={`Health score ${score} out of 100`}
    >
      <div className="flex h-full w-full items-baseline justify-center rounded-full bg-[#faf9fc] pt-11 shadow-inner sm:pt-12">
        <strong className="text-5xl font-extrabold tracking-tight text-slate-800">
          {score}
        </strong>

        <span className="ml-1 text-xs text-slate-500">
          /100
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const theme = colors[tone];

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: theme.border,
        background: theme.background,
        boxShadow:
          "inset 0 1px 2px white,0 7px 20px rgba(80,70,120,0.06)",
      }}
    >
      <strong
        className="block text-3xl font-extrabold tabular-nums"
        style={{ color: theme.text }}
      >
        {value}
      </strong>

      <p className="mt-2 text-xs font-semibold text-slate-600">
        {label}
      </p>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamp(score)}
      aria-label="Category health score"
      className="h-2.5 overflow-hidden rounded-full bg-slate-300/35 shadow-inner"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamp(score)}%`,
          background: scoreGradient(score),
        }}
      />
    </div>
  );
}

function ScoreSection({
  title,
  description,
  score,
  children,
  className = "",
}: {
  title: string;
  description: string;
  score: number;
  children: ReactNode;
  className?: string;
}) {
  const tone = scoreTone(score);

  return (
    <Panel className={className}>
      <div className="flex items-start justify-between gap-5">
        <SectionHeading
          title={title}
          description={description}
        />

        <div className="shrink-0 text-right">
          <strong
            className="text-3xl font-extrabold tabular-nums"
            style={{ color: colors[tone].text }}
          >
            {score}
          </strong>

          <span className="ml-1 text-xs text-slate-500">
            /100
          </span>
        </div>
      </div>

      <div className="mt-5">
        <ScoreBar score={score} />
      </div>

      <div className="mt-6">{children}</div>
    </Panel>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={`${inset} min-w-0 p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function CheckCard({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className={`${inset} flex min-w-0 items-center gap-3 p-4`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
          passed
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-200/60 text-slate-600"
        }`}
      >
        {passed ? "✓" : "○"}
      </span>

      <span className="min-w-0 text-sm font-semibold text-slate-700">
        {label}
      </span>
    </div>
  );
}

function CategoryScore({
  name,
  score,
}: {
  name: string;
  score: number;
}) {
  const tone = scoreTone(score);

  return (
    <article className={`${glass} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-700">
          {name}
        </h3>

        <span className="text-xs text-slate-500">
          /100
        </span>
      </div>

      <strong
        className="mt-4 block text-4xl font-extrabold tabular-nums"
        style={{ color: colors[tone].text }}
      >
        {score}
      </strong>

      <div className="mt-4">
        <ScoreBar score={score} />
      </div>
    </article>
  );
}

/* ==========================================
   EXPANDABLE FINDINGS
   ========================================== */

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
  children: ReactNode;
}) {
  const theme = colors[tone];

  return (
    <section
      className="rounded-[26px] border p-5 sm:p-6"
      style={{
        background: theme.background,
        borderColor: theme.border,
        backdropFilter: "blur(22px)",
        boxShadow:
          "inset 0 1px 2px white,0 12px 28px rgba(82,73,125,0.08)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-lg font-extrabold"
          style={{ color: theme.text }}
        >
          {title}
        </h2>

        <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1 text-xs font-bold text-slate-700">
          {count}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">
        {count > 0
          ? "Select a finding to view its details."
          : emptyText}
      </p>

      {count > 0 && (
        <div className="mt-5 space-y-3">
          {children}
        </div>
      )}
    </section>
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
  const theme = colors[tone];

  const icon =
    tone === "success"
      ? "✓"
      : tone === "warning"
        ? "!"
        : "⚠";

  return (
    <details className="group overflow-hidden rounded-2xl border border-white/85 bg-white/50 shadow-[inset_0_1px_2px_white,0_5px_15px_rgba(80,70,120,0.06)]">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-violet-500 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/75 text-sm font-bold"
          style={{ color: theme.text }}
        >
          {icon}
        </span>

        <span
          className="min-w-0 flex-1 break-words text-sm font-bold"
          style={{ color: theme.text }}
        >
          {title}
        </span>

        <span
          aria-hidden="true"
          className="shrink-0 text-xl text-slate-500 transition-transform group-open:rotate-180"
        >
          ⌄
        </span>
      </summary>

      <div className="border-t border-white/70 px-4 pb-5 pt-4">
        <p className="break-words text-sm leading-7 text-slate-700">
          {description}
        </p>
      </div>
    </details>
  );
}
