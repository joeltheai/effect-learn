import { Effect } from "effect"

// =============================================================================
// Solution 1: Explicit return type annotation
// =============================================================================
//
// The simplest fix for the "unifying return type" problem is to tell TypeScript
// what the return type should be by annotating it explicitly.
//
// Without the annotation, TypeScript infers the return type by taking the union
// of every `return` statement's type:
//
//   Effect.Effect<User, never, never> | Effect.Effect<never, Error, never>
//
// That's "technically correct" but practically unusable, because Effect's
// combinators (map, flatMap, runPromise, etc.) expect a single Effect, not a
// union of two different generic instantiations.
//
// When we annotate the return type as `Effect.Effect<User, Error>`, TypeScript
// switches from "infer the type" mode into "check each return statement against
// this type" mode. Both `Effect.succeed(user)` (which is Effect<User, never>)
// and `Effect.fail(...)` (which is Effect<never, Error>) are assignable to
// `Effect<User, Error>`, because `never` is the bottom type and is assignable
// to anything (including `User` and `Error`).
//
// This is the approach the official Effect docs use in their `getUser` example.
// =============================================================================

// Define a User type
interface User {
  readonly id: number
  readonly name: string
}

// A mocked function to simulate fetching a user from a database.
//
// The `: Effect.Effect<User, Error>` annotation is what makes this type-check
// cleanly. Remove it and hover the resulting `getUser` to see the ugly union.
const getUser = (userId: number): Effect.Effect<User, Error> => {
  const userDatabase: Record<number, User> = {
    1: { id: 1, name: "John Doe" },
    2: { id: 2, name: "Jane Smith" }
  }

  const user = userDatabase[userId]
  if (user) {
    // Effect.succeed(user) has type Effect<User, never, never>.
    // `never` in the error slot widens to `Error` because of the annotation.
    return Effect.succeed(user)
  } else {
    // Effect.fail(...) has type Effect<never, Error, never>.
    // `never` in the success slot widens to `User` because of the annotation.
    return Effect.fail(new Error("User not found"))
  }
}

// Hover over `exampleUserEffect` to confirm the unified type:
//   const exampleUserEffect: Effect.Effect<User, Error, never>
const exampleUserEffect = getUser(1)

// Run the effect to see the result.
Effect.runPromise(exampleUserEffect).then(console.log).catch(console.error)
