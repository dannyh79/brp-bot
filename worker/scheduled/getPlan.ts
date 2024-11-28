import { Usecase } from '@/usecases/types';
import { GetPlanArgs, GetPlanOutput } from '@/usecases/getPlan';
import * as line from './notifier/line';
import { ScheduledWorkerConstructor } from './types';
import { NotifierConstructor } from './notifier';

/** The en-CA (Canadian English) locale outputs dates in YYYY-MM-DD format by default. */
const locale = 'en-CA' as const;
const timeZone = 'Asia/Taipei' as const;

const formatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
});

export const getPlan: ScheduledWorkerConstructor<
  Usecase<GetPlanArgs, GetPlanOutput>,
  NotifierConstructor<line.LineNotifierArg, GetPlanOutput, line.LineMessage[]>
> = (usecase) => (Notifier) => async (event, env) => {
  const date = formatter.format(new Date(event.scheduledTime));
  const data = await usecase({ date });

  if (!data) {
    return;
  }

  const notifier = new Notifier({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
    to: env.LINE_RECEIPIENT_ID,
  });
  const result = await notifier.pushMessage(data);
  console.log(result);
};

export default getPlan;
