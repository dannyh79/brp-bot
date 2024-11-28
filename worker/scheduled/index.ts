import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import usecase from '@/usecases/getPlan';
import * as line from './notifier/line';
import getPlanThenNotify from './getPlanThenNotify';

const repo = new InMemoryPlanRepository();
const getPlanUsecase = usecase(repo);

export default getPlanThenNotify(getPlanUsecase)(line.LineNotifier);
