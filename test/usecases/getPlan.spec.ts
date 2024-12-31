import { OldPlan, get2024Plan } from '@/readingPlans';

const stub2024Plan = {
  date: '2024-11-26',
  scope: '創世紀 23',
  content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
};

class StubRepository implements Repository<OldPlan> {
  findById(date: string): Promise<OldPlan | null> {
    return Promise.resolve(date === stub2024Plan.date ? stub2024Plan : null);
  }
}

describe('get2024Plan()', () => {
  const repo = new StubRepository();

  it('returns plan object', async () => {
    expect(await get2024Plan(repo)({ date: '2024-11-26' })).toMatchObject(stub2024Plan);
  });

  it('returns null', async () => {
    expect(await get2024Plan(repo)({ date: '2024-11-32' })).toBeNull();
  });
});
