import Link from "next/link";
import { analyzeRepo } from "@/lib/github/analyzeRepo";

type PageProps = {
  params: Promise<{
    ownerA: string;
    repoA: string;
    ownerB: string;
    repoB: string;
  }>;
};

export default async function RepositoryComparisonPage({
  params,
}: PageProps) {
  const { ownerA, repoA, ownerB, repoB } = await params;

  const [a, b] = await Promise.all([
    analyzeRepo(ownerA, repoA),
    analyzeRepo(ownerB, repoB),
  ]);

  const categories = Object.keys(
    a.scores
  ) as Array<keyof typeof a.scores>;

  const aWins = a.overall > b.overall;
  const bWins = b.overall > a.overall;
  const tied = a.overall === b.overall;

  const winnerName = tied
    ? null
    : aWins
      ? a.repository.fullName
      : b.repository.fullName;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Ambient result glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[-180px] h-[430px] w-[430px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute right-[10%] top-[-160px] h-[430px] w-[430px] rounded-full bg-violet-500/8 blur-[150px]" />
        <div className="absolute left-1/2 top-[45%] h-[400px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-500/[0.025] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-zinc-300 transition hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              🩺
            </div>

            <div>
              <div className="font-semibold">
                RepoDoctor
              </div>

              <div className="text-[10px] text-zinc-500">
                Repository health intelligence
              </div>
            </div>
          </Link>

          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href="/compare"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:flex-none"
            >
              New comparison
            </Link>

            <Link
              href="/"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:flex-none"
            >
              Analyze
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl pb-20 pt-12 sm:pt-16">
          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-2 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Comparison complete
            </div>

            <h1 className="mt-6 break-words text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {a.repository.fullName}

              <span className="mx-3 text-zinc-700">
                vs
              </span>

              {b.repository.fullName}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-500">
              Side-by-side repository health intelligence.
            </p>
          </div>

          {/* Main competitors */}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <RepositoryScoreCard
              label="Repository A"
              repository={a.repository.fullName}
              score={a.overall}
              winner={aWins}
              tied={tied}
              analysisMode={a.repository.analysisMode}
              reportHref={`/report/${encodeURIComponent(
                ownerA
              )}/${encodeURIComponent(repoA)}`}
            />

            <RepositoryScoreCard
              label="Repository B"
              repository={b.repository.fullName}
              score={b.overall}
              winner={bWins}
              tied={tied}
              analysisMode={b.repository.analysisMode}
              reportHref={`/report/${encodeURIComponent(
                ownerB
              )}/${encodeURIComponent(repoB)}`}
            />
          </div>

          {/* Result */}
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">
              Overall result
            </p>

            {tied ? (
              <p className="mt-2 text-2xl font-semibold">
                The repositories are tied.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold">
                  {winnerName} wins this comparison.
                </p>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Winner
                </span>
              </div>
            )}
          </div>

          {/* Category comparison */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
            <div className="grid grid-cols-[1.15fr_1fr_1fr] border-b border-white/10 bg-white/[0.025] px-4 py-4 text-xs font-medium sm:px-6 sm:text-sm">
              <span className="text-zinc-500">
                Category
              </span>

              <span className="truncate">
                {a.repository.fullName}
              </span>

              <span className="truncate">
                {b.repository.fullName}
              </span>
            </div>

            {categories.map((category) => {
              const scoreA = a.scores[category];
              const scoreB = b.scores[category];

              return (
                <ComparisonRow
                  key={category}
                  category={category}
                  scoreA={scoreA}
                  scoreB={scoreB}
                />
              );
            })}
          </div>

          {/* Metadata */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <RepositoryMetaCard
              name={a.repository.fullName}
              stars={a.repository.stars}
              forks={a.repository.forks}
              maintenance={
                a.repository.maintenanceStatus
              }
              language={a.repository.language}
            />

            <RepositoryMetaCard
              name={b.repository.fullName}
              stars={b.repository.stars}
              forks={b.repository.forks}
              maintenance={
                b.repository.maintenanceStatus
              }
              language={b.repository.language}
            />
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-zinc-600">
            Scores are based on repository signals currently detected
            through GitHub and may change as repository contents,
            workflows, or metadata change.
          </p>
        </section>

        <footer className="border-t border-white/5 py-7 text-center text-xs text-zinc-600">
          RepoDoctor · Open Source · Repository health intelligence
        </footer>
      </div>
    </main>
  );
}

function RepositoryScoreCard({
  label,
  repository,
  score,
  winner,
  tied,
  analysisMode,
  reportHref,
}: {
  label: string;
  repository: string;
  score: number;
  winner: boolean;
  tied: boolean;
  analysisMode: string;
  reportHref: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 ${winner
          ? "border-emerald-400/30 bg-emerald-400/[0.055] shadow-xl shadow-emerald-500/5"
          : "border-white/10 bg-white/[0.025]"
        }`}
    >
      {winner && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      )}

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">
              {label}
            </p>

            <h2 className="mt-2 break-words text-xl font-semibold sm:text-2xl">
              {repository}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {winner && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                Winner
              </span>
            )}

            {tied && (
              <span className="rounded-full border border-zinc-600/30 bg-zinc-500/10 px-3 py-1 text-[11px] text-zinc-300">
                Tie
              </span>
            )}

            {analysisMode ===
              "safe-large-repository" && (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] text-amber-300">
                  Safe scan
                </span>
              )}
          </div>
        </div>

        <div className="mt-7 flex items-end gap-3">
          <span
            className={`text-6xl font-semibold tracking-[-0.05em] sm:text-7xl ${winner
                ? "text-emerald-300"
                : "text-white"
              }`}
          >
            {score}
          </span>

          <span className="pb-2 text-sm text-zinc-600">
            /100
          </span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className={
              winner
                ? "h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                : "h-full rounded-full bg-gradient-to-r from-zinc-600 to-zinc-500"
            }
            style={{
              width: `${Math.min(
                Math.max(score, 0),
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-500">
            Overall health
          </span>

          <Link
            href={reportHref}
            className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Full report →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({
  category,
  scoreA,
  scoreB,
}: {
  category: string;
  scoreA: number;
  scoreB: number;
}) {
  return (
    <div className="grid grid-cols-[1.15fr_1fr_1fr] border-b border-white/5 px-4 py-5 last:border-b-0 sm:px-6">
      <span className="pr-3 text-xs text-zinc-500 sm:text-sm">
        {category}
      </span>

      <CategoryScore
        value={scoreA}
        other={scoreB}
      />

      <CategoryScore
        value={scoreB}
        other={scoreA}
      />
    </div>
  );
}

function CategoryScore({
  value,
  other,
}: {
  value: number;
  other: number;
}) {
  const winner = value > other;

  return (
    <div className="min-w-0 pr-3">
      <span
        className={
          winner
            ? "text-sm font-semibold text-emerald-300"
            : "text-sm font-medium text-zinc-300"
        }
      >
        {value}
        {winner && " ✓"}
      </span>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={
            winner
              ? "h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              : "h-full rounded-full bg-zinc-700"
          }
          style={{
            width: `${Math.min(
              Math.max(value, 0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function RepositoryMetaCard({
  name,
  stars,
  forks,
  maintenance,
  language,
}: {
  name: string;
  stars: number;
  forks: number;
  maintenance: string;
  language: string | null;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
      <p className="break-words font-semibold">
        {name}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetaItem
          label="Stars"
          value={`★ ${stars.toLocaleString()}`}
        />

        <MetaItem
          label="Forks"
          value={forks.toLocaleString()}
        />

        <MetaItem
          label="Maintenance"
          value={maintenance}
        />

        <MetaItem
          label="Language"
          value={language ?? "Not detected"}
        />
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-zinc-300">
        {value}
      </p>
    </div>
  );
}
