import { PlanSchema } from '@/readingPlans';

export const rawData = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
  },
  devotional: {
    scope: '出埃及記 第 8 章',
  },
};

describe('PlanSchema devotional link', () => {
  const testCases: [name: string, raw: object, expected: string][] = [
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 第 8 章"`,
      rawData,
      'https://www.bible.com/bible/1392/EXO.8',
    ],
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 8 章"`,
      { ...rawData, devotional: { scope: '出埃及記 8 章' } },
      'https://www.bible.com/bible/1392/EXO.8',
    ],
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 8:1-11"`,
      { ...rawData, devotional: { scope: '出埃及記 8:1-11' } },
      'https://www.bible.com/bible/1392/EXO.8.1-11',
    ],
    [
      `parses plan's devotional link from data with devotional link`,
      {
        ...rawData,
        devotional: { ...rawData.devotional, link: 'https://www.bible.com/bible/59/EXO.8' },
      },
      'https://www.bible.com/bible/59/EXO.8',
    ],
  ];

  testCases.forEach(([name, raw, expected]) => {
    it(name, () => {
      const { data, success } = PlanSchema.safeParse(raw);

      expect(success).toBe(true);
      expect(data!.devotional.link).toBe(expected);
    });
  });
});
