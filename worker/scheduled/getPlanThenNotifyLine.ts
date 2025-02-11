import { GetPlanArgs, GetPlanOutput } from '@/readingPlans';
import { LineMultiNotifierArg, NotifierConstructor } from '@/services/notifiers';
import D1RecipientRepository from '@/repositories/d1Recipient';
import { ScheduledWorkerConstructor } from './types';

/** The en-CA (Canadian English) locale outputs dates in YYYY-MM-DD format by default. */
const locale = 'en-CA' as const;
const timeZone = 'Asia/Taipei' as const;

const formatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
});

export const getPlanThenNotifyLine: ScheduledWorkerConstructor<
  Usecase<GetPlanArgs, GetPlanOutput>,
  NotifierConstructor<LineMultiNotifierArg, GetPlanOutput>
> = (usecase) => (Notifier) => async (event, env) => {
  const date = formatter.format(new Date(event.scheduledTime));
  const data = await usecase({ date });

  /** Empty space used in placeholder values to not break LINE API contract. */
  const fallbackMessage: GetPlanOutput = {
    date,
    praise: { scope: ' ', content: 'No Plan Found' },
    repentence: ' ',
    devotional: { scope: ' ', content: [' '] },
    prayer: ' ',
  };

  // FIXME: Inject recipientRepo instead of hardcoding it here.
  const recipientRepo = new D1RecipientRepository(env.DB);
  const recipientIds = (await recipientRepo.all()).map((r) => r.id);

  const notifier = new Notifier({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
    to: data ? recipientIds : [env.LINE_ADMIN_RECIPIENT_ID],
  });
  const result = await notifier.pushMessage(data ?? fallbackMessage);
  console.log(result);
};

export default getPlanThenNotifyLine;
