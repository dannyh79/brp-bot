import { Plan, PlanSchema } from '@/readingPlans';

type Record = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
};

const toParsable = (r: Record) => ({
  date: r.date,
  praise: {
    scope: r.praise_scope,
    content: r.praise_content,
  },
  devotional: {
    scope: r.devotional_scope,
  },
});

export default class D1PlanRepository implements Repository<Plan> {
  constructor(private readonly db: D1Database) {}

  async findById(date: string): Promise<Plan | null> {
    const stmt = this.db.prepare('SELECT * FROM plans WHERE date = ?');

    const result = await stmt.bind(date).first<Record>();
    if (!result) {
      return null;
    }

    return PlanSchema.parse(toParsable(result));
  }

  async save() {}
}
