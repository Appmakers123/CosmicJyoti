# Contributing to CosmicJyoti

Thank you for considering contributing. Here’s how to get started.

## Code of conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to contribute

### Reporting bugs

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- Include steps to reproduce, environment (OS, Node version), and expected vs actual behavior.

### Suggesting features

- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- Describe the use case and why it fits CosmicJyoti.

### Pull requests

1. **Fork** the repository and clone your fork.
2. **Create a branch:** `git checkout -b fix/your-fix` or `feat/your-feature`.
3. **Install and run:**
   ```bash
   npm install
   npm run build
   ```
4. **Follow existing style:** TypeScript, React hooks, Tailwind. Use the project’s formatting (see [.editorconfig](.editorconfig)).
5. **Test:** Ensure the app runs and your change doesn’t break the build.
6. **Commit:** Clear messages, e.g. `fix: correct horoscope date formatting`.
7. **Push** and open a **Pull Request** using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
8. Link any related issue (e.g. `Fixes #123`).

Maintainers will review and may ask for changes. Once approved, your PR can be merged.

## Development setup

- **Node:** 18+ (see [.nvmrc](.nvmrc): `nvm use` or install the specified version).
- **Env:** Copy `.env.example` to `.env.local` and add at least one AI API key for full features.
- **Docs:** [BUILD_AND_RUN.md](BUILD_AND_RUN.md) has more detail.

## Scope

- **In scope:** Bug fixes, docs, accessibility, performance, i18n (e.g. Hindi), new astrology modules that fit the stack.
- **Out of scope:** Changing the core stack (e.g. swapping React for another framework) without prior discussion in an issue.

## Questions

Open a [GitHub Discussion](https://github.com/Appmakers123/CosmicJyoti/discussions) or an issue with the question label.

Thanks for contributing.
