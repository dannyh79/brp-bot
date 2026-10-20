import { newRepositories, newLineServices, newTelegramServices, newUsecases } from './scheduled';
import getPlanThenNotifyLine from './scheduled/getPlanThenNotifyLine';
import getPlanThenNotifyTelegram from './scheduled/getPlanThenNotifyTelegram';

import app from './rest';

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const jobs = {
      LINE: {
        enabled: env.LINE_ENABLED ?? 'false',
        run: async () => {
          const usecases = newUsecases(newRepositories(env));
          const services = newLineServices(env);
          await getPlanThenNotifyLine({ usecases, services })(event, env, ctx);
        },
      },
      TELEGRAM: {
        enabled: env.TELEGRAM_ENABLED ?? 'false',
        run: async () => {
          const usecases = newUsecases(newRepositories(env));
          const services = newTelegramServices(env);
          await getPlanThenNotifyTelegram({ usecases, services })(event, env, ctx);
        },
      },
    };
    const failures: string[] = [];
    await Promise.allSettled(
      Object.entries(jobs).map(async ([channel, { enabled, run }]) => {
        try {
          if (enabled === 'false') return;
          if (enabled !== 'true') throw new Error(`${channel}_ENABLED must be "true" or "false"`);
          await run();
        } catch (reason) {
          const error = reason instanceof Error ? reason.message : 'Unknown error';
          console.error('Scheduled notification job failed', {
            channel,
            error,
          });
          failures.push(`${channel}: ${error}`);
          throw reason;
        }
      }),
    );
    if (failures.length) {
      throw new Error(`One or more scheduled notification jobs failed: ${failures.join('; ')}`);
    }
  },
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
