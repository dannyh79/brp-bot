import { env } from 'cloudflare:test';
import D1PlanRepository from '@/repositories/d1Plan';

describe('October church-prayer migration', () => {
  it('seeds the October 1 scripture and guide from the dedicated source', async () => {
    const repo = new D1PlanRepository(env.DB);

    expect(await repo.findById('2026-10-01')).toMatchObject({
      churchPrayer: {
        scripture: '「凡敬畏神的人，你們都來聽！我要述說他為我所行的事。」詩篇 66:16',
        guide:
          '為教會中那些經歷生命突破、關係修復、甚至勇敢面對自我挑戰的見證感恩。因為這些生命改變的奇蹟，都是榮耀神的記號。',
      },
    });
  });
});
