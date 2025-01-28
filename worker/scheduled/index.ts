import { getPlan } from '@/readingPlans';
import { LineMultiNotifier } from '@/services/notifiers';
import getPlanThenNotifyLine from './getPlanThenNotifyLine';
import D1PlanRepository from '@/repositories/d1Plan';

export default {
  async scheduled(_event: ScheduledEvent, env: Env) {
    const repo = new D1PlanRepository(env.DB);
    getPlanThenNotifyLine(getPlan(repo))(LineMultiNotifier);
  },
};
