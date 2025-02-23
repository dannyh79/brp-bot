declare global {
  type Usecase<Args = void, Output = void> = Args extends void
    ? () => Promise<Output | null>
    : (args: Args) => Promise<Output | null>;

  type UsecaseConstructor<Repository, Args = void, Output = void> = (
    repo: Repository,
  ) => Usecase<Args, Output>;

  interface Repository<T> {
    all(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<void>;
    destroy(entity: T): Promise<void>;
  }
}

export {};
