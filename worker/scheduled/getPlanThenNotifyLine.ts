import { GetPlanArgs, GetPlanOutput } from '@/readingPlans';
import * as line from './notifier/line';
import { NotifierConstructor } from './notifier';
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
  NotifierConstructor<line.LineNotifierArg, GetPlanOutput, line.LineMessage[]>
> = (usecase) => (Notifier) => async (event, env) => {
  const date = formatter.format(new Date(event.scheduledTime));
  const data = await usecase({ date });

  const fallbackMessage: GetPlanOutput = {
    date,
    scope: 'No Plan Found',
    content: [],
  };

  const notifier = new Notifier({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
    to: data ? env.LINE_RECEIPIENT_ID : env.LINE_ADMIN_RECEIPIENT_ID,
  });
  const result = await notifier.pushMessage(data ?? fallbackMessage);
  console.log(result);
};

export default getPlanThenNotifyLine;