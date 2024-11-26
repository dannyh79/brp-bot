import { Arr, OpenAPIRoute, Str } from 'chanfana';
import { Context } from 'hono';
import { z } from 'zod';

export const GetPlanQuery = z.object({
  date: Str({ example: '2024-11-26' }),
});

const Plan = z.object({
  date: Str({ example: '2024-11-26' }),
  scope: Str({ example: '創世紀 23' }),
  content: Arr(
    Str({ example: '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?' }),
  ),
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

    const stubData: Record<string, object> = {
      '2024-11-26': {
        date: '2024-11-26',
        scope: '創世紀 23',
        content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
      },
    };

    if (!Object.keys(stubData).includes(query.date)) {
      c.notFound();
    }

    return stubData[query.date];
  }
}

export default GetPlan;
