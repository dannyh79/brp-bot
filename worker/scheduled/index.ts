import InMemoryPlanRepository from '../../src/repositories/inMemoryPlan';
import getPlanUsecase from '../../src/usecases/getPlan';
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

export const getPlan: ScheduledWorker = async (event) => {
  const date = formatter.format(new Date(event.scheduledTime));
  const data = await usecase({ date });
  console.log(data);

  if (!data) {
    return;
  }
};

export default getPlan;
