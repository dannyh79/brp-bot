import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import getPlanUsecase from '@/usecases/getPlan';
import * as line from './notifier/line';
import { ScheduledWorker } from './types';

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

export const getPlan: ScheduledWorker = async (event, env) => {
  const date = formatter.format(new Date(event.scheduledTime));
  const data = await usecase({ date });

  if (!data) {
    return;
  }

  const lineClient = line.createClient(env.LINE_CHANNEL_ACCESS_TOKEN);
  const result = await lineClient.pushMessage({
    to: env.LINE_RECEIPIENT_ID,
    messages: [line.toBubbleMessage(data)],
  });
  console.log(result);
};

export default getPlan;
