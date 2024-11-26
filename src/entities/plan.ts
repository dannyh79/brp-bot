import { Str } from 'chanfana';
import { z } from 'zod';

export const PlanSchema = z.object({
  date: Str({ example: '2024-11-26' }),
  scope: Str({ example: '創世紀 23' }),
  content: z.array(
    Str({ example: '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?' }),
  ),
});

export type Plan = z.infer<typeof PlanSchema>;
