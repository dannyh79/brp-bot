import { OldPlan, Plan, PlanSchema, get2024Plan, getPlan } from '@/readingPlans';

const stub2024Plan = {
  date: '2024-11-26',
  scope: '創世紀 23',
  content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
};

class StubOldPlanRepository implements Repository<OldPlan> {
  findById(date: string): Promise<OldPlan | null> {
    return Promise.resolve(date === stub2024Plan.date ? stub2024Plan : null);
  }
}

describe('get2024Plan()', () => {
  const repo = new StubOldPlanRepository();

  it('returns plan object', async () => {
    expect(await get2024Plan(repo)({ date: '2024-11-26' })).toMatchObject(stub2024Plan);
  });

  it('returns null', async () => {
    expect(await get2024Plan(repo)({ date: '2024-11-32' })).toBeNull();
  });
});

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
