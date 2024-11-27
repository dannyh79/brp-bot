import { z } from '@hono/zod-openapi';
import { Plan } from '../entities/plan';
import { Repository } from '../repositories/types';

export type GetPlanArgs = {
  date: string;
};

export const GetPlanOutputSchema = z.object({
  date: z.string().openapi({ example: '2024-11-26' }),
  scope: z.string().openapi({ example: '創世紀 23' }),
  content: z.array(z.string()).openapi({
    example: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
  }),
});

export type GetPlanOutput = z.infer<typeof GetPlanOutputSchema>;

export const getPlan = (repo: Repository<Plan>): ((args: GetPlanArgs) => Promise<Plan | null>) => {
  return async ({ date }: GetPlanArgs) => {
    const plan = await repo.findById(date);

    if (!plan) {
      return null;
    }

    return plan;
  };
};

export default getPlan;
