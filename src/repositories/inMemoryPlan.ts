import { Plan, PlanSchema } from '@/readingPlans';

type Data = {
  date: string;
  praise: {
    scope: string;
    content: string;
  };
  devotional: {
    scope: string;
  };
};

export default class InMemoryPlanRepository implements Repository<Plan> {
  private db: Record<string, Data>;

  constructor(db = data) {
    this.db = db;
  }

  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(this.db[date] ? PlanSchema.parse(this.db[date]) : null);
  }
}

const data: Record<string, Data> = {
  '2025-01-01': {
    date: '2025-01-01',
    praise: {
      scope: '歷代志上 16:34 CCB',
      content: '你們要稱謝耶和華, 因為祂是美善的, 祂的慈愛永遠長存!',
    },
    devotional: {
      scope: '出埃及記 第八章',
    },
  },
};
