import { OpenAPIRoute, Str } from 'chanfana';
import { Context } from 'hono';
import { z } from 'zod';
import getPlan, { Plan } from '../usecases/getPlan';

export const GetPlanQuery = z.object({
  date: Str({ example: '2024-11-26' }),
});

type AppContext = Context;

export class GetPlan extends OpenAPIRoute {
  schema = {
    tags: ['Hello World'],
    summary: `Returns message "Hello World!`,
    request: {
      query: GetPlanQuery,
    },
    responses: {
      '200': {
        description: 'Returns reading plan for the date',
        content: {
          'application/json': {
            schema: Plan,
          },
        },
      },
      '404': {
        description: 'Plan not found for the date',
      },
    },
  };

  async handle(c: AppContext) {
    const { query } = await this.getValidatedData<typeof this.schema>();

    const data = getPlan(query);
    if (!data) {
      c.notFound();
      return;
    } else {
      return data;
    }
  }
}

export default GetPlan;
