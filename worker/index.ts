import { newRepositories, newLineServices, newTelegramServices, newUsecases } from './scheduled';
import getPlanThenNotifyLine from './scheduled/getPlanThenNotifyLine';
import getPlanThenNotifyTelegram from './scheduled/getPlanThenNotifyTelegram';

import app from './rest';

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const jobs = {
      LINE: async () => {
        const usecases = newUsecases(newRepositories(env));
        const services = newLineServices(env);
        await getPlanThenNotifyLine({ usecases, services })(event, env, ctx);
      },
      TELEGRAM: async () => {
        const usecases = newUsecases(newRepositories(env));
        const services = newTelegramServices(env);
        await getPlanThenNotifyTelegram({ usecases, services })(event, env, ctx);
      },
    };
    const results = await Promise.allSettled(
      Object.entries(jobs).map(async ([channel, run]) => {
        try {
          await run();
        } catch (reason) {
          console.error('Scheduled notification job failed', {
            channel,
            error: reason instanceof Error ? reason.message : 'Unknown error',
          });
          throw reason;
        }
      }),
    );
    if (results.some((result) => result.status === 'rejected')) {
      throw new Error('One or more scheduled notification jobs failed');
    }
  },
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
