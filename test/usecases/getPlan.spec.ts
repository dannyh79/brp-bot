import { describe, expect, it } from 'vitest';
import getPlan from '../../src/usecases/getPlan';

describe('getPlan()', () => {
  it('returns plan object', () => {
    expect(getPlan({ date: '2024-11-26' })).toMatchObject({
      date: '2024-11-26',
      scope: '創世紀 23',
      content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
    });
  });

  it('returns null', () => {
    expect(getPlan({ date: '2024-11-32' })).toBeNull();
  });
});
