import { getPlan } from '@/readingPlans';
import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import { LineNotifier } from '@/services/notifiers';
import getPlanThenNotifyLine from './getPlanThenNotifyLine';

const repo = new InMemoryPlanRepository();
const getPlanUsecase = getPlan(repo);

export default getPlanThenNotifyLine(getPlanUsecase)(LineNotifier);
