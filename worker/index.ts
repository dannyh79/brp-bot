import { newRepositories, newServices, newTelegramServices, newUsecases } from './scheduled';
import getPlanThenNotifyLine from './scheduled/getPlanThenNotifyLine';
import getPlanThenNotifyTelegram from './scheduled/getPlanThenNotifyTelegram';

import app from './rest';

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const results = await Promise.allSettled([
      (async () => {
        const usecases = newUsecases(newRepositories(env));
        const services = newServices(env);
        await getPlanThenNotifyLine({ usecases, services })(event, env, ctx);
      })(),
      (async () => {
        const usecases = newUsecases(newRepositories(env));
        const services = newTelegramServices(env);
        await getPlanThenNotifyTelegram({ usecases, services })(event, env, ctx);
      })(),
    ]);
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        console.error(
          `Scheduled ${index === 0 ? 'LINE' : 'TELEGRAM'} job failed`,
          result.reason instanceof Error ? result.reason.message : 'Unknown error',
        );
      }
    }
    if (results.some((result) => result.status === 'rejected')) {
      throw new Error('One or more scheduled notification jobs failed');
    }
  },
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
