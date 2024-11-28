import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import getPlanUsecase, { GetPlanOutput } from '@/usecases/getPlan';
import * as line from './notifier/line';
import { ScheduledWorker } from './types';
import { NotifierConstructor } from './notifier';

const repo = new InMemoryPlanRepository();
const usecase = getPlanUsecase(repo);

/** The en-CA (Canadian English) locale outputs dates in YYYY-MM-DD format by default. */
const locale = 'en-CA' as const;
const timeZone = 'Asia/Taipei' as const;

const formatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
});

export const getPlan: (
  Notifier: NotifierConstructor<line.LineNotifierArg, GetPlanOutput, line.LineMessage[]>,
) => ScheduledWorker = (Notifier) => async (event, env) => {
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

export default getPlan(line.LineNotifier);
