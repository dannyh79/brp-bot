import { createRoute, z } from '@hono/zod-openapi';
import { GetPlanOutputSchema } from '@/readingPlans';
import { withUsecases } from '@worker/rest/middlewares';

export const GetPlanQuery = z.object({
  date: z.string().openapi({ example: '2025-01-01' }),
  format: z.enum(['html', 'json']).optional().openapi({ example: 'html' }),
});

export const getPlan = createRoute({
  method: 'get',
  path: '/api/v1/plan',
  tags: ['Plans'],
  summary: `Returns a plan`,
  request: {
    query: GetPlanQuery,
  },
  middleware: [withUsecases] as const,
  responses: {
    '200': {
      description: 'Returns reading plan for the date',
      content: {
        'application/json': {
          schema: GetPlanOutputSchema,
        },
        'text/html': {
          schema: {},
        },
      },
    },
    '404': {
      description: 'Plan not found for the date',
    },
  },
});

export default getPlan;
