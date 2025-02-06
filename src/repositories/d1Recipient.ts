import { Recipient, RecipientSchema } from '@/readingPlans';

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
    return Promise.resolve([]);
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
}
