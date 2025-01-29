import { Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import getPlan from '@/readingPlans/getPlan';
import D1PlanRepository from '@/repositories/d1Plan';
import { AppContext, Bindings, Vars } from '@worker/rest/types';

export const withUsecases = createMiddleware<{ Variables: Vars; Bindings: Bindings }>(
  async (c: AppContext, next: Next) => {
    const repo = new D1PlanRepository(c.env.DB);
    c.set('getPlan', getPlan(repo));
    await next();
  },
);
