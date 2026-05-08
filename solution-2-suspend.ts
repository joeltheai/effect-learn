import { Effect } from "effect"

// =============================================================================
// Solution 2: Wrap the body in `Effect.suspend`
// =============================================================================
//
// `Effect.suspend` takes a thunk that returns an Effect, and returns an Effect
// of the same type. Its signature is roughly:
//
//   const suspend: <A, E, R>(effect: () => Effect<A, E, R>) => Effect<A, E, R>
//
// Why does this fix the unification problem?
//
// When TypeScript infers the return type of a function from multiple `return`
// statements, it just unions them - it does NOT try to find a common
// instantiation of a generic type. That's why the bare conditional gives us
// `Effect<User, never> | Effect<never, Error>`.
//
// But when TypeScript infers type *arguments* for a single generic call (like
// `Effect.suspend<A, E, R>(...)`), it DOES perform unification: it looks at the
// expression inside the thunk and finds a single `<A, E, R>` that satisfies
// both branches. The result is a single, clean `Effect<User, Error, never>`.
//
// Trade-off: `Effect.suspend` defers construction of the inner effect until the
// outer effect is actually run. For pure logic this is harmless, but it does
// add one extra layer of indirection at runtime.
//
// This is the approach the Effect docs explicitly recommend in their
// "Unifying Return Type" section.
// =============================================================================

// Define a User type
interface User {
  readonly id: number
  readonly name: string
}

// Notice: NO return type annotation. Inference works correctly here because the
// entire body is a single expression passed to `Effect.suspend`, and TypeScript
// unifies the type arguments across both branches of the ternary.
//
// Hover over `getUser` and you should see:
//   const getUser: (userId: number) => Effect.Effect<User, Error, never>
const getUser = (userId: number) =>
  Effect.suspend(() => {
    const userDatabase: Record<number, User> = {
      1: { id: 1, name: "John Doe" },
      2: { id: 2, name: "Jane Smith" }
    }

    const user = userDatabase[userId]
    // A ternary keeps the body a single expression, which is what `suspend`
    // expects. You could also use an `if/else` and return from each branch -
    // both work because both `return`s are inside the suspend thunk, and the
    // thunk's return type is what gets unified.
    return user
      ? Effect.succeed(user)
      : Effect.fail(new Error("User not found"))
  })

// Hover to confirm:
//   const exampleUserEffect: Effect.Effect<User, Error, never>
const exampleUserEffect = getUser(1)

Effect.runPromise(exampleUserEffect).then(console.log).catch(console.error)
