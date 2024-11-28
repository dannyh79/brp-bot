import { getPlan } from '@/readingPlans';
import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import * as line from './notifier/line';
import getPlanThenNotify from './getPlanThenNotify';

const repo = new InMemoryPlanRepository();
const getPlanUsecase = getPlan(repo);

export default getPlanThenNotify(getPlanUsecase)(line.LineNotifier);
