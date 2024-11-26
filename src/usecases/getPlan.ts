import { z } from 'zod';
import { Arr, Str } from 'chanfana';

export const Plan = z.object({
  date: Str({ example: '2024-11-26' }),
  scope: Str({ example: '創世紀 23' }),
  content: Arr(
    Str({ example: '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?' }),
  ),
});

export type GetPlanArgs = {
  date: string;
};

export const getPlan = ({ date }: GetPlanArgs): z.infer<typeof Plan> | null => {
  const stubData: Record<string, z.infer<typeof Plan>> = {
    '2024-11-26': {
      date: '2024-11-26',
      scope: '創世紀 23',
      content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
    },
  };

  if (!Object.keys(stubData).includes(date)) {
    return null;
  }

  return stubData[date];
};

export default getPlan;
