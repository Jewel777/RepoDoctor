<div align="center">

!\[RepoDoctor — Repository health, made understandable](./repo-doctor-banner.svg)

**A clearer way to understand the engineering health of a GitHub repository.**

Paste a public repository, explore its strengths and gaps, or compare two projects side by side.

[!\[Open App](https://img.shields.io/badge/OPEN\_THE\_APP-RepoDoctor-0E776D?style=for-the-badge\&logo=vercel\&logoColor=white)](https://repo-doctor-hazel.vercel.app)
[!\[Browse Source](https://img.shields.io/badge/VIEW\_SOURCE-GitHub-1D2939?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/Jewel777/RepoDoctor)

<br/>

[**Explore**](#-a-repository-checkup-in-three-steps) · [**See the app**](#-inside-the-app) · [**What it checks**](#-what-repodoctor-looks-for) · [**Compare**](#-two-repositories-one-view) · [**Run locally**](#-run-it-locally)

<br/>

[!\[CI](https://github.com/Jewel777/RepoDoctor/actions/workflows/ci.yml/badge.svg)](https://github.com/Jewel777/RepoDoctor/actions/workflows/ci.yml)
[!\[CodeQL](https://github.com/Jewel777/RepoDoctor/actions/workflows/codeql.yml/badge.svg)](https://github.com/Jewel777/RepoDoctor/actions/workflows/codeql.yml)
[!\[Release](https://img.shields.io/github/v/release/Jewel777/RepoDoctor?label=release\&color=3C8D9A)](https://github.com/Jewel777/RepoDoctor/releases)
[!\[MIT](https://img.shields.io/badge/license-MIT-0E776D)](LICENSE)

</div>

\---

## The problem RepoDoctor solves

A GitHub repository can look polished at first glance and still be missing tests, security guidance, or a reliable build workflow. Finding those gaps often means opening dozens of files and settings by hand.

**RepoDoctor turns that inspection into a readable report.** It uses discoverable repository signals to show what's in place, what's missing, and where to focus next.

<table>
<tr><td width="50%" valign="top">

### Without RepoDoctor

* Dig through configuration files and folders
* Piece together testing and CI/CD practices
* Manually check maintenance and community files
* Compare projects from memory

</td><td width="50%" valign="top">

### With RepoDoctor

* Start from a public repository URL
* See category scores and diagnostic findings
* Review prioritized recommendations and passed checks
* Compare two repositories on the same criteria

</td></tr>
</table>

## 🧭 A repository checkup in three steps

<table>
<tr>
<td width="33%" valign="top"><h3>01 · Paste</h3><p>Enter a public GitHub repository URL. No local checkout is needed for the web-based analysis.</p></td>
<td width="33%" valign="top"><h3>02 · Understand</h3><p>Explore the overall health score, category breakdown, and the evidence behind diagnostic findings.</p></td>
<td width="33%" valign="top"><h3>03 · Improve</h3><p>Use prioritized issues and recommendations to decide what to work on next.</p></td>
</tr>
</table>

<div align="center">

**Try it with a project you know**

[Launch RepoDoctor →](https://repo-doctor-hazel.vercel.app)

</div>

\---

## 📸 Inside the app

### Repository analysis

**A useful overview, without reading the entire repository first.** RepoDoctor summarizes engineering signals across documentation, security, testing, automation, maintenance, community health, and code quality.

!\[RepoDoctor repository analysis homepage](./Home.png)

<sub>Repository entry and analysis experience. Screenshot from the project.</sub>

### Repository comparison

**Not sure which project follows stronger engineering practices?** Put two public repositories side by side and examine category winners and overall results.

!\[RepoDoctor side-by-side comparison](./compare.png)

<sub>Side-by-side repository comparison. Screenshot from the project.</sub>

\---

## 🔍 What RepoDoctor looks for

Rather than presenting one opaque score, RepoDoctor breaks a repository into understandable areas.

|Area|What gets inspected|Why it matters|
|-|-|-|
|**📖 Documentation**|README quality and completeness|Helps newcomers understand and use the project|
|**🛡️ Security**|Security policy, scanning configuration, Dependabot and lockfiles|Reveals visible security maintenance practices|
|**🧪 Testing**|Test files and testing-framework signals|Shows evidence of automated verification|
|**⚙️ Automation**|GitHub Actions and CI/CD workflows|Makes quality checks more repeatable|
|**🔧 Maintenance**|Repository activity, metadata and release history|Provides context about ongoing upkeep|
|**🤝 Community**|Contributing guidance and issue/PR templates|Reduces friction for collaborators|
|**💻 Engineering**|TypeScript, linting, formatting, build scripts, environment templates and Docker|Highlights project tooling and consistency|

**The report also includes:** passed checks, prioritized critical issues, recommended improvements, and repository metadata.

> \[!NOTE]
> RepoDoctor evaluates observable repository signals. A high score does \*\*not\*\* certify that code is secure, bug-free, well-architected, or suitable for production. Missing configuration signals are not proof that a practice never occurs.

\---

## ⚖️ Two repositories. One view.

**Repository Comparison** (introduced in v1.1) applies the same scoring approach to both public projects.

<table>
<tr><td width="50%" valign="top">

**Repository A**

```text
facebook/react
```

</td><td width="50%" valign="top">

**Repository B**

```text
vuejs/core
```

</td></tr>
</table>

Compare:

* **Overall health** — high-level assessment for each repository
* **Category scores** — documentation, security, testing and other dimensions
* **Category winners** — where each repository has stronger detectable signals

A comparison is a starting point for technical evaluation, **not** a definitive ranking of code or architecture.

<div align="center">

[Open the comparison experience →](https://repo-doctor-hazel.vercel.app)

</div>

\---

## 🧩 Designed for real repository workflows

|If you're…|RepoDoctor helps you…|
|-|-|
|**Maintaining an open-source project**|Find missing engineering and community-health basics|
|**Considering a dependency**|Inspect visible quality and maintenance signals before exploring the source|
|**Joining an unfamiliar project**|Understand its tooling, checks and collaboration conventions|
|**Comparing alternatives**|Examine two projects using consistent categories|
|**Learning software engineering**|See concrete examples of practices used by public projects|

### Beyond a quick scan

* **Large-repository safe scanning** helps handle bigger public repositories.
* **Authenticated GitHub API support** can improve the reliability of repository data retrieval.
* **Responsive interface** supports desktop and mobile browsing.
* **Release and maintenance intelligence** adds context beyond static file checks.

\---

## 🛠️ Run it locally

**Requirements:** Node.js 24 and npm (matching the project's CI environment).

```bash
git clone https://github.com/Jewel777/RepoDoctor.git
cd RepoDoctor
npm ci
npm run dev
```

Open **http://localhost:3000** in your browser.

For GitHub API access, consult the repository's configuration and provide any required local environment values. Do not commit tokens or `.env.local` files.

<details>
<summary><strong>Developer commands</strong> — lint, type-check, test and build</summary>

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

The repository's CI workflow runs these quality checks on pull requests to `main`.

</details>

<details>
<summary><strong>Technology</strong> — implementation at a glance</summary>

|Layer|Technology|
|-|-|
|Application|Next.js App Router|
|UI|React, TypeScript|
|Styling|Tailwind CSS|
|Tests|Vitest|
|Quality|ESLint, TypeScript checks|
|Automation|GitHub Actions|
|Security analysis|CodeQL|

</details>

\---

## 🤝 Contribute to RepoDoctor

There are several useful ways to help: report an incorrect finding, suggest a new repository signal, improve documentation, or contribute an implementation change.

1. [Check open issues](https://github.com/Jewel777/RepoDoctor/issues) for existing discussions.
2. Open an issue for bugs or proposed changes.
3. Create a focused branch and submit a pull request.
4. Include the checks you ran and explain any scoring behavior changes.

Please report sensitive security issues privately using the repository's available security-reporting guidance rather than a public issue.

\---

<div align="center">

### Better signals. Better repository decisions.

**Explore a project in minutes, then investigate what matters.**

[**Launch RepoDoctor**](https://repo-doctor-hazel.vercel.app) · [**Report an issue**](https://github.com/Jewel777/RepoDoctor/issues) · [**View releases**](https://github.com/Jewel777/RepoDoctor/releases)

<sub>Open-source software · MIT License</sub>

</div>

