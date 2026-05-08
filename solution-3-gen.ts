import { Effect } from "effect"

// =============================================================================
// Solution 3: Use `Effect.gen` (the idiomatic Effect approach)
// =============================================================================
//
// `Effect.gen` lets you write Effect code in a style that looks a lot like
// async/await. You hand it a generator function, and inside that function you
// `yield*` other effects to "extract" their success values, or use them to
// short-circuit with errors.
//
// Why does this avoid the unification problem?
//
// Inside the generator, you don't return raw `Effect<User, never>` and
// `Effect<never, Error>` values from different branches. Instead, you `yield*`
// them, which extracts their success types and accumulates their error and
// requirement types into a single tracked Effect.
//
// `Effect.gen`'s type machinery walks every `yield*` and combines the error /
// requirements channels. The function then returns a plain success value, and
// the resulting Effect is `Effect<TheReturnedValue, AllAccumulatedErrors,
// AllAccumulatedRequirements>` - a single, unified Effect type.
//
// This is the most common idiom you'll see in real Effect codebases, because
// it scales naturally to many sequential / dependent effects without nested
// `pipe` / `flatMap` calls.
// =============================================================================

// Define a User type
interface User {
  readonly id: number
  readonly name: string
}

// Notice: NO return type annotation. `Effect.gen` infers everything correctly.
//
// Hover over `getUser` and you should see something like:
//   const getUser: (userId: number) => Effect.Effect<User, Error, never>
const getUser = (userId: number) =>
  Effect.gen(function* () {
    const userDatabase: Record<number, User> = {
      1: { id: 1, name: "John Doe" },
      2: { id: 2, name: "Jane Smith" }
    }

    const user = userDatabase[userId]

    if (!user) {
      // `yield* Effect.fail(...)` short-circuits the generator with the error.
      // The error type `Error` gets folded into the resulting Effect's E channel.
      return yield* Effect.fail(new Error("User not found"))
    }

    // We can return a plain value here. `Effect.gen` lifts it into
    // `Effect.succeed(user)` automatically as the final success value.
    return user
  })

// Hover to confirm:
//   const exampleUserEffect: Effect.Effect<User, Error, never>
const exampleUserEffect = getUser(1)

Effect.runPromise(exampleUserEffect).then(console.log).catch(console.error)
