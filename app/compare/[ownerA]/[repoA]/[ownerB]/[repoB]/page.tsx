
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  GitCompareArrows,
  GitBranch,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Activity,
} from "lucide-react";

function parseRepository(value: string) {
  let input = value.trim();

  if (!input) return null;

  input = input.replace(/\/+$/, "").replace(/\.git$/i, "");

  if (/^https?:\/\//i.test(input)) {
    try {
      const url = new URL(input);
      if (
        !["github.com", "www.github.com"].includes(
          url.hostname.toLowerCase()
        )
      ) {
        return null;
      }
      input = url.pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      return null;
    }
  }

  const parts = input.split("/");

  if (
    parts.length !== 2 ||
    !/^[a-zA-Z0-9-]+$/.test(parts[0]) ||
    !/^[a-zA-Z0-9._-]+$/.test(parts[1]) ||
    parts[1] === "." ||
    parts[1] === ".."
  ) {
    return null;
  }

  return { owner: parts[0], repo: parts[1] };
}

const glass =
  "border border-white/75 bg-white/25 backdrop-blur-[35px] " +
  "shadow-[inset_0_2px_2px_rgba(255,255,255,0.95),0_22px_55px_rgba(69,82,127,0.14)]";

const raised =
  "border border-white/75 bg-white/25 " +
  "shadow-[inset_1px_1px_2px_white,7px_9px_24px_rgba(83,99,142,0.12)]";

