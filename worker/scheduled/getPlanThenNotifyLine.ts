import { GetPlanOutput } from '@/readingPlans';
import { toDateString } from '@worker/lib';
import { AppContext, ScheduledWorker } from './types';

export const getPlanThenNotifyLine =
  (ctx: AppContext): ScheduledWorker =>
  async (event, env) => {
    const { usecases: u, services: s } = ctx;
    const date = toDateString(new Date(event.scheduledTime));
    const data = await u.getPlan({ date });

    /** Empty space used in placeholder values to not break LINE API contract. */
    const fallbackMessage: GetPlanOutput = {
      date,
      praise: { scope: ' ', content: 'No Plan Found' },
      repentence: ' ',
      devotional: { scope: ' ', link: '', content: [' '] },
      prayer: ' ',
    };

    const recipientIds = ((await u.listRecipients()) ?? []).map((r) => r.id);

    const result = await s.notifier.pushMessage(
      data ? recipientIds : [env.LINE_ADMIN_RECIPIENT_ID],
      data ?? fallbackMessage,
    );
    console.log(result);
  };

export default getPlanThenNotifyLine;
