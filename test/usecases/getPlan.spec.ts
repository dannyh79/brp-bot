import { Plan, PlanSchema, getPlan } from '@/readingPlans';
import * as helper from 'test/helpers/d1';

const plan = PlanSchema.parse(helper.planRecordFixture);

class StubRepository implements Repository<Plan> {
  data = plan;

  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(date === this.data.date ? this.data : null);
  }

  all() {
    return Promise.resolve([]);
  }

  save() {
    return Promise.resolve();
  }

  destroy() {
    return Promise.resolve();
  }
}

describe('getPlan()', () => {
  const repo = new StubRepository();

  it('returns plan object', async () => {
    expect(await getPlan(repo)(plan)).toMatchObject(plan);
  });

  it('returns null', async () => {
    const nonExistentPlan = { ...plan, date: '2024-12-31' };
    expect(await getPlan(repo)(nonExistentPlan)).toBeNull();
  });
});
