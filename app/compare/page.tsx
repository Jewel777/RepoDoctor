
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  GitCompareArrows,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function parseRepo(value: string) {
  let input = value.trim().replace(/\/+$/, "").replace(/\.git$/i, "");

  if (/^https?:\/\//i.test(input)) {
    try {
      const url = new URL(input);
      if (!["github.com", "www.github.com"].includes(url.hostname)) {
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

const glass = {
  background: "rgba(255,255,255,0.25)",
  border: "1px solid rgba(255,255,255,0.85)",
  backdropFilter: "blur(30px) saturate(160%)",
  WebkitBackdropFilter: "blur(30px) saturate(160%)",
  boxShadow:
    "inset 0 2px 2px rgba(255,255,255,.95),0 20px 50px rgba(63,80,124,.12)",
};

const inset = {
  background: "rgba(230,238,247,0.35)",
  border: "1px solid rgba(255,255,255,.78)",
  boxShadow:
    "inset 5px 5px 12px rgba(84,102,140,.13),inset -5px -5px 12px rgba(255,255,255,.85)",
};

export default function ComparePage() {
  const router = useRouter();
  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const a = parseRepo(repoA);
    const b = parseRepo(repoB);

    if (!a || !b) {
      setError("Enter valid GitHub repositories, such as facebook/react.");
      return;
    }

    if (
      a.owner.toLowerCase() === b.owner.toLowerCase() &&
      a.repo.toLowerCase() === b.repo.toLowerCase()
    ) {
      setError("Please choose two different repositories.");
      return;
    }

    setError("");
    setLoading(true);

    router.push(
      `/compare/${encodeURIComponent(a.owner)}/${encodeURIComponent(a.repo)}/${encodeURIComponent(b.owner)}/${encodeURIComponent(b.repo)}`
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden text-[#243249]"
      style={{
        background:
          "radial-gradient(ellipse 46% 55% at 0% 12%,rgba(70,218,181,.46),transparent 90%),radial-gradient(ellipse 46% 55% at 100% 10%,rgba(169,136,240,.45),transparent 90%),radial-gradient(ellipse 35% 30% at 55% 90%,rgba(128,187,238,.24),transparent 90%),#eaf0f5",
      }}
    >
      <div className="relative mx-auto max-w-6xl px-5 py-6">

        {/* Navigation */}
        <header
          className="flex items-center justify-between rounded-[24px] px-5 py-4"
          style={glass}
        >
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-violet-200 text-teal-800">
              <HeartPulse size={22} />
            </span>
            <span>
              <strong className="block text-base font-extrabold text-[#243249]">
                RepoDoctor<span className="text-teal-600">.</span>
              </strong>
              <small className="block text-[11px] text-slate-600">
                Repository health intelligence
              </small>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#243249]"
            style={inset}
          >
            Analyze <ArrowUpRight size={15} />
          </Link>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-4xl pb-16 pt-16 sm:pt-20">

          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/35 px-4 py-2 text-[11px] font-extrabold tracking-[0.12em] text-teal-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              REPOSITORY COMPARISON
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#213047] sm:text-6xl">
              Two repositories.
              <span
                className="block"
                style={{
                  background:
                    "linear-gradient(100deg,#008e78,#408eab,#895acb)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                One clear perspective.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#536881]">
              Compare GitHub projects side by side. Discover
              their strengths, identify gaps, and make
              better engineering decisions.
            </p>
          </div>

          {/* Glass comparison form */}
          <form
            onSubmit={compare}
            className="mt-12 rounded-[30px] p-6 sm:p-8"
            style={glass}
          >
            <div className="mb-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-700">
                Start comparing
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-[#243249]">
                Choose your repositories
              </h2>
            </div>

            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <RepoInput
                label="Repository A"
                placeholder="facebook/react"
                value={repoA}
                onChange={(value) => {
                  setRepoA(value);
                  setError("");
                }}
              />

              <span
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-violet-700"
                style={inset}
              >
                VS
              </span>

              <RepoInput
                label="Repository B"
                placeholder="vercel/next.js"
                value={repoB}
                onChange={(value) => {
                  setRepoB(value);
                  setError("");
                }}
              />
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-orange-300/50 px-6 text-base font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg,#ffb35e,#ff8723 48%,#ff5912)",
                boxShadow:
                  "inset 0 2px 2px rgba(255,255,255,.5),0 10px 22px rgba(255,111,18,.4),0 23px 40px rgba(255,108,16,.25)",
              }}
            >
              {loading ? "Opening comparison..." : "Compare repositories"}
              <ArrowRight size={19} />
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-teal-700" />
                Public GitHub repositories only
              </span>
              <span>No account required</span>
            </div>
          </form>

          {/* Feature cards */}
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <Feature
              title="Analyze"
              description="Health scores across engineering categories."
              icon={<HeartPulse size={21} />}
            />
            <Feature
              title="Compare"
              description="See which project performs better in each area."
              icon={<GitCompareArrows size={21} />}
            />
            <Feature
              title="Improve"
              description="Explore detailed reports and recommendations."
              icon={<Sparkles size={21} />}
            />
          </div>

          {/* Preview */}
          <div className="mt-7 rounded-[28px] p-6 sm:p-8" style={glass}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">
                  Preview
                </p>
                <h2 className="mt-2 text-lg font-extrabold text-[#243249]">
                  See the difference at a glance.
                </h2>
              </div>
              <span className="rounded-xl bg-violet-100/70 px-3 py-2 text-xs font-semibold text-violet-800">
                Example scores
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Preview label="Repository A" score={82} color="#10b89c" />
              <Preview label="Repository B" score={73} color="#9672df" />
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-600">
              Illustrative preview. Actual results use the same
              RepoDoctor scoring engine for both repositories.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:underline"
            >
              Analyze one repository instead
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

function RepoInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[22px] p-5" style={inset}>
      <span className="block text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-4 h-11 w-full min-w-0 bg-transparent text-base font-semibold text-[#243249] outline-none placeholder:font-normal placeholder:text-slate-500"
      />
      <span className="mt-2 block text-xs text-slate-600">
        Owner/repository or GitHub URL
      </span>
    </label>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] p-5" style={glass}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100/70 text-teal-800">
        {icon}
      </span>
      <h3 className="text-sm font-extrabold text-[#243249]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function Preview({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="rounded-[22px] p-5" style={inset}>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <strong className="text-4xl font-extrabold" style={{ color }}>
          {score}
        </strong>
        <span className="text-xs text-slate-600">/100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-300/40">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}
