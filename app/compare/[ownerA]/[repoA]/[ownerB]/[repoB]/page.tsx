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

function Score({
  value,
  other,
}: {
  value: number;
  other: number;
}) {
  const winner = value > other;

  return (
    <span className={winner ? "font-bold text-green-400" : "text-white"}>
      {value}
      {winner && " ✓"}
    </span>
  );
}

function AnalysisModeBadge({
  mode,
}: {
  mode: string;
}) {
  if (mode !== "safe-large-repository") return null;

  return (
    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
      Large repository · Safe scan
    </span>
  );
}

export default async function RepositoryComparisonPage({
  params,
}: PageProps) {
  const { ownerA, repoA, ownerB, repoB } = await params;

  const [a, b] = await Promise.all([
    analyzeRepo(ownerA, repoA),
    analyzeRepo(ownerB, repoB),
  ]);

  const categories = Object.keys(a.scores) as Array<keyof typeof a.scores>;

  const overallWinner =
    a.overall === b.overall
      ? "Tie"
      : a.overall > b.overall
        ? a.repository.fullName
        : b.repository.fullName;

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/compare"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← New comparison
        </Link>

        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Repository Comparison
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {a.repository.fullName}
            <span className="mx-4 text-zinc-600">vs</span>
            {b.repository.fullName}
          </h1>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Repository A</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {a.repository.fullName}
                </h2>
              </div>

              <AnalysisModeBadge mode={a.repository.analysisMode} />
            </div>

            <div className="mt-6 text-6xl font-bold">
              <Score value={a.overall} other={b.overall} />
            </div>

            <p className="mt-2 text-zinc-500">
              Overall health score
            </p>

            <Link
              href={`/report/${encodeURIComponent(
                ownerA
              )}/${encodeURIComponent(repoA)}`}
              className="mt-6 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View full report →
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Repository B</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {b.repository.fullName}
                </h2>
              </div>

              <AnalysisModeBadge mode={b.repository.analysisMode} />
            </div>

            <div className="mt-6 text-6xl font-bold">
              <Score value={b.overall} other={a.overall} />
            </div>

            <p className="mt-2 text-zinc-500">
              Overall health score
            </p>

            <Link
              href={`/report/${encodeURIComponent(
                ownerB
              )}/${encodeURIComponent(repoB)}`}
              className="mt-6 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View full report →
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm text-zinc-500">
            Overall result
          </p>

          <p className="mt-2 text-2xl font-bold">
            {overallWinner === "Tie"
              ? "The repositories are tied."
              : `${overallWinner} wins this comparison.`}
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
          <div className="grid grid-cols-3 bg-zinc-950 px-6 py-4 font-semibold">
            <span>Category</span>
            <span>{a.repository.fullName}</span>
            <span>{b.repository.fullName}</span>
          </div>

          {categories.map((category) => {
            const scoreA = a.scores[category];
            const scoreB = b.scores[category];

            return (
              <div
                key={category}
                className="grid grid-cols-3 border-t border-zinc-800 px-6 py-5"
              >
                <span className="text-zinc-400">
                  {category}
                </span>

                <Score value={scoreA} other={scoreB} />

                <Score value={scoreB} other={scoreA} />
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="font-semibold">
              {a.repository.fullName}
            </h3>

            <p className="mt-3 text-sm text-zinc-400">
              ⭐ {a.repository.stars.toLocaleString()} stars
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Forks: {a.repository.forks.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Maintenance: {a.repository.maintenanceStatus}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="font-semibold">
              {b.repository.fullName}
            </h3>

            <p className="mt-3 text-sm text-zinc-400">
              ⭐ {b.repository.stars.toLocaleString()} stars
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Forks: {b.repository.forks.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Maintenance: {b.repository.maintenanceStatus}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
