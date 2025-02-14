declare global {
  type Usecase<Args, Output> = (args: Args) => Promise<Output | null>;

  type UsecaseConstructor<Repository, Args, Output> = (repo: Repository) => Usecase<Args, Output>;

  interface Repository<T> {
    all(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<void>;
    destroy(entity: T): Promise<void>;
  }
}

export {};
