
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  GitCompareArrows,
  GitBranch as GithubIcon,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const categories = [
  { name: "Documentation", score: 96, color: "mint" },
  { name: "Security", score: 88, color: "lavender" },
  { name: "Testing", score: 92, color: "mint" },
  { name: "Automation", score: 90, color: "lavender" },
  { name: "Maintenance", score: 84, color: "mint" },
] as const;

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const url = new URL(repoUrl.trim());
      const parts = url.pathname.split("/").filter(Boolean);

      if (
        url.protocol !== "https:" ||
        !["github.com", "www.github.com"].includes(
          url.hostname.toLowerCase()
        ) ||
        parts.length !== 2
      ) {
        throw new Error("Invalid GitHub URL");
      }

      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/i, "");

      if (!owner || !repo) {
        throw new Error("Missing repository");
      }

      setError("");

      router.push(
        `/report/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );
    } catch {
      setError(
        "Enter a valid GitHub URL, such as https://github.com/facebook/react"
      );
    }
  }

  return (
    <main className="rd-shell">
      {/* Ambient lighting */}
      <div className="rd-light rd-light-mint" aria-hidden="true" />
      <div className="rd-light rd-light-lilac" aria-hidden="true" />
      <div className="rd-light rd-light-blue" aria-hidden="true" />
      <div className="rd-noise" aria-hidden="true" />

      <div className="rd-wrap">
        {/* Navigation */}
        <header className="rd-nav rd-glass">
          <Link href="/" className="rd-brand">
            <span className="rd-logo">
              <HeartPulse size={22} strokeWidth={2.3} />
            </span>

            <span>
              <strong>
                RepoDoctor<span className="rd-brand-dot">.</span>
              </strong>
              <small>Repository health intelligence</small>
            </span>
          </Link>

          <nav className="rd-nav-links">
            <Link href="/compare">
              <GitCompareArrows size={16} />
              Compare
            </Link>

            <a
              href="https://github.com/Jewel777/RepoDoctor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon size={17} />
              GitHub
              <ArrowUpRight size={13} />
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="rd-hero">
          <div className="rd-intro">
            <span className="rd-eyebrow">
              <span className="rd-live-dot" />
              INTELLIGENT REPOSITORY DIAGNOSTICS
            </span>

            <h1>
              Great code deserves a <em>healthy home.</em>
            </h1>

            <p className="rd-lead">
              Understand your repository&apos;s documentation,
              security, testing, and maintenance through
              clear health scores and actionable insights.
            </p>

            {/* Repository input */}
            <form
              onSubmit={handleAnalyze}
              className="rd-search rd-glass"
            >
              <div className="rd-search-label">
                <GithubIcon size={18} />
                <span>GitHub repository URL</span>
              </div>

              <div className="rd-search-line">
                <input
                  type="url"
                  aria-label="GitHub repository URL"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(event) => {
                    setRepoUrl(event.target.value);
                    setError("");
                  }}
                  required
                />

                <button type="submit">
                  Analyze repo
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </form>

            {error ? (
              <p className="rd-error" role="alert">
                {error}
              </p>
            ) : (
              <div className="rd-under-input">
                <ShieldCheck size={15} />
                Public repositories only
                <span className="rd-separator">•</span>
                No signup required
              </div>
            )}

            <Link className="rd-text-link" href="/compare">
              Compare two repositories
              <ChevronRight size={17} />
            </Link>
          </div>

          {/* Floating glass dashboard */}
          <div className="rd-visual">
            <div
              className="rd-orbit rd-orbit-one"
              aria-hidden="true"
            />
            <div
              className="rd-orbit rd-orbit-two"
              aria-hidden="true"
            />

            <div className="rd-floating rd-floating-top rd-glass">
              <span className="rd-floating-icon">
                <ShieldCheck size={17} />
              </span>

              <span>
                <strong>Security intelligence</strong>
                <small>Understand security signals</small>
              </span>

              <Check size={16} className="rd-green" />
            </div>

            <div className="rd-dashboard rd-glass">
              <div className="rd-dashboard-head">
                <div>
                  <span className="rd-kicker">
                    REPOSITORY OVERVIEW
                  </span>
                  <h2>Health intelligence</h2>
                </div>

                <span className="rd-preview">
                  Sample preview
                </span>
              </div>

              <div className="rd-dashboard-main">
                <div className="rd-score-circle">
                  <div>
                    <strong>92</strong>
                    <span>/ 100</span>
                  </div>
                </div>

                <div className="rd-score-desc">
                  <span className="rd-healthy">
                    <span />
                    Healthy
                  </span>

                  <h3>Looking good.</h3>

                  <p>
                    Strong engineering signals with
                    opportunities to improve.
                  </p>
                </div>
              </div>

              <div className="rd-bars">
                {categories.map((category) => (
                  <div
                    className="rd-bar-row"
                    key={category.name}
                  >
                    <div>
                      <span>{category.name}</span>
                      <strong>{category.score}</strong>
                    </div>

                    <div className="rd-track">
                      <span
                        className={`rd-fill ${
                          category.color === "mint"
                            ? "mint"
                            : "purple"
                        }`}
                        style={{
                          width: `${category.score}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rd-dashboard-bottom">
                <span>
                  <Activity size={16} />
                  Engineering insights
                </span>

                <span>
                  Actionable results
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>

            <div className="rd-floating rd-floating-bottom rd-glass">
              <span className="rd-floating-icon lilac">
                <Sparkles size={17} />
              </span>

              <span>
                <strong>Actionable recommendations</strong>
                <small>Know what to improve next</small>
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="rd-bottom">
          <div className="rd-section-caption">
            <span>REPOSITORY INTELLIGENCE, SIMPLIFIED</span>

            <h2>
              Everything you need to know.
              Nothing you don&apos;t.
            </h2>
          </div>

          <div className="rd-feature-grid">
            <article className="rd-feature rd-glass">
              <span className="rd-feature-icon mint">
                <Activity size={21} />
              </span>

              <span className="rd-feature-number">
                01 / ANALYZE
              </span>

              <h3>Understand your repository.</h3>

              <p>
                Discover documentation, security, testing,
                and engineering health indicators in one
                structured assessment.
              </p>
            </article>

            <article className="rd-feature rd-glass">
              <span className="rd-feature-icon lavender">
                <GitCompareArrows size={21} />
              </span>

              <span className="rd-feature-number">
                02 / COMPARE
              </span>

              <h3>Compare with confidence.</h3>

              <p>
                Evaluate two public GitHub repositories
                using a consistent health scoring approach.
              </p>

              <Link href="/compare" className="rd-text-link">
                Open comparison
                <ArrowRight size={16} />
              </Link>
            </article>

            <article className="rd-feature rd-glass">
              <span className="rd-feature-icon mint">
                <Sparkles size={21} />
              </span>

              <span className="rd-feature-number">
                03 / IMPROVE
              </span>

              <h3>Turn insight into action.</h3>

              <p>
                Identify gaps, understand passed checks,
                and follow prioritized recommendations to
                improve project quality.
              </p>
            </article>
          </div>
        </section>

        {/* Footer */}
        <footer className="rd-footer">
          <span>
            RepoDoctor · Open-source repository intelligence
          </span>

          <a
            href="https://github.com/Jewel777/RepoDoctor"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source
            <ArrowUpRight size={14} />
          </a>
        </footer>
      </div>
    </main>
  );
}
