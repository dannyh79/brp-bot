import { Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import InMemoryPlanRepository from '../repositories/inMemoryPlan';
import getPlan from '../usecases/getPlan';
import { AppContext, Vars } from '../types';

export const withUsecases = createMiddleware<{ Variables: Vars }>(
  async (c: AppContext, next: Next) => {
    const repo = new InMemoryPlanRepository();
    c.set('getPlan', getPlan(repo));
    await next();
  },
);
