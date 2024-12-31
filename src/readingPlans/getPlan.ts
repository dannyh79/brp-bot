import { z } from '@hono/zod-openapi';
import { OldPlan } from './entities/plan';

export type GetPlanArgs = {
  date: string;
};

export const Get2024PlanOutputSchema = z.object({
  date: z.string().openapi({ example: '2024-11-26' }),
  scope: z.string().openapi({ example: '創世紀 23' }),
  content: z.array(z.string()).openapi({
    example: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
  }),
});

export type Get2024PlanOutput = z.infer<typeof Get2024PlanOutputSchema>;

export const get2024Plan: UsecaseConstructor<Repository<OldPlan>, GetPlanArgs, Get2024PlanOutput> =
  (repo) => async (args) => {
    const { date } = args;
    const plan = await repo.findById(date);

    if (!plan) {
      return null;
    }

    return plan;
  };

export default get2024Plan;
