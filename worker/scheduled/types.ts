import { GetPlanArgs, GetPlanOutput, Plan, Recipient } from '@/readingPlans';
import { LineMultiNotifier } from '@/services/notifiers';
import { Notifier } from '@/services/notifiers/types';

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

export type TelegramAppContext = {
  usecases: { getPlan: Usecase<GetPlanArgs, GetPlanOutput> };
  services: { notifier: Notifier<string[], string, PromiseSettledResult<void>[]> };
};
