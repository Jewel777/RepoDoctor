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
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Ambient compare-specific glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[18%] top-[-180px] h-[480px] w-[480px] rounded-full bg-violet-500/10 blur-[150px]" />
        <div className="absolute right-[12%] top-[-120px] h-[430px] w-[430px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute left-1/2 top-[46%] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/[0.035] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-zinc-300 transition duration-200 hover:text-white"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg">
              🩺
            </div>

            <div>
              <div className="font-semibold tracking-tight">
                RepoDoctor
              </div>

              <div className="text-[10px] text-zinc-500">
                Repository health intelligence
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center text-sm text-zinc-300 transition duration-200 hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white sm:w-auto"
          >
            Analyze
          </Link>
        </header>

        <section className="mx-auto max-w-4xl pb-16 pt-12 sm:pb-20 sm:pt-20">
          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-3 py-2 text-[11px] font-medium text-violet-200 backdrop-blur-xl sm:px-4 sm:text-xs">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Repository comparison
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Compare repository
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">
                health side by side.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl px-1 text-sm leading-7 text-zinc-400 sm:mt-6 sm:text-base">
              Compare documentation, security, testing, automation,
              maintenance, community, and code quality using the same
              RepoDoctor scoring engine.
            </p>
          </div>

          {/* Small capability cards */}
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <CapabilityCard
              label="Health"
              text="Overall repository score and category winners."
            />

            <CapabilityCard
              label="Engineering"
              text="Testing, automation, CI/CD, and code quality."
            />

            <CapabilityCard
              label="Project health"
              text="Documentation, security, community, and maintenance."
            />
          </div>

          {/* Compare form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-violet-500/5 backdrop-blur-2xl sm:p-6"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
              <RepositoryInput
                id="repoA"
                label="Repository A"
                value={repoA}
                placeholder="react/react"
                onChange={setRepoA}
              />

              <div className="hidden items-center justify-center md:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/[0.07] text-xs font-semibold text-violet-200">
                  VS
                </div>
              </div>

              <RepositoryInput
                id="repoB"
                label="Repository B"
                value={repoB}
                placeholder="vercel/next.js"
                onChange={setRepoB}
              />
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-4 h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-200 via-white to-violet-200 font-semibold text-black transition duration-200 hover:scale-[1.005] hover:shadow-lg hover:shadow-violet-500/10"
            >
              Compare repositories
            </button>

            <div className="mt-4 flex flex-col gap-2 px-1 text-center text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <span>Public repositories only</span>
              <span>Powered by RepoDoctor scoring</span>
            </div>
          </form>

          {/* Preview */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                  Preview
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  How comparison works
                </h2>
              </div>

              <span className="self-start rounded-xl border border-violet-400/15 bg-violet-400/[0.05] px-3 py-2 text-xs text-violet-200 sm:self-auto">
                Side-by-side scoring
              </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_1fr]">
              <PreviewScore
                label="Repository A"
                value={82}
                accent="cyan"
              />

              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-6 py-4">
                <span className="text-sm font-medium text-zinc-500">
                  VS
                </span>
              </div>

              <PreviewScore
                label="Repository B"
                value={73}
                accent="violet"
              />
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

function CapabilityCard({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-violet-400/[0.035]">
      <p className="text-xs uppercase tracking-[0.16em] text-violet-300/60">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-300">
        {text}
      </p>
    </div>
  );
}

function RepositoryInput({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 transition duration-200 focus-within:border-cyan-400/30 focus-within:bg-cyan-400/[0.025]">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.15em] text-zinc-600"
      >
        {label}
      </label>

      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-zinc-600"
      />

      <p className="mt-2 text-xs text-zinc-600">
        Example: {placeholder}
      </p>
    </div>
  );
}

function PreviewScore({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "violet";
}) {
  const valueClass =
    accent === "cyan"
      ? "text-cyan-200"
      : "text-violet-200";

  const barClass =
    accent === "cyan"
      ? "from-cyan-400 to-blue-500"
      : "from-violet-400 to-fuchsia-500";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>
        {value}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}