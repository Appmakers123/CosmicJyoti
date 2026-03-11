# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- (Add new changes here before a release.)

## [1.2.9] - 2025-03-11

### Added

- Groq API support for horoscope, chat, transits, and daily blog generation.
- Voice input (speech-to-text) in Astro Rishi chat (Web Speech API).
- MIT License and COPYRIGHT notice; repository metadata for public GitHub.
- JSON sanitization in daily blog script to handle bad control characters from LLM responses.
- Image generation with Gemini when key is set (default on; opt-out via `ENABLE_ARTICLE_IMAGES=0` or `--no-images`).
- Cache-busting and date sorting for AI Articles so latest blogs appear first.

### Changed

- Blog generation tries Groq first, then Perplexity, then Gemini.
- README, CONTRIBUTING, CODE_OF_CONDUCT, issue/PR templates, Dependabot, .editorconfig, .nvmrc for a polished public repo.

### Fixed

- TypeScript errors for Web Speech API (speech.d.ts).
- Latest blogs not showing on Articles page (fetch cache and sort order).

---

[Unreleased]: https://github.com/Appmakers123/CosmicJyoti/compare/v1.2.9...HEAD
[1.2.9]: https://github.com/Appmakers123/CosmicJyoti/releases/tag/v1.2.9
