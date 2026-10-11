import { toTextMessage } from '@/services/notifiers/telegram/utils';
import { toDateString } from '@worker/lib';
import { ScheduledWorker, TelegramAppContext } from './types';

export const getPlanThenNotifyTelegram =
  (ctx: TelegramAppContext): ScheduledWorker =>
  async (event, env) => {
    const token = env.TELEGRAM_BOT_TOKEN?.trim();
    const destinations = env.TELEGRAM_CHAT_IDS?.trim();
    const admin = env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (!token && !destinations && !admin) return;

    const recipients = destinations?.split(',').map((id) => id.trim()) ?? [];
    const isChatId = (id: string) => /^(?:-?[1-9]\d*|@[A-Za-z][A-Za-z0-9_]{4,31})$/.test(id);
    if (
      !token ||
      !/^\d+:[A-Za-z0-9_-]+$/.test(token) ||
      !recipients.length ||
      !recipients.every(isChatId) ||
      !admin ||
      !isChatId(admin)
    ) {
      throw new Error(
        'Telegram configuration requires a valid TELEGRAM_BOT_TOKEN, comma-separated TELEGRAM_CHAT_IDS, and TELEGRAM_ADMIN_CHAT_ID',
      );
    }

    const date = toDateString(new Date(event.scheduledTime));
    const plan = await ctx.usecases.getPlan({ date });
    const results = await ctx.services.notifier.pushMessage(
      plan ? [...new Set(recipients)] : [admin],
      plan ? toTextMessage(plan) : `No Plan Found for ${date}`,
    );
    const failures = results.filter((result) => result.status === 'rejected');
    console.log('Telegram notification completed', {
      delivered: results.length - failures.length,
      failed: failures.length,
    });
    if (failures.length) {
      throw new Error(`Telegram delivery failed for ${failures.length} chat(s)`);
    }
  };

export default getPlanThenNotifyTelegram;
