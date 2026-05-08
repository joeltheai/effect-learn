import { Console, Effect , Data} from "effect"


//      ┌─── Effect<number, never, never>
//      ▼
const success = Effect.succeed("3")

// console log just the value of the success effect
const result = Console.log(success)

Effect.runPromise(result)


class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string
}> {}

const failure = Effect.fail(
    new NetworkError({ message: "Operation failed due to network error" })
  )

const result1 = Console.log(failure)
Effect.runPromise(result1)


const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
      ? Effect.fail(new Error("Cannot divide by zero"))
      : Effect.succeed(a / b)