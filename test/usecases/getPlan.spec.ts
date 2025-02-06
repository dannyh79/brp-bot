import { Plan, PlanSchema, getPlan } from '@/readingPlans';

const stubData = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華, 因為祂是美善的, 祂的慈愛永遠長存!',
  },
  devotional: {
    scope: '出埃及記 第八章',
  },
};

const parsedStubData = PlanSchema.parse(stubData);

class StubRepository implements Repository<Plan> {
  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(date === stubData.date ? parsedStubData : null);
  }

  save() {
    return Promise.resolve();
  }
}

describe('getPlan()', () => {
  const repo = new StubRepository();

  it('returns plan object', async () => {
    expect(await getPlan(repo)({ date: '2025-01-01' })).toMatchObject(parsedStubData);
  });

  it('returns null', async () => {
    expect(await getPlan(repo)({ date: '2024-12-31' })).toBeNull();
  });
});
