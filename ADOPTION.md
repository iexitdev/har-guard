# Adoption Plan

Post-publish discovery plan for `har-guard`.

This package is an independent alternative or migration helper for `har-validator`; do not imply affiliation with the original project.

## First Search

[Search GitHub package.json dependencies for har-validator](https://github.com/search?q=%22har-validator%22%20path%3Apackage.json&type=code)

## Useful Proof Point

Dependency-free TypeScript HAR 1.2 validators and assertion wrappers.

## Pull Request Copy

```md
This removes `har-validator`, which is deprecated, unsupported, or on a stale release line, and replaces the affected call site with `har-guard`.

`har-guard` is an independent TypeScript migration package with zero runtime dependencies. It is not affiliated with the original project.

Validation:
- [ ] npm install
- [ ] npm test
```
