import { GetPlanOutput } from '@/readingPlans';
import {
  newLineServices,
  newRepositories,
  newTelegramServices,
  newUsecases,
} from '@worker/scheduled';
import { sendTelegramPlan } from '@worker/scheduled/getPlanThenNotifyTelegram';
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
      const results = await sendTelegramPlan(
        { usecases: { getPlan: async () => plan }, services: newTelegramServices(env) },
        env,
        date,
      );
      if (!results) throw new Error('Telegram is not configured');
      return results;
    },
  },
};

export async function sendNotification(
  env: Env,
  date: string,
  channel: keyof typeof notificationChannels,
) {
  const delivery = notificationChannels[channel];
  if (!delivery.configured(env))
    return { status: 503 as const, body: { message: `${channel} is not configured` } };
  const usecases = newUsecases(newRepositories(env));
  const plan = await usecases.getPlan({ date });
  if (!plan) return { status: 404 as const, body: { message: 'Plan not found' } };
  try {
    const results = await delivery.send({ env, date, plan, usecases });
    const failed = results.filter((result) => result.status === 'rejected').length;
    const delivered = results.length - failed;
    if (!failed) return { status: 200 as const, body: { delivered, failed } };
    console.error('Manual notification delivery failed', { date, channel, delivered, failed });
    return {
      status: 502 as const,
      body: { message: 'Delivery failed; check logs before retrying', delivered, failed },
    };
  } catch {
    console.error('Manual notification delivery failed', { date, channel });
    return {
      status: 502 as const,
      body: { message: 'Delivery failed; check logs before retrying', delivered: 0, failed: 0 },
    };
  }
}
