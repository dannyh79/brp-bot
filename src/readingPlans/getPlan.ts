import { z } from '@hono/zod-openapi';
import { OldPlan, Plan } from './entities/plan';

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

export const GetPlanOutputSchema = z.object({
  date: z.string().openapi({ example: '2025-01-01' }),
  praise: z.object({
    scope: z.string().openapi({ example: '歷代志上 16:34 CCB' }),
    content: z.string().openapi({ example: '你們要稱謝耶和華, 因為祂是美善的, 祂的慈愛永遠長存!' }),
  }),
  repentence: z.string().openapi({
    example:
      '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求你洗淨我的罪過，清除我的罪惡。求你讓我重新享受蒙你拯救的喜樂，賜我一個樂意順服你的心靈。',
  }),
  devotional: z.object({
    scope: z.string().openapi({ example: '出埃及記 第八章' }),
    content: z.array(z.string()).openapi({
      example: ['1. 你覺得神透過今天的經文對你說什麼呢?', '2. 有什麼你可以做出的行動或改變呢?'],
    }),
  }),
  prayer: z.string().openapi({
    example:
      '”神啊！我將我的，___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n『我們在天上的父：願人都尊你的名為聖。願你的國降臨；願你的旨意行在地上，如同行在天上。我們日用的飲食，今日賜給我們。免我們的債，如同我們免了人的債。不叫我們陷入試探；救我們脫離那惡者。因為國度、權柄、榮耀，全是你的，直到永遠。阿們！』”',
  }),
});

export type GetPlanOutput = z.infer<typeof GetPlanOutputSchema>;

export const getPlan: UsecaseConstructor<Repository<Plan>, GetPlanArgs, GetPlanOutput> =
  (repo) => async (args) => {
    const { date } = args;
    const plan = await repo.findById(date);

    if (!plan) {
      return null;
    }

    return plan;
  };

export default getPlan;
