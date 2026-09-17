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

    return (
        <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <a
                    href="/"
                    className="inline-flex items-center text-sm text-zinc-400 transition hover:text-white"
                >
                    ← Back to RepoDoctor
                </a>

                {/* Main report card */}
                <section
                    className={`mt-8 rounded-3xl border ${status.borderClass} ${status.bgClass} p-6 sm:p-8`}
                >
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">
                                Repository Health Report
                            </p>

                            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                                {owner}/{repo}
                            </h1>

                            <div className="mt-8 flex items-end gap-3">
                                <span className="text-6xl font-bold tracking-tight sm:text-7xl">
                                    {analysis.overall}
                                </span>

                                <span className="pb-2 text-lg text-zinc-500 sm:text-xl">
                                    / 100
                                </span>
                            </div>

                            <p className={`mt-2 text-lg font-semibold ${status.textClass}`}>
                                {status.label}
                            </p>
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

                {/* Category scores */}
                <section className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(analysis.scores).map(([name, score]) => (
                            <ScoreCard key={name} name={name} score={score} />
                        ))}
                    </div>
                </section>

                {/* Findings */}
                <section className="mt-8 grid items-start gap-6 lg:grid-cols-3">
                    <FindingColumn
                        title="Critical Issues"
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

function ScoreCard({
    name,
    score,
}: {
    name: string;
    score: number;
}) {
    const barClass =
        score >= 80
            ? "bg-green-400"
            : score >= 60
                ? "bg-yellow-400"
                : "bg-red-400";

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-zinc-500">{name}</p>

                <span className="text-sm text-zinc-600">/ 100</span>
            </div>

            <p className="mt-2 text-3xl font-bold">{score}</p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                />
            </div>
        </div>
    );
}

function FindingColumn({
    title,
    titleClass,
    borderClass,
    backgroundClass,
    emptyText,
    children,
}: {
    title: string;
    titleClass: string;
    borderClass: string;
    backgroundClass: string;
    emptyText: string;
    children: React.ReactNode;
}) {
    const childCount = Array.isArray(children)
        ? children.length
        : children
            ? 1
            : 0;

    return (
        <div
            className={`rounded-2xl border p-6 ${borderClass} ${backgroundClass}`}
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className={`text-lg font-semibold ${titleClass}`}>{title}</h2>

                <span className="rounded-full border border-zinc-800 bg-black/30 px-2.5 py-1 text-xs text-zinc-500">
                    {childCount}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {childCount > 0 ? (
                    children
                ) : (
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
        <div
            className={`rounded-xl border bg-black/30 p-4 ${borderClass}`}
        >
            <p className={`text-sm font-semibold ${titleClass}`}>
                {title}
            </p>

            <p className="mt-2 text-sm leading-5 text-zinc-400">
                {description}
            </p>
        </div>
    );
}