import { Recipient, RecipientSchema } from '@/readingPlans';

type Record = {
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

  async findById(id: string): Promise<Recipient | null> {
    const stmt = this.db.prepare('SELECT * FROM recipients WHERE id = ?');

    const result = await stmt.bind(id).first<Record>();
    if (!result) {
      return null;
    }

    return RecipientSchema.parse(toParsable(result));
  }

  async save() {}
}
