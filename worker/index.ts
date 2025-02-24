import { newRepositories, newServices, newUsecases } from './scheduled';
import getPlanThenNotifyLine from './scheduled/getPlanThenNotifyLine';

import app from './rest';

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const usecases = newUsecases(newRepositories(env));
    const services = newServices(env);

    await getPlanThenNotifyLine({ usecases, services })(event, env, ctx);
  },
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
