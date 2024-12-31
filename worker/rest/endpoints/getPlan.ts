import { createRoute, z } from '@hono/zod-openapi';
import { Get2024PlanOutputSchema } from '@/readingPlans';
import { withUsecases } from '../middlewares';

export const GetPlanQuery = z.object({
  date: z.string().openapi({ example: '2024-11-26' }),
});

export const getPlan = createRoute({
  method: 'get',
  path: '/plan',
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
          schema: Get2024PlanOutputSchema,
        },
      },
    },
    '404': {
      description: 'Plan not found for the date',
    },
  },
});

export default getPlan;
