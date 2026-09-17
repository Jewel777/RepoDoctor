"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [repoUrl, setRepoUrl] = useState("");
    const router = useRouter();

    function handleAnalyze() {
        const value = repoUrl.trim();

        if (!value) {
            alert("Please enter a GitHub repository URL.");
            return;
        }

        try {
            const url = new URL(value);

            if (url.hostname !== "github.com") {
                alert("Please enter a valid GitHub repository URL.");
                return;
            }

            const parts = url.pathname.split("/").filter(Boolean);

            if (parts.length < 2) {
                alert("Please enter a repository URL like https://github.com/owner/repo");
                return;
            }

            const owner = parts[0];
            const repo = parts[1];

            router.push(`/report/${owner}/${repo}`);
        } catch {
            alert("Please enter a valid GitHub repository URL.");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
                <header className="flex items-center justify-between">
                    <div className="text-xl font-bold">
                        🩺 RepoDoctor
                    </div>

                    <a
                        href="https://github.com/Jewel777/RepoDoctor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-900"
                    >
                        GitHub
                    </a>
                </header>

                <section className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400">
                        Open-source repository health scanner
                    </div>

                    <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
                        Diagnose your repository
                        <span className="block text-zinc-500">
                            before your users do.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                        RepoDoctor analyzes your GitHub repository for documentation,
                        security, testing, maintenance, community health, and automation.
                    </p>

                    <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAnalyze();
                                }
                            }}
                            placeholder="https://github.com/owner/repository"
                            className="h-14 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-5 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                        />

                        <button
                            onClick={handleAnalyze}
                            className="h-14 rounded-xl bg-white px-7 font-semibold text-black transition hover:bg-zinc-200"
                        >
                            Analyze Repository
                        </button>
                    </div>

                    <p className="mt-4 text-sm text-zinc-600">
                        No installation required. Public repositories supported.
                    </p>

                    <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
                            <div className="text-2xl">📚</div>
                            <h2 className="mt-4 font-semibold">Documentation</h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Check README quality, contribution guides, licensing, and
                                project documentation.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
                            <div className="text-2xl">🔐</div>
                            <h2 className="mt-4 font-semibold">Security</h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Detect missing security policies and important repository
                                protection practices.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
                            <div className="text-2xl">⚙️</div>
                            <h2 className="mt-4 font-semibold">Automation</h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Inspect CI workflows, testing signals, dependency automation,
                                and maintenance health.
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-zinc-900 py-6 text-center text-sm text-zinc-600">
                    RepoDoctor • Open Source • Built for healthier repositories
                </footer>
            </div>
        </main>
    );
}