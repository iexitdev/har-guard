# har-guard

TypeScript-first HAR 1.2 validation helpers.

`har-validator` is no longer supported. This package provides a dependency-free validation core for common HAR ingestion paths: structured issues, assertion errors, type guards, and promise wrappers for migration.

## Install

```sh
npm install har-guard
```

## Usage

```ts
import { assertHar, validateHar } from "har-guard";

const result = validateHar(data);

if (!result.valid) {
  console.error(result.issues);
}

assertHar(data);
```

## API

### `validateHar(value)`

Returns `{ valid, issues, value }`.

### `assertHar(value)`

Throws `HarValidationError` when invalid.

### `isHar(value)`

Boolean type guard.

### `validateRequest(value)`, `validateResponse(value)`, `validateEntry(value)`

Validate common HAR fragments.

### Promise migration wrappers

`har(value)`, `request(value)`, `response(value)`, and `entry(value)` return a promise that resolves with the valid value or rejects with `HarValidationError`.

## Migration Position

`har-guard` is an independent alternative or migration helper for projects moving away from `har-validator`. It is not affiliated with the original package maintainers or project.

For release context, see the local [migration guide](./MIGRATION.md), [examples](./EXAMPLES.md), [compatibility notes](./COMPATIBILITY.md), [source metadata](./SOURCE_METADATA.md), and [adoption plan](./ADOPTION.md).

