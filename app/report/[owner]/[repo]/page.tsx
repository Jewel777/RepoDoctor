import { analyzeRepo } from "@/lib/github/analyzeRepo";

type Props = {
    params: Promise<{
        owner: string;
        repo: string;
    }>;
};

export default async function ReportPage({ params }: Props) {
    const { owner, repo } = await params;

    const analysis = await analyzeRepo(owner, repo);

    return (
        <main className="min-h-screen bg-black px-6 py-10 text-white">
            <div className="mx-auto max-w-5xl">
                <a href="/" className="text-sm text-zinc-400 hover:text-white">
                    ← Back to RepoDoctor
                </a>

                <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
                    <p className="text-sm text-zinc-500">Repository Health Report</p>

                    <h1 className="mt-2 text-4xl font-bold">
                        {owner}/{repo}
                    </h1>

                    <div className="mt-10 flex items-end gap-3">
                        <span className="text-7xl font-bold">{analysis.overall}</span>
                        <span className="pb-2 text-xl text-zinc-500">/ 100</span>
                    </div>

                    <p
                        className={`mt-2 text-lg font-semibold ${analysis.overall >= 80
                                ? "text-green-400"
                                : analysis.overall >= 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                            }`}
                    >
                        {analysis.overall >= 80
                            ? "Healthy"
                            : analysis.overall >= 60
                                ? "Needs Improvement"
                                : "At Risk"}
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(analysis.scores).map(([name, score]) => (
                        <div
                            key={name}
                            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                        >
                            <p className="text-sm text-zinc-500">{name}</p>
                            <p className="mt-2 text-3xl font-bold">{score}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
                        <h2 className="text-lg font-semibold text-red-400">
                            Critical Issues
                        </h2>

                        <div className="mt-4 space-y-3">
                            {analysis.issues.length > 0 ? (
                                analysis.issues.map((issue) => (
                                    <div
                                        key={issue.title}
                                        className="rounded-xl border border-red-900/40 bg-black/30 p-4"
                                    >
                                        <p className="text-sm font-semibold text-red-300">
                                            ⚠ {issue.title}
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                                            {issue.description}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    No critical issues detected.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-yellow-900/50 bg-yellow-950/20 p-6">
                        <h2 className="text-lg font-semibold text-yellow-400">
                            Recommendations
                        </h2>

                        <div className="mt-4 space-y-3">
                            {analysis.recommendations.length > 0 ? (
                                analysis.recommendations.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-yellow-900/40 bg-black/30 p-4"
                                    >
                                        <p className="text-sm font-semibold text-yellow-300">
                                            • {item.title}
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                                            {item.description}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    No recommendations right now.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-green-900/50 bg-green-950/20 p-6">
                        <h2 className="text-lg font-semibold text-green-400">
                            Passed Checks
                        </h2>

                        <div className="mt-4 space-y-3">
                            {analysis.passed.length > 0 ? (
                                analysis.passed.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-green-900/40 bg-black/30 p-4"
                                    >
                                        <p className="text-sm font-semibold text-green-300">
                                            ✓ {item.title}
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                                            {item.description}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    No checks passed yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}