"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function parseRepository(value: string) {
  const cleaned = value
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/+$/, "");

  const [owner, repo] = cleaned.split("/");

  if (!owner || !repo) return null;

  return { owner, repo };
}

export default function ComparePage() {
  const router = useRouter();

  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const first = parseRepository(repoA);
    const second = parseRepository(repoB);

    if (!first || !second) {
      setError("Enter repositories as owner/repository.");
      return;
    }

    setError("");

    router.push(
      `/compare/${encodeURIComponent(first.owner)}/${encodeURIComponent(
        first.repo
      )}/${encodeURIComponent(second.owner)}/${encodeURIComponent(second.repo)}`
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to RepoDoctor
          </Link>

          <Link
            href="/report/Jewel777/RepoDoctor"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Analyze a repository →
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            RepoDoctor Comparison
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Compare two repositories
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Compare GitHub repositories side by side across documentation,
            security, testing, maintenance, automation, community, and code
            quality.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
              Health
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              Compare overall repository health scores.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
              Engineering
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              Compare testing, CI/CD, automation, and code quality.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
              Project Health
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              Compare documentation, security, community, and maintenance.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="repoA"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Repository A
              </label>

              <input
                id="repoA"
                value={repoA}
                onChange={(event) => setRepoA(event.target.value)}
                placeholder="react/react"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Example: react/react
              </p>
            </div>

            <div>
              <label
                htmlFor="repoB"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Repository B
              </label>

              <input
                id="repoB"
                value={repoB}
                onChange={(event) => setRepoB(event.target.value)}
                placeholder="vercel/next.js"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Example: vercel/next.js
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            Compare repositories
          </button>
        </form>
      </div>
    </main>
  );
}
