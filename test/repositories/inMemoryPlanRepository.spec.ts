import { describe, expect, it } from 'vitest';
import InMemoryPlanRepository from '../../src/repositories/inMemoryPlan';

describe('InMemoryPlanRepository', () => {
  const repo = new InMemoryPlanRepository();

  describe('findById()', () => {
    it('returns plan object', async () => {
      expect(await repo.findById('2024-11-26')).toMatchObject({
        date: '2024-11-26',
        scope: '創世紀 23',
        content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
      });
    });

    it('returns null', async () => {
      expect(await repo.findById('2024-11-32')).toBeNull();
    });
  });
});
