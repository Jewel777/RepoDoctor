"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const scoreRows = [
  ["Documentation", 96],
  ["Security", 88],
  ["Testing", 92],
  ["Automation", 90],
  ["Maintenance", 84],
] as const;

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
        alert(
          "Please enter a repository URL like https://github.com/owner/repo"
        );
        return;
      }

      router.push(`/report/${parts[0]}/${parts[1]}`);
    } catch {
      alert("Please enter a valid GitHub repository URL.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px] sm:h-[520px] sm:w-[900px]" />

        <div className="absolute left-[8%] top-[35%] h-[240px] w-[240px] rounded-full bg-cyan-500/5 blur-[110px] sm:h-[320px] sm:w-[320px]" />

        <div className="absolute right-[8%] top-[40%] h-[240px] w-[240px] rounded-full bg-violet-500/5 blur-[110px] sm:h-[300px] sm:w-[300px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg">
              🩺
            </div>

            <div className="min-w-0">
              <div className="font-semibold tracking-tight">
                RepoDoctor
              </div>

              <div className="text-[11px] text-zinc-500">
                Repository health intelligence
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href="/compare"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:flex-none"
            >
              Compare
            </Link>

            <a
              href="https://github.com/Jewel777/RepoDoctor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:flex-none"
            >
              GitHub
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto flex max-w-5xl flex-col items-center pb-16 pt-14 text-center sm:pb-20 sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-[11px] font-medium text-emerald-300 backdrop-blur-xl sm:mb-6 sm:px-4 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Open-source repository diagnostics
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Know your repository
            <span className="block bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
              before others judge it.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl px-1 text-sm leading-7 text-zinc-400 sm:mt-6 sm:text-lg">
            RepoDoctor evaluates documentation, testing, security,
            automation, maintenance, and engineering quality from a
            public GitHub repository.
          </p>

          {/* Main action */}
          <div className="mt-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-emerald-500/5 backdrop-blur-2xl sm:mt-10">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-white/10 bg-black/40 px-4">
                <span className="mr-3 shrink-0 text-zinc-600">
                  ⌘
                </span>

                <input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAnalyze();
                    }
                  }}
                  placeholder="https://github.com/owner/repository"
                  className="h-14 min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <button
                onClick={handleAnalyze}
                className="h-14 w-full rounded-2xl bg-white px-7 font-semibold text-black transition hover:bg-zinc-200 md:w-auto"
              >
                Run diagnosis
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2 px-2 pb-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <span className="text-xs text-zinc-500">
                Public repositories only
              </span>

              <Link
                href="/compare"
                className="text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                Compare two repositories →
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div className="mt-12 grid w-full gap-4 sm:mt-16 lg:grid-cols-[0.9fr_1.4fr] lg:gap-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600 sm:text-xs">
                    Health score
                  </p>

                  <h2 className="mt-2 break-all text-base font-semibold sm:text-lg">
                    owner/repository
                  </h2>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-300 sm:text-xs">
                  Healthy
                </span>
              </div>

              <div className="mt-7 flex items-end gap-3 sm:mt-8">
                <span className="text-6xl font-semibold tracking-tight sm:text-7xl">
                  92
                </span>

                <span className="mb-2 text-sm text-zinc-600">
                  / 100
                </span>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Strong engineering signals with a few opportunities
                to improve maintenance and project hygiene.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600 sm:text-xs">
                    Diagnostic profile
                  </p>

                  <h2 className="mt-2 text-base font-semibold sm:text-lg">
                    Repository intelligence
                  </h2>
                </div>

                <div className="shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] text-zinc-500 sm:text-xs">
                  Live preview
                </div>
              </div>

              <div className="mt-6 space-y-5 sm:mt-7">
                {scoreRows.map(([label, score]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="text-zinc-400">
                        {label}
                      </span>

                      <span className="font-medium text-zinc-200">
                        {score}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500/90 to-cyan-400/90"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-4 grid w-full gap-3 sm:mt-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                Detect
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                Missing tests, weak docs, security gaps, CI issues.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                Score
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                Weighted health scores across key engineering categories.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                Improve
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                Actionable recommendations instead of generic checklists.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-7 text-center text-xs text-zinc-600">
          RepoDoctor · Open Source · Repository health intelligence
        </footer>
      </div>
    </main>
  );
}