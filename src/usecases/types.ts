export type Usecase<Args, Output> = (args: Args) => Promise<Output | null>;

export type UsecaseConstructor<Repository, Args, Output> = (
  repo: Repository,
) => Usecase<Args, Output>;
