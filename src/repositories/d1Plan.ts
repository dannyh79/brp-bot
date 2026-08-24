import { Plan, PlanSchema } from '@/readingPlans';

type Record = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
};

type SubsectionBlockRecord = {
  section: 'praise' | 'repentance' | 'devotional' | 'prayer';
  position: 'before_content' | 'after_content';
  title: string | null;
  scripture_content: string | null;
  scripture_scope: string | null;
  content: string;
  sort_order: number;
};

const scopeDelimiter = ',';

const toParsable = (r: Record, subsectionBlocks: SubsectionBlockRecord[]) => ({
  date: r.date,
  praise: {
    scope: r.praise_scope,
    content: r.praise_content,
  },
  devotional: {
    scope: r.devotional_scope.split(scopeDelimiter),
    link: [],
  },
  subsectionBlocks: subsectionBlocks.map((block) => ({
    section: block.section,
    position: block.position,
    title: block.title || undefined,
    scriptureContent: block.scripture_content || undefined,
    scriptureScope: block.scripture_scope || undefined,
    content: block.content,
    sortOrder: block.sort_order,
  })),
});

export default class D1PlanRepository implements Repository<Plan> {
  constructor(private readonly db: D1Database) {}

  async findById(date: string): Promise<Plan | null> {
    const plan = await this.db
      .prepare('SELECT * FROM plans WHERE date = ?')
      .bind(date)
      .first<Record>();
    if (!plan) {
      return null;
    }

    const blocks = await this.db
      .prepare(
        'SELECT section, position, title, scripture_content, scripture_scope, content, sort_order FROM subsection_blocks WHERE date = ? ORDER BY section, position, sort_order',
      )
      .bind(date)
      .all<SubsectionBlockRecord>();

    return PlanSchema.parse(toParsable(plan, blocks.results));
  }

  async all() {
    return Promise.resolve([]);
  }
  async save() {}
  async destroy() {}
}
