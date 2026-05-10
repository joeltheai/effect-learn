import { Cause, Data, Effect } from "effect"

class MyError extends Data.TaggedError("MyError")<{
}> {}

class MyError2 extends Data.TaggedError("MyError2")<{
}> {}


const main = Effect.gen(function* () {
    yield* Effect.tryPromise({try: () => Promise.resolve("hello"), catch: (error) => new Cause.UnknownError(error)})
    yield* Effect.log("Hello, world!")
    return yield* new MyError()
    return yield* new MyError2()
}).pipe(Effect.catchTag("MyError", (error) => Effect.log("hello")))

main.pipe(Effect.runPromise)


