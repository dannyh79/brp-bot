import { ExecutionContext } from 'hono';

interface ScheduledEvent extends ScheduledController {
  /** Unix timestamp of when the event was scheduled. */
  scheduledTime: number;
  /**
   * CRON string that triggered the event.
   * See: https://developers.cloudflare.com/workers/configuration/cron-triggers/#supported-cron-expressions
   * */
  cron: string;
}

export type ScheduledWorker = (
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext,
) => void | Promise<void>;

export type ScheduledWorkerConstructor<Usecase, NotifierConstructor> = (
  u: Usecase,
) => (n: NotifierConstructor) => ScheduledWorker;