export default function ComparePage() {
  const router = useRouter();

  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const first = parseRepository(repoA);
    const second = parseRepository(repoB);

    if (!first || !second) {
      setError(
        "Enter two valid public GitHub repositories, such as facebook/react."
      );
      return;
    }

    if (
      first.owner.toLowerCase() === second.owner.toLowerCase() &&
      first.repo.toLowerCase() === second.repo.toLowerCase()
    ) {
      setError("Choose two different repositories to compare.");
      return;
    }

    setError("");
    setSubmitting(true);

    router.push(
      `/compare/${encodeURIComponent(first.owner)}/${encodeURIComponent(first.repo)}/${encodeURIComponent(second.owner)}/${encodeURIComponent(second.repo)}`
    );
  }

  return (
    <main
      className="rd-results relative min-h-screen overflow-hidden text-slate-800"
      style={{
        background:
          "radial-gradient(ellipse 48% 55% at 0% 17%,rgba(70,225,188,.52),transparent 85%),radial-gradient(ellipse 48% 52% at 100% 10%,rgba(181,147,249,.55),transparent 85%),radial-gradient(ellipse 43% 40% at 55% 90%,rgba(138,192,245,.28),transparent 85%),#eaf0f5",
      }}
    >
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-44 top-32 h-[520px] w-[520px] rounded-full bg-emerald-300/25 blur-[110px]" />
        <div className="absolute -right-48 top-0 h-[600px] w-[600px] rounded-full bg-violet-300/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-7">
        {/* Navigation */}
        <header
          className={`flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-5 py-4 ${glass}`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 text-slate-800 no-underline"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-emerald-200 to-violet-200 text-teal-800 shadow-inner">
              <HeartPulse size={23} />
            </span>

            <span>
              <strong className="block text-base font-extrabold tracking-tight">
                RepoDoctor<span className="text-teal-600">.</span>
              </strong>
              <small className="block text-[11px] text-slate-500">
                Repository health intelligence
              </small>
            </span>
          </Link>

          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 ${raised}`}
          >
            Analyze
            <ArrowUpRight size={16} />
          </Link>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-4xl pb-16 pt-14 sm:pt-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/35 px-4 py-2 text-[11px] font-bold tracking-wider text-teal-800 shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              REPOSITORY COMPARISON
            </span>

            <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-extrabold leading-[1.09] tracking-[-0.055em] text-[#213047] sm:text-6xl">
              Compare repositories.
              <span className="mt-1 block bg-gradient-to-r from-[#009c85] via-[#5095b9] to-[#9065d9] bg-clip-text text-transparent">
                Discover the difference.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Find out which GitHub project has stronger documentation,
              security, testing, automation, and maintenance practices.
              Compare them using the same RepoDoctor scoring engine.
            </p>
          </div>

          {/* Feature indicators */}
          <div className="mt-11 grid gap-4 sm:grid-cols-3">
            <CapabilityCard
              icon={<Activity size={20} />}
              title="Health scores"
              description="Understand overall repository health."
              color="mint"
            />

            <CapabilityCard
              icon={<GitCompareArrows size={20} />}
              title="Side-by-side"
              description="See category winners at a glance."
              color="lavender"
            />

            <CapabilityCard
              icon={<ShieldCheck size={20} />}
              title="Engineering signals"
              description="Identify strengths and gaps."
              color="mint"
            />
          </div>

          {/* Comparison form */}
          <form
            onSubmit={handleSubmit}
            className={`relative mt-7 rounded-[32px] p-5 sm:p-8 ${glass}`}
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-700">
                  Start a comparison
                </p>

                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-800">
                  Which repositories should we compare?
                </h2>
              </div>

              <span className="rounded-full border border-white/70 bg-white/35 px-3 py-1.5 text-xs font-medium text-slate-600">
                No signup needed
              </span>
            </div>

            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <RepositoryInput
                id="repoA"
                label="Repository A"
                value={repoA}
                placeholder="facebook/react"
                onChange={(value) => {
                  setRepoA(value);
                  setError("");
                }}
              />

              <div className="flex justify-center">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-violet-800 ${raised}`}>
                  VS
                </span>
              </div>

              <RepositoryInput
                id="repoB"
                label="Repository B"
                value={repoB}
                placeholder="vercel/next.js"
                onChange={(value) => {
                  setRepoB(value);
                  setError("");
                }}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50/75 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="relative mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-orange-300/60 bg-gradient-to-br from-[#ffb15a] via-[#ff8724] to-[#ff5d13] px-6 font-extrabold text-white shadow-[inset_0_2px_2px_rgba(255,255,255,0.5),0_12px_24px_rgba(255,112,16,0.38),0_23px_45px_rgba(255,114,21,0.25)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            >
              <span>{submitting ? "Opening comparison..." : "Compare repositories"}</span>
              <ArrowRight size={19} />
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-teal-700" />
                Public repositories only
              </span>

              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-violet-600" />
                Powered by RepoDoctor
              </span>
            </div>
          </form>

          {/* Sample preview */}
          <section className={`mt-7 rounded-[30px] p-5 sm:p-7 ${glass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                  Experience preview
                </span>

                <h2 className="mt-2 text-xl font-extrabold text-slate-800">
                  See the difference, instantly.
                </h2>
              </div>

              <span className="rounded-xl border border-violet-200/70 bg-violet-100/50 px-3 py-2 text-xs font-semibold text-violet-800">
                Illustrative scores
              </span>
            </div>

            <div className="mt-6 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <PreviewScore
                label="Example project A"
                value={82}
                color="mint"
              />

              <span className="text-center text-xs font-bold text-slate-500">
                VS
              </span>

              <PreviewScore
                label="Example project B"
                value={73}
                color="lavender"
              />
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              The actual comparison evaluates both repositories and
              displays category scores, winners, metadata, and links to
              detailed health reports.
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:underline"
            >
              Analyze a single repository instead
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/50 py-7 text-center text-xs text-slate-600">
          RepoDoctor · Open-source repository intelligence
        </footer>
      </div>
    </main>
  );
}

function CapabilityCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "mint" | "lavender";
}) {
  return (
    <article className={`rounded-[23px] p-5 ${glass}`}>
      <span
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
          color === "mint"
            ? "bg-emerald-200/65 text-teal-800"
            : "bg-violet-200/65 text-violet-800"
        }`}
      >
        {icon}
      </span>

      <h3 className="text-sm font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        {description}
      </p>
    </article>
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
    <div className="rounded-[22px] border border-white/75 bg-slate-100/30 p-4 shadow-[inset_5px_5px_12px_rgba(89,107,141,0.12),inset_-5px_-5px_12px_rgba(255,255,255,0.8)]">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-600"
      >
        <GitBranch size={15} />
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        required
        className="mt-4 h-11 w-full min-w-0 bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
      />

      <p className="mt-2 text-xs text-slate-500">
        Owner/repository or GitHub URL
      </p>
    </div>
  );
}

function PreviewScore({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "mint" | "lavender";
}) {
  return (
    <div className={`rounded-[22px] p-5 ${raised}`}>
      <span className="text-xs font-semibold text-slate-600">
        {label}
      </span>

      <div className="mt-3 flex items-baseline gap-2">
        <strong
          className={`text-4xl font-extrabold ${
            color === "mint"
              ? "text-teal-700"
              : "text-violet-700"
          }`}
        >
          {value}
        </strong>

        <span className="text-xs text-slate-500">/100</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-300/40 shadow-inner">
        <div
          className={`h-full rounded-full ${
            color === "mint"
              ? "bg-gradient-to-r from-teal-500 to-emerald-300"
              : "bg-gradient-to-r from-violet-500 to-purple-300"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
