import { OpenAPIRoute, Str } from 'chanfana';
import { Context } from 'hono';
import { z } from 'zod';
import getPlan, { GetPlanOutputSchema } from '../usecases/getPlan';
import InMemoryPlanRepository from '../repositories/inMemoryPlan';

export const GetPlanQuery = z.object({
  date: Str({ example: '2024-11-26' }),
});

type AppContext = Context;

export class GetPlan extends OpenAPIRoute {
  schema = {
    tags: ['Plans'],
    summary: `Returns a plan`,
    request: {
      query: GetPlanQuery,
    },
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
  };

  async handle(c: AppContext) {
    const repo = new InMemoryPlanRepository();
    const { query } = await this.getValidatedData<typeof this.schema>();

    const data = await getPlan(repo)(query);
    if (!data) {
      c.notFound();
      return;
    } else {
      return data;
    }
  }
}

export default GetPlan;
