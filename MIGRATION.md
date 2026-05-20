# Migration Guide

`har-guard` is an independent alternative or migration helper for projects moving away from `har-validator`. It is not affiliated with the original package maintainers or project.

## First Command

```sh
npm install har-guard
```

## Migration Target

- Source package: `har-validator`
- Replacement package: `har-guard`
- Source signal: npm deprecation notice says the library is no longer supported
- Migration direction: Dependency-free TypeScript HAR 1.2 validators and assertion wrappers.

## Compatibility Posture

- Preserved: HAR, request, response, and entry validation entry points plus promise-shaped wrappers.
- Improved: Dependency-free validators, TypeScript type guards, assertion helpers, and structured issue paths.
- Intentional difference: Validation is focused on practical HAR 1.2 shape checks instead of bundling old JSON schema dependencies.

## Review Checklist

- Replace the old dependency at one migration boundary first.
- Run the package or application test suite after the swap.
- Keep attribution accurate: this package is independent and is not an official successor to `har-validator`.
