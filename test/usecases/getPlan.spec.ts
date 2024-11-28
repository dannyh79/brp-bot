import { Plan, getPlan } from '@/readingPlans';

const stubPlan = {
  date: '2024-11-26',
  scope: '創世紀 23',
  content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
};

class StubRepository implements Repository<Plan> {
  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(date === stubPlan.date ? stubPlan : null);
  }
}

describe('getPlan()', () => {
  const repo = new StubRepository();

  it('returns plan object', async () => {
    expect(await getPlan(repo)({ date: '2024-11-26' })).toMatchObject(stubPlan);
  });

  it('returns null', async () => {
    expect(await getPlan(repo)({ date: '2024-11-32' })).toBeNull();
  });
});
