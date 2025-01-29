export type ScheduledWorker = (
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
) => void | Promise<void>;

export type ScheduledWorkerConstructor<Usecase, NotifierConstructor> = (
  u: Usecase,
) => (n: NotifierConstructor) => ScheduledWorker;
