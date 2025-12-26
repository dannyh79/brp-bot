import { createRoute, z } from '@hono/zod-openapi';
import { withUsecases } from '@worker/rest/middlewares';

export const GetPlanQuery = z.object({
  date: z.string().optional().openapi({ example: '2025-01-01' }),
  format: z.enum(['html', 'json']).optional().openapi({ example: 'html' }),
});

export const GetPlanOutputSchema = z.object({
  date: z.string().openapi({ example: '2025-01-01' }),
  praise: z.object({
    scope: z.string().openapi({ example: '歷代志上 16:34 CCB' }),
    content: z
      .string()
      .openapi({ example: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！' }),
  }),
  repentence: z.string().openapi({
    example:
      '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求祢洗淨我的罪過，清除我的罪惡。\n求祢讓我重新享受蒙祢拯救的喜樂，賜我一個樂意順服祢的心靈，並開始以 ___ 的行動做出改變。',
  }),
  devotional: z.object({
    scope: z.array(z.string().openapi({ example: '出埃及記 第 8 章' })),
    link: z.array(
      z.string().default('').openapi({ example: 'https://www.bible.com/bible/1392/EXO.8' }),
    ),
    content: z.array(z.string()).openapi({
      example: ['1. 你覺得神透過今天的經文對你說什麼呢?', '2. 有什麼你可以做出的行動或改變呢?'],
    }),
  }),
  prayer: z.string().openapi({
    example:
      '神啊！我將我的 ___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n我們在天上的父：願人都尊你的名為聖。\n願你的國降臨；願你的旨意行在地上，如同行在天上。\n我們日用的飲食，今日賜給我們。\n免我們的債，如同我們免了人的債。\n不叫我們陷入試探；救我們脫離那惡者。\n因為國度、權柄、榮耀，全是你的，直到永遠。阿們！',
  }),
});

export type GetPlanOutput = z.infer<typeof GetPlanOutputSchema>;

export const getPlan = createRoute({
  method: 'get',
  path: '/api/v1/plan',
  tags: ['Plans'],
  summary: `Returns a plan`,
  request: {
    query: GetPlanQuery,
  },
  middleware: [withUsecases] as const,
  responses: {
    '200': {
      description:
        'Returns reading plan for the date; date defaults to current date in UTC+8 if date is not provided',
      content: {
        'application/json': {
          schema: GetPlanOutputSchema,
        },
        'text/html': {
          schema: {},
        },
      },
    },
    '404': {
      description: 'Plan not found for the date',
    },
  },
});

export default getPlan;
