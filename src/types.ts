declare global {
  type Usecase<Args, Output> = (args: Args) => Promise<Output | null>;

  type UsecaseConstructor<Repository, Args, Output> = (repo: Repository) => Usecase<Args, Output>;

  interface Repository<T> {
    findById(id: string): Promise<T | null>;
  }
}

export {};
