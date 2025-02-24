import { GetPlanArgs, Plan, Recipient } from '@/readingPlans';
import { LineMultiNotifier } from '@/services/notifiers';

export type ScheduledWorker = (
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
) => void | Promise<void>;

export type Repositories = {
  plans: Repository<Plan>;
  recipients: Repository<Recipient>;
};

export type Usecases = {
  getPlan: Usecase<GetPlanArgs, Plan>;
  listRecipients: Usecase<void, Recipient[]>;
};

export type Services = {
  notifier: LineMultiNotifier;
};

export type AppContext = {
  usecases: Usecases;
  services: Services;
};
