# Examples

`har-guard` is an independent package. It is not affiliated with `har-validator` or its maintainers.

## `har-validator` to `har-guard`

```ts
import { assertHar, validateHar } from "har-guard";

const result = validateHar(input);
if (!result.ok) console.error(result.issues);
assertHar(input);
```
