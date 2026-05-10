/**
 * Effect.try — v3 vs v4 (effect-smol / effect@4.x)
 *
 * Old (v3) style that no longer type-checks in v4:
 *
 *   Effect.try(() => JSON.parse(input))
 *
 * Why it fails: In v4, `Effect.try` only accepts an options object
 * `{ try: LazyArg<A>; catch: (error: unknown) => E }`. The unary overload
 * that took a single thunk was removed, so TypeScript reports that
 * `() => any` is not assignable to that object type.
 *
 * Fix: Pass `{ try, catch }` explicitly. Map thrown values to a concrete
 * error type on the effect’s failure channel:
 * - `new Cause.UnknownError(cause)` — general “something threw” wrapper,
 *   similar in spirit to the default used by `Effect.tryPromise` when you
 *   pass only a function.
 * - Or use `Data.TaggedError` (etc.) for domain-specific failures.
 *
 * Note: The in-package JSDoc for `Effect.try` still mentions failing with
 * `UnknownError` when `catch` is omitted, but the current v4 types require
 * `catch` anyway; rely on the `.d.ts` / compiler, not that sentence, until
 * the library aligns docs and types.
 *
 * Linter: `@effect/language-service` warns if `catch` returns plain
 * `unknown` because the error channel stays untyped; returning
 * `Cause.UnknownError` (or another explicit type) satisfies that rule.
 */

import { Cause, Effect } from "effect"

const parse = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input),
    catch: (cause) => new Cause.UnknownError(cause),
  })

const program = parse("invalid json")

// Effect.runPromise(program)
program.pipe(Effect.runPromise)
