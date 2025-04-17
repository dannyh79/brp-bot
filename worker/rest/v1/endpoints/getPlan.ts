import { createRoute, z } from '@hono/zod-openapi';
import { GetPlanOutputSchema } from '@/readingPlans';
import { withTimeTestability, withUsecases } from '@worker/rest/middlewares';

export const GetPlanQuery = z.object({
  date: z.string().optional().openapi({ example: '2025-01-01' }),
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
  middleware: [withUsecases, withTimeTestability] as const,
  responses: {
    '200': {
      description:
        'Returns reading plan for the date; date defaults to current date in UTC+8 if date is not provided',
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
