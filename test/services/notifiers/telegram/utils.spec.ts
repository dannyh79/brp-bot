import { PlanSchema } from '@/readingPlans';
import { splitMessage, toTextMessage } from '@/services/notifiers/telegram/utils';

const plan = PlanSchema.parse({
  date: '2025-01-01',
  praise: { content: '你們要稱謝耶和華', scope: '歷代志上 16:34 CCB' },
  devotional: { scope: ['出埃及記 第 8 章', '詩篇 第 1 章'], link: [] },
});

describe('Telegram daily devotion acceptance', () => {
  it('presents all four sections, scripture links, and prayers in reading order', () => {
    const { text, entities } = toTextMessage(plan);
    const contents = [
      '好好靈修',
      '1月1日・星期三｜Daily Devotion',
      '讚美',
      plan.praise.content,
      plan.praise.scope,
      '悔改',
      '聖靈，求祢今日光照我的生命。',
      plan.repentence,
      '反思',
      plan.devotional.scope[0],
      plan.devotional.scope[1],
      plan.devotional.content.join('\n\n'),
      '祈求',
      plan.prayer.split('\n')[0],
      plan.prayer.split('\n').slice(1).join('\n'),
    ];
    let previous = -1;
    for (const content of contents) {
      const position = text.indexOf(content);
      expect(position, content).toBeGreaterThan(previous);
      previous = position;
    }
    expect(
      entities.filter((entity) => entity.type === 'text_link').map((entity) => entity.url),
    ).toEqual(plan.devotional.link);
    expect(
      entities
        .filter((entity) => entity.type === 'bold')
        .map((entity) => text.slice(entity.offset, entity.offset + entity.length)),
    ).toEqual(['好好靈修', '── 讚美 ──', '── 悔改 ──', '── 反思 ──', '── 祈求 ──']);
    for (const title of ['讚美', '悔改', '反思', '祈求']) {
      expect(text).toContain('\n\n\n── ' + title + ' ──\n');
      expect(text).not.toContain('── ' + title + ' ──\n\n');
    }
    expect(text).toContain(
      '1. 你覺得神透過今天的經文對你說什麼呢？\n\n2. 有什麼你可以做出的行動或改變呢？',
    );
    expect(text).not.toContain('今日經文');
    expect(text).not.toContain('①');
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('聖週好好靈修導讀');
  });

  it('places subsection metadata before/after each section and orders blocks', () => {
    const sections = ['praise', 'repentance', 'devotional', 'prayer'] as const;
    const contents = [
      plan.praise.content,
      plan.repentence,
      plan.devotional.scope[0],
      plan.prayer.split('\n')[0],
    ];
    const { text, entities } = toTextMessage({
      ...plan,
      subsectionBlocks: sections.flatMap((section) => [
        { section, position: 'after_content', content: `${section}-after`, sortOrder: 1 },
        { section, position: 'before_content', content: `${section}-second`, sortOrder: 2 },
        {
          section,
          position: 'before_content',
          content: `${section}-first`,
          sortOrder: 1,
          title: `${section}-title`,
          scriptureContent: '經文',
          scriptureScope: '詩篇 66:16',
        },
      ]),
    });
    sections.forEach((section, index) => {
      expect(text.indexOf(`${section}-title`)).toBeLessThan(text.indexOf(`${section}-first`));
      expect(text.indexOf(`${section}-first`)).toBeLessThan(text.indexOf(`${section}-second`));
      expect(text.indexOf(`${section}-second`)).toBeLessThan(text.indexOf(contents[index]));
      expect(text.indexOf(contents[index])).toBeLessThan(text.indexOf(`${section}-after`));
    });
    expect(text).toContain('經文\n— 詩篇 66:16');
    expect(text).toContain('\n〈prayer-title〉\n經文');
    const subsectionTitleOffset = text.indexOf('〈prayer-title〉');
    expect(
      entities.some(
        (entity) =>
          entity.offset <= subsectionTitleOffset &&
          entity.offset + entity.length > subsectionTitleOffset,
      ),
    ).toBe(false);
    expect(entities.filter((entity) => entity.type === 'blockquote')).toHaveLength(5);
  });

  it('includes the date-specific Holy Week video', () => {
    const { text, entities } = toTextMessage({ ...plan, date: '2026-03-29' });
    expect(text).toContain('聖週好好靈修導讀');
    expect(
      entities.filter((entity) => entity.type === 'text_link').map((entity) => entity.url),
    ).toContain(
      'https://drive.google.com/file/d/12NBd3Q5sNbsoM2PsW2GQ34il5zeI1-2x/view?usp=share_link',
    );
  });

  it.each([
    '字'.repeat(4096),
    '字'.repeat(4095) + '🙏' + '字'.repeat(5000),
    '一段經文\n'.repeat(2000),
  ])('keeps every character in ordered parts within the message limit', (text) => {
    const parts = splitMessage({ text, entities: [] });
    expect(parts.map((part) => part.text).join('')).toBe(text);
    for (const part of parts) {
      expect(part.text.length).toBeGreaterThan(0);
      expect(part.text.length).toBeLessThanOrEqual(4096);
      expect(part.text.isWellFormed()).toBe(true);
    }
  });

  it('prefers line boundaries when splitting and produces no empty messages', () => {
    expect(splitMessage({ text: '', entities: [] })).toEqual([]);
    expect(
      splitMessage({ text: 'a'.repeat(3000) + '\n' + 'b'.repeat(3000), entities: [] }),
    ).toEqual([
      { text: 'a'.repeat(3000) + '\n', entities: [] },
      { text: 'b'.repeat(3000), entities: [] },
    ]);
  });

  it('keeps source text literal and preserves question prefixes without adding formatting', () => {
    const content = '1. <b>神 & 我</b>\n2. 下一步 _行動_';
    const { text, entities } = toTextMessage({
      ...plan,
      devotional: { ...plan.devotional, content: [content] },
    });
    expect(text).toContain(content);
    const start = text.indexOf(content);
    expect(
      entities.some(
        (entity) => entity.offset < start + content.length && entity.offset + entity.length > start,
      ),
    ).toBe(false);
  });

  it('clips and rebases formatting across parts using UTF-16 offsets without losing text', () => {
    const parts = splitMessage({
      text: 'a'.repeat(4095) + '🙏tail',
      entities: [
        { type: 'blockquote', offset: 0, length: 4101 },
        { type: 'bold', offset: 4094, length: 7 },
        { type: 'text_link', offset: 4095, length: 6, url: 'https://www.bible.com/' },
      ],
    });
    expect(parts.map((part) => part.text)).toEqual(['a'.repeat(4095), '🙏tail']);
    expect(parts[0].entities).toEqual([
      { type: 'blockquote', offset: 0, length: 4095 },
      { type: 'bold', offset: 4094, length: 1 },
    ]);
    expect(parts[1].entities).toEqual([
      { type: 'blockquote', offset: 0, length: 6 },
      { type: 'bold', offset: 0, length: 6 },
      { type: 'text_link', offset: 0, length: 6, url: 'https://www.bible.com/' },
    ]);
  });
});
