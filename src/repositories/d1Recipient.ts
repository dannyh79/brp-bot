import { Recipient, RecipientSchema } from '@/readingPlans';
import { ErrorRecordNotFound } from './errors';

export type Record = {
  id: string;
  /** datetime in string. */
  created_at: string;
  /** datetime in string. */
  deleted_at?: string;
};

const toParsable = (r: Record) => ({
  id: r.id,
  createdAt: new Date(r.created_at),
  deletedAt: r.deleted_at ? new Date(r.deleted_at) : null,
});

export default class D1RecipientRepository implements Repository<Recipient> {
  constructor(private readonly db: D1Database) {}

  async all() {
    const { results } = await this.db.prepare('SELECT * FROM recipients').all<Record>();
    return results.map((r) => RecipientSchema.parse(toParsable(r)));
  }

  async findById(id: string): Promise<Recipient | null> {
    const stmt = this.db.prepare('SELECT * FROM recipients WHERE id = ?');

    const result = await stmt.bind(id).first<Record>();
    if (!result) {
      return null;
    }

    return RecipientSchema.parse(toParsable(result));
  }

  async save(receipient: Recipient) {
    await this.db
      .prepare(
        `
    INSERT INTO recipients (id, created_at, deleted_at)
    VALUES (?1, ?2, ?3)
    `,
      )
      .bind(
        receipient.id,
        receipient.createdAt.toISOString(),
        receipient.deletedAt ? receipient.deletedAt.toISOString() : null,
      )
      .run();
  }

  async destroy({ id }: Recipient) {
    // FIXME: Use ORM instead of raw query
    // Limit to one record only to prevent malformed raw query from wiping out the whole table
    const stmt = this.db.prepare('DELETE FROM recipients WHERE id = ? LIMIT 1');
    const result = await stmt.bind(id).run<Record>();
    if (!result.meta.changed_db) {
      throw ErrorRecordNotFound;
    }
  }
}
