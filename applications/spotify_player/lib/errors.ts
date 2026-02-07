import { Data } from "effect";

export class AuthError extends Data.TaggedError("Authfailure")<{}> {}
export class ServiceError extends Data.TaggedError("ServiceFailure")<{}> {}
export class JsonParseError extends Data.TaggedError("JsonParseError")<{}> {}
