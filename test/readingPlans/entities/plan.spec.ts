import { PlanSchema, toLocaleDateObject } from '@/readingPlans';

export const rawData = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
  },
  devotional: {
    scope: ['出埃及記 第 8 章'],
    link: [],
  },
};

describe('PlanSchema devotional link', () => {
  const testCases: [name: string, raw: object, expected: Array<string>][] = [
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 第 8 章"`,
      rawData,
      ['https://www.bible.com/bible/1392/EXO.8'],
    ],
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 8 章"`,
      { ...rawData, devotional: { ...rawData.devotional, scope: ['出埃及記 8 章'] } },
      ['https://www.bible.com/bible/1392/EXO.8'],
    ],
    [
      `parses plan's devotional link from data with devotional scope "出埃及記 8:1-11"`,
      { ...rawData, devotional: { ...rawData.devotional, scope: ['出埃及記 8:1-11'] } },
      ['https://www.bible.com/bible/1392/EXO.8.1-11'],
    ],
    [
      `parses plan's devotional link from data with devotional link`,
      {
        ...rawData,
        devotional: { ...rawData.devotional, link: ['https://www.bible.com/bible/59/EXO.8'] },
      },
      ['https://www.bible.com/bible/59/EXO.8'],
    ],
    [
      `parses plan's devotional link from data with devotional scope "尼希米記 第 2 章,馬太福音 1 章"`,
      {
        ...rawData,
        devotional: { ...rawData.devotional, scope: ['尼希米記 第 2 章', '馬太福音 1 章'] },
      },
      ['https://www.bible.com/bible/1392/NEH.2', 'https://www.bible.com/bible/1392/MAT.1'],
    ],
    [
      `parses plan's devotional link from data with devotional scope "以賽亞書 第 53-54 章,約翰福音 18-19 章"`,
      {
        ...rawData,
        devotional: { ...rawData.devotional, scope: ['以賽亞書 第 53-54 章', '約翰福音 18-19 章'] },
      },
      // YouVersion does not support link for multiple chapters, so only the first chatper is linked
      ['https://www.bible.com/bible/1392/ISA.53', 'https://www.bible.com/bible/1392/JHN.18'],
    ],
    [
      `parses plan's devotional link from data with devotional scope "以賽亞書 第 53:2-54 章,約翰福音 18:2-19 章"`,
      {
        ...rawData,
        devotional: {
          ...rawData.devotional,
          scope: ['以賽亞書 第 53:2-54 章', '約翰福音 18:2-19 章'],
        },
      },
      // YouVersion does not support link for "the rest of chapters", so link to the first chatper only
      ['https://www.bible.com/bible/1392/ISA.53', 'https://www.bible.com/bible/1392/JHN.18'],
    ],
  ];

  testCases.forEach(([name, raw, expected]) => {
    it(name, () => {
      const { data, success } = PlanSchema.safeParse(raw);

      expect(success).toBe(true);
      expect(data!.devotional.link).toStrictEqual(expected);
    });
  });
});

describe('toLocaleDateObject()', () => {
  const testCases: [name: string, date: string, expected: object][] = [
    [
      `formats 2025-01-01 as { date: "1/1", dayOfWeek: "星期四" }`,
      '2025-01-01 00:00:00 GMT+8',
      { date: '1/1', dayOfWeek: '星期三' },
    ],
    [
      `formats 2025-01-11 as { date: "1/11", dayOfWeek: "星期六" }`,
      '2025-01-11 00:00:00 GMT+8',
      { date: '1/11', dayOfWeek: '星期六' },
    ],
    [
      `formats 2025-10-01 as { date: "10/1", dayOfWeek: "星期三" }`,
      '2025-10-01 00:00:00 GMT+8',
      { date: '10/1', dayOfWeek: '星期三' },
    ],
    [
      `formats 2025-10-10 as { date: "10/10", dayOfWeek: "星期五" }`,
      '2025-10-10 00:00:00 GMT+8',
      { date: '10/10', dayOfWeek: '星期五' },
    ],
  ];

  testCases.forEach(([name, date, expected]) => {
    it(name, () => {
      const result = toLocaleDateObject(date);
      expect(result).toStrictEqual(expected);
    });
  });
});
