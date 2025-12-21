import { z } from '@hono/zod-openapi';

const defaultValues = {
  repentence:
    '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求祢洗淨我的罪過，清除我的罪惡。\n求祢讓我重新享受蒙祢拯救的喜樂，賜我一個樂意順服祢的心靈，並開始以 ___ 的行動做出改變。',
  devotional: ['1. 你覺得神透過今天的經文對你說什麼呢？', '2. 有什麼你可以做出的行動或改變呢？'],
  prayer:
    '神啊！我將我的 ___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n我們在天上的父：願人都尊你的名為聖。\n願你的國降臨；願你的旨意行在地上，如同行在天上。\n我們日用的飲食，今日賜給我們。\n免我們的債，如同我們免了人的債。\n不叫我們陷入試探；救我們脫離那惡者。\n因為國度、權柄、榮耀，全是你的，直到永遠。阿們！',
};

/** YouVersion CCB bible (coded `1392` by them) base link */
const ccbBibleBaseLink = 'https://www.bible.com/bible/1392/' as const;

export const PlanSchema = z
  .object({
    date: z.string().openapi({ example: '2025-01-01' }),
    praise: z.object({
      scope: z.string().openapi({ example: '歷代志上 16:34 CCB' }),
      content: z
        .string()
        .openapi({ example: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！' }),
    }),
    repentence: z.string().default(defaultValues['repentence']).openapi({
      example: defaultValues['repentence'],
    }),
    devotional: z.object({
      scope: z.array(z.string().openapi({ example: '出埃及記 第 8 章' })),
      link: z.array(
        z.string().default('').openapi({ example: 'https://www.bible.com/bible/1392/EXO.8' }),
      ),
      content: z.array(z.string()).default(defaultValues['devotional']).openapi({
        example: defaultValues['devotional'],
      }),
    }),
    prayer: z.string().default(defaultValues['prayer']).openapi({
      example: defaultValues['prayer'],
    }),
  })
  .transform((plan) => {
    plan.devotional.scope.forEach((scope, index) => {
      if (!plan.devotional.link[index]) {
        plan.devotional.link[index] = parseBibleLink(scope);
      }
    });
    return plan;
  });

export type Plan = z.infer<typeof PlanSchema>;

/**
 * @param date - String in numeric format, like "4/13" for April 13th.
 * @param weekday - String in traditional Chinese, like "星期一".
 */
export type LocaleDate = {
  date: string;
  dayOfWeek: string;
};

/**
 * Formats date string to localized date object.
 *
 * @remarks
 * Output date is converted to date in UTC+8 (Asia/Taipei).
 */
export const toLocaleDateObject = (str: string): LocaleDate => {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${str}`);
  }

  const timeZone = 'Asia/Taipei' as const;

  /** Use locale "en-US" to get numeric date format like "4/1" for April first. */
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    timeZone,
  }).format;

  /** Use locale "zh-TW" to get weekday in traditional Chinese. */
  const weekdayFormatter = new Intl.DateTimeFormat('zh-TW', {
    weekday: 'long',
    timeZone,
  }).format;

  return {
    date: dateFormatter(date),
    dayOfWeek: weekdayFormatter(date),
  };
};

const parseBibleLink = (scope: string, bookMap: Record<string, string> = bibleBookMap): string => {
  const bookMatch = Object.keys(bookMap).find((book) => scope.includes(book));
  if (!bookMatch) return ccbBibleBaseLink;

  const bookCode = bookMap[bookMatch];

  // Try to find the first number in the scope, which is typically the chapter number
  const chapterMatch = scope.match(/\d+/);
  if (chapterMatch) {
    const chapter = chapterMatch[0]; // Gets the first number

    // Check for specific chapter-verse pattern like "8:1-11"
    const chapterVersePatternMatch = scope.match(/(?<chapter>\d+):(?<verse>\d+-\d+)/);

    // If a chapter-verse pattern is found, and it matches the extracted chapter,
    // and the scope does not contain "章" (indicating a chapter range, not specific verses),
    // then include the verses in the link.
    if (
      chapterVersePatternMatch?.groups &&
      chapter === chapterVersePatternMatch.groups.chapter &&
      !scope.includes('章')
    ) {
      return `${ccbBibleBaseLink}${bookCode}.${chapterVersePatternMatch.groups.chapter}.${chapterVersePatternMatch.groups.verse}`;
    }

    // Otherwise, just link to the chapter (this handles chapter-only, chapter ranges, and chapter-verse within "章")
    return `${ccbBibleBaseLink}${bookCode}.${chapter}`;
  }

  return ccbBibleBaseLink;
};

/** Bible book Chinese-English map */
const bibleBookMap: Record<string, string> = {
  創世記: 'GEN',
  出埃及記: 'EXO',
  利未記: 'LEV',
  民數記: 'NUM',
  申命記: 'DEU',
  約書亞記: 'JOS',
  士師記: 'JDG',
  路得記: 'RUT',
  撒母耳記上: '1SA',
  撒母耳記下: '2SA',
  列王紀上: '1KI',
  列王紀下: '2KI',
  歷代志上: '1CH',
  歷代志下: '2CH',
  以斯拉記: 'EZR',
  尼希米記: 'NEH',
  以斯帖記: 'EST',
  約伯記: 'JOB',
  詩篇: 'PSA',
  箴言: 'PRO',
  傳道書: 'ECC',
  雅歌: 'SNG',
  以賽亞書: 'ISA',
  耶利米書: 'JER',
  耶利米哀歌: 'LAM',
  以西結書: 'EZK',
  但以理書: 'DAN',
  何西阿書: 'HOS',
  約珥書: 'JOL',
  阿摩司書: 'AMO',
  俄巴底亞書: 'OBA',
  約拿書: 'JON',
  彌迦書: 'MIC',
  那鴻書: 'NAM',
  哈巴谷書: 'HAB',
  西番雅書: 'ZEP',
  哈該書: 'HAG',
  撒迦利亞書: 'ZEC',
  瑪拉基書: 'MAL',
  馬太福音: 'MAT',
  馬可福音: 'MRK',
  路加福音: 'LUK',
  約翰福音: 'JHN',
  使徒行傳: 'ACT',
  羅馬書: 'ROM',
  哥林多前書: '1CO',
  哥林多後書: '2CO',
  加拉太書: 'GAL',
  以弗所書: 'EPH',
  腓立比書: 'PHP',
  歌羅西書: 'COL',
  帖撒羅尼迦前書: '1TH',
  帖撒羅尼迦後書: '2TH',
  提摩太前書: '1TI',
  提摩太後書: '2TI',
  提多書: 'TIT',
  腓利門書: 'PHM',
  希伯來書: 'HEB',
  雅各書: 'JAS',
  彼得前書: '1PE',
  彼得後書: '2PE',
  約翰一書: '1JN',
  約翰二書: '2JN',
  約翰三書: '3JN',
  猶大書: 'JUD',
  啟示錄: 'REV',
};
