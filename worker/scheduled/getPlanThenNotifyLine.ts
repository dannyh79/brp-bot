import { GetPlanOutput } from '@/readingPlans';
import { AppContext, ScheduledWorker } from './types';

/** The en-CA (Canadian English) locale outputs dates in YYYY-MM-DD format by default. */
const locale = 'en-CA' as const;
const timeZone = 'Asia/Taipei' as const;

const formatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
});

export const getPlanThenNotifyLine =
  (ctx: AppContext): ScheduledWorker =>
  async (event, env) => {
    const { usecases: u, services: s } = ctx;
    const date = formatter.format(new Date(event.scheduledTime));
    const data = await u.getPlan({ date });

    /** Empty space used in placeholder values to not break LINE API contract. */
    const fallbackMessage: GetPlanOutput = {
      date,
      praise: { scope: ' ', content: 'No Plan Found' },
      repentence: ' ',
      devotional: { scope: ' ', content: [' '] },
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
