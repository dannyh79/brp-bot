import { Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import getPlan from '@/readingPlans/getPlan';
import InMemoryPlanRepository from '@/repositories/inMemoryPlan';
import { AppContext, Vars } from '@worker/rest/types';

export const withUsecases = createMiddleware<{ Variables: Vars }>(
  async (c: AppContext, next: Next) => {
    const repo = new InMemoryPlanRepository();
    c.set('getPlan', getPlan(repo));
    await next();
  },
);
