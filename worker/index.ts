import { getPlan } from '@/readingPlans';
import D1PlanRepository from '@/repositories/d1Plan';
import { LineMultiNotifier } from '@/services/notifiers';
import getPlanThenNotifyLine from './scheduled/getPlanThenNotifyLine';

import app from './rest';

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const repo = new D1PlanRepository(env.DB);
    await getPlanThenNotifyLine(getPlan(repo))(LineMultiNotifier)(event, env, ctx);
  },
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
