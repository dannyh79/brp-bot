import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import usecase from '@/usecases/getPlan';
import * as line from './notifier/line';
import getPlan from './getPlan';

const repo = new InMemoryPlanRepository();
const getPlanUsecase = usecase(repo);

export default getPlan(getPlanUsecase)(line.LineNotifier);
