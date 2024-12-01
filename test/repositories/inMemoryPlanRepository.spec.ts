import InMemoryPlanRepository from '@/repositories/inMemoryPlan';

describe('InMemoryPlanRepository', () => {
  const db = {
    '2024-11-26': {
      date: '2024-11-26',
      scope: '創世紀 23',
      content: [
        '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?',
        '2. 亞伯拉罕的品格有什麼值得你學習的地方?',
      ],
    },
  };

  const repo = new InMemoryPlanRepository(db);

  describe('findById()', () => {
    it('returns plan object', async () => {
      expect(await repo.findById('2024-11-26')).toMatchObject({
        date: '2024-11-26',
        scope: '創世紀 23',
        content: [
          '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?',
          '2. 亞伯拉罕的品格有什麼值得你學習的地方?',
        ],
      });
    });

    it('returns null', async () => {
      expect(await repo.findById('2024-11-32')).toBeNull();
    });
  });
});
