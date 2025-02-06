import { Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getPlan, saveRecipient } from '@/readingPlans';
import D1PlanRepository from '@/repositories/d1Plan';
import D1RecipientRepository from '@/repositories/d1Recipient';
import { AppContext, Bindings, Vars } from '@worker/rest/types';

export const withUsecases = createMiddleware<{ Variables: Vars; Bindings: Bindings }>(
  async (c: AppContext, next: Next) => {
    const planRepo = new D1PlanRepository(c.env.DB);
    const recipientRepo = new D1RecipientRepository(c.env.DB);
    c.set('getPlan', getPlan(planRepo));
    c.set('saveRecipient', saveRecipient(recipientRepo));
    await next();
  },
);
