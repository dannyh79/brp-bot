export interface Repository<T> {
  findById(id: string): Promise<T | null>;
}
