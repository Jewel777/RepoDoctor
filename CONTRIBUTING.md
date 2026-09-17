# Contributing to RepoDoctor

Thanks for your interest in improving RepoDoctor.

## Development setup

Requirements:

- Node.js 24 or a compatible current Node.js release
- npm
- Git

Clone the repository and install dependencies:

```bash
git clone https://github.com/Jewel777/RepoDoctor.git
cd RepoDoctor
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Branches and commits

Create a focused branch for your change and keep commits understandable. Prefer descriptive commit messages such as:

```text
Improve GitHub Actions detection
Add repository security checks
Fix report score rendering
```

## Pull requests

A pull request should explain:

- what changed;
- why the change is useful;
- how it was tested;
- whether scoring behavior changed;
- screenshots for visible UI changes when appropriate.

Avoid combining unrelated changes in one pull request.

## Analyzer changes

Changes to repository-health scoring should be explainable and deterministic. New checks should avoid penalizing repositories for technology-specific files that are not relevant to their stack.

## Reporting bugs

Use the repository's bug-report issue form and include a public repository URL that reproduces the problem when possible.

By contributing, you agree that your contributions will be licensed under the project's MIT License.
