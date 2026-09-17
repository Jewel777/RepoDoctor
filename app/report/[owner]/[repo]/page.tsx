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
                    <p className="text-sm text-zinc-500">
                        Repository Health Report
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">
                        {owner}/{repo}
                    </h1>

                    <div className="mt-10 flex items-end gap-3">
                        <span className="text-7xl font-bold">
                            {analysis.overall}
                        </span>

                        <span className="pb-2 text-xl text-zinc-500">
                            / 100
                        </span>
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

                            <p className="mt-2 text-3xl font-bold">
                                {score}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}