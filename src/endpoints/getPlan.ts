import { createRoute, z } from '@hono/zod-openapi';
import { GetPlanOutputSchema } from '../usecases/getPlan';
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
          schema: GetPlanOutputSchema,
        },
      },
    },
    '404': {
      description: 'Plan not found for the date',
    },
  },
});

export default getPlan;
