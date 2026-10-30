import { GetPlanOutput } from '@/readingPlans';
import { toDateString } from '@worker/lib';
import { AppContext, ScheduledWorker } from './types';

export const getPlanThenNotifyLine =
  (ctx: AppContext): ScheduledWorker =>
  async (event, env) => {
    const token = env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
    const admin = env.LINE_ADMIN_RECIPIENT_ID?.trim();
    if (!token && !admin) return;
    if (!token || !admin) {
      throw new Error(
        'LINE configuration requires LINE_CHANNEL_ACCESS_TOKEN and LINE_ADMIN_RECIPIENT_ID',
      );
    }

    const { usecases: u, services: s } = ctx;
    const date = toDateString(new Date(event.scheduledTime));
    const data = await u.getPlan({ date });

    /** Empty space used in placeholder values to not break LINE API contract. */
    const fallbackMessage: GetPlanOutput = {
      date,
      praise: { scope: ' ', content: 'No Plan Found' },
      repentence: ' ',
      devotional: { scope: [' '], link: [''], content: [' '] },
      subsectionBlocks: [],
      prayer: ' ',
    };

    const recipientIds = ((await u.listRecipients()) ?? []).map((r) => r.id);

    const result = await s.notifier.pushMessage(
      data ? recipientIds : [admin],
      data ?? fallbackMessage,
    );
    console.log(result);
  };

export default getPlanThenNotifyLine;
