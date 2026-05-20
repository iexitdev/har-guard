# Compatibility Notes

`har-guard` is an independent migration package for projects leaving `har-validator`; it is not affiliated with the original package maintainers or project.

| Area | Notes |
| --- | --- |
| Preserved migration surface | HAR, request, response, and entry validation entry points plus promise-shaped wrappers. |
| Improvements | Dependency-free validators, TypeScript type guards, assertion helpers, and structured issue paths. |
| Intentional difference | Validation is focused on practical HAR 1.2 shape checks instead of bundling old JSON schema dependencies. |
