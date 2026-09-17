# 🩺 RepoDoctor

> Diagnose your repository before your users do.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20RepoDoctor-000000?style=for-the-badge&logo=vercel)](https://repo-doctor-hazel.vercel.app)
[![CI](https://github.com/Jewel777/RepoDoctor/actions/workflows/ci.yml/badge.svg)](https://github.com/Jewel777/RepoDoctor/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Jewel777/RepoDoctor/actions/workflows/codeql.yml/badge.svg)](https://github.com/Jewel777/RepoDoctor/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**RepoDoctor is an open-source GitHub repository health scanner that turns common repository-quality signals into an understandable score and an actionable report.**

Paste a public GitHub repository URL and RepoDoctor analyzes documentation, security, testing, community readiness, maintenance, automation, and engineering quality.

## ✨ Features

RepoDoctor currently provides:

- an overall repository health score;
- repository metadata and maintenance intelligence;
- README completeness and quality analysis;
- automated test-file and framework detection;
- GitHub Actions / CI intelligence;
- security-policy, Dependabot, lockfile, and security-scanning checks;
- community-health checks such as contributing guidelines and templates;
- package-manager and project-engineering signals;
- categorized critical issues, recommendations, and passed checks;
- direct analysis of public GitHub repositories without requiring repository installation.

## 🖥️ Preview

![RepoDoctor Preview](./repodoctor-preview.png)

## 🌐 Live Demo

Try the deployed application:

**https://repo-doctor-hazel.vercel.app**

Example repository:

```text
https://github.com/Jewel777/RepoDoctor
```

RepoDoctor converts the repository URL into a report route and retrieves public repository information from GitHub.

## 🚀 Installation

Requirements:

- Node.js 24 or a compatible current Node.js release
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/Jewel777/RepoDoctor.git
cd RepoDoctor
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 📖 Usage

On the homepage, enter a public GitHub repository URL:

```text
https://github.com/owner/repository
```

RepoDoctor opens a report such as:

```text
/report/owner/repository
```

The report presents the overall health score, category scores, repository metadata, README quality, testing intelligence, CI/CD signals, security checks, engineering-quality indicators, and prioritized findings.

## 🧪 Development Checks

Run the complete local quality pipeline before submitting changes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Tests use Vitest.

## 🧠 How the Analysis Works

RepoDoctor retrieves public GitHub repository metadata and selected repository files through GitHub's API. It uses deterministic checks and weighted scoring rather than claiming to replace a full security audit, code review, or production-quality assessment.

The goal is to quickly surface common repository-maintenance gaps and give maintainers a practical starting point for improvement.

## 🔐 Security

Please do not report security vulnerabilities through a public issue. See [SECURITY.md](SECURITY.md) for reporting guidance.

RepoDoctor currently analyzes public repositories. Never place GitHub tokens, passwords, private keys, or other secrets into issues or example URLs.

## 🤝 Contributing

Contributions are welcome.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request. Bug reports and feature proposals can be opened using the structured GitHub issue forms.

## 🗺️ Roadmap

Potential future improvements include deeper language-aware analysis, richer dependency intelligence, repository comparisons, historical health trends, shareable reports, and additional CI/security integrations.

## ⚠️ Scope

A RepoDoctor score is a repository-health indicator, not a guarantee that software is secure, correct, maintained, or production-ready. Results should be interpreted alongside code review, testing, dependency scanning, and project-specific engineering requirements.

## 📄 License

RepoDoctor is released under the [MIT License](LICENSE).
