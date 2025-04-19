import { OpenAPIHono } from '@hono/zod-openapi';
import { Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import * as readingPlan from '@/readingPlans';
import D1PlanRepository from '@/repositories/d1Plan';
import D1RecipientRepository from '@/repositories/d1Recipient';
import { AppContext, Bindings, Vars } from '@worker/rest/types';

export const withUsecases = createMiddleware<{ Variables: Vars; Bindings: Bindings }>(
  async (c: AppContext, next: Next) => {
    const planRepo = new D1PlanRepository(c.env.DB);
    const recipientRepo = new D1RecipientRepository(c.env.DB);
    c.set('getPlan', readingPlan.getPlan(planRepo));
    c.set('saveRecipient', readingPlan.saveRecipient(recipientRepo));
    c.set('destroyRecipient', readingPlan.destroyRecipient(recipientRepo));
    await next();
  },
);

export const withAuth = createMiddleware(async (c: AppContext, next: Next) => {
  if (c.req.header('Authorization') !== `Bearer ${c.env.API_TOKEN}`) {
    return c.text('Unauthorized', 401);
  }
  await next();
});

/**
 * Registers authorization component in OpenAPI.
 * @see {@link https://github.com/honojs/middleware/blob/main/packages/zod-openapi/README.md#how-to-setup-authorization|@hono/zod-openapi doc}
 */
export const registerAuthComponent = (app: OpenAPIHono) => {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
  });
};
