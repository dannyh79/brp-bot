import { getPlan } from '@/readingPlans';
import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import * as line from './notifier/line';
import getPlanThenNotifyLine from './getPlanThenNotifyLine';

const repo = new InMemoryPlanRepository();
const getPlanUsecase = getPlan(repo);

export default getPlanThenNotifyLine(getPlanUsecase)(line.LineNotifier);
