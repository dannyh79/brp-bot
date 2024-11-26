import { Plan } from '../entities/plan';
import { Repository } from './types';

const stubData: Record<string, Plan> = {
  '2024-11-26': {
    date: '2024-11-26',
    scope: '創世紀 23',
    content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
  },
};

export default class InMemoryPlanRepository implements Repository<Plan> {
  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(stubData[date] ?? null);
  }
}
