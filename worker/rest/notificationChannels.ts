import { GetPlanOutput } from '@/readingPlans';
import { newLineServices, newTelegramServices } from '@worker/scheduled';
import getPlanThenNotifyTelegram from '@worker/scheduled/getPlanThenNotifyTelegram';
import { Usecases } from '@worker/scheduled/types';

type Delivery = {
  env: Env;
  date: string;
  plan: NonNullable<GetPlanOutput>;
  usecases: Usecases;
};

export const notificationChannels = {
  line: {
    label: 'LINE',
    configured: (env: Env) =>
      !!(env.LINE_CHANNEL_ACCESS_TOKEN?.trim() && env.LINE_ADMIN_RECIPIENT_ID?.trim()),
    send: async ({ env, plan, usecases }: Delivery) => {
      const recipients = ((await usecases.listRecipients()) ?? []).map(({ id }) => id);
      return newLineServices(env).notifier.pushMessage(recipients, plan);
    },
  },
  telegram: {
    label: 'Telegram',
    configured: (env: Env) =>
      !!(
        env.TELEGRAM_BOT_TOKEN?.trim() &&
        env.TELEGRAM_CHAT_IDS?.trim() &&
        env.TELEGRAM_ADMIN_CHAT_ID?.trim()
      ),
    send: async ({ env, date, plan }: Delivery) => {
      const notifier = newTelegramServices(env).notifier;
      let results: PromiseSettledResult<void>[] = [];
      try {
        await getPlanThenNotifyTelegram({
          usecases: { getPlan: async () => plan },
          services: {
            notifier: {
              pushMessage: async (recipients, message) => {
                results = await notifier.pushMessage(recipients, message);
                return results;
              },
            },
          },
        })(
          { scheduledTime: Date.parse(`${date}T12:00:00Z`) } as ScheduledController,
          env,
          {} as ExecutionContext,
        );
      } catch (error) {
        if (!results.some((result) => result.status === 'rejected')) throw error;
      }
      return results;
    },
  },
};
