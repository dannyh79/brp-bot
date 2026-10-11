import { PlanSchema } from '@/readingPlans';
import { splitMessage, toTextMessage } from '@/services/notifiers/telegram/utils';

const plan = PlanSchema.parse({
  date: '2025-01-01',
  praise: { content: '你們要稱謝耶和華', scope: '歷代志上 16:34 CCB' },
  devotional: { scope: ['出埃及記 第 8 章', '詩篇 第 1 章'], link: [] },
});

describe('Telegram daily devotion acceptance', () => {
  it('presents all four sections, scripture links, and prayers in reading order', () => {
    const text = toTextMessage(plan);
    const contents = [
      '好好靈修 Daily Devotion',
      '1/1 星期三',
      '讚美',
      plan.praise.content,
      plan.praise.scope,
      '悔改',
      '聖靈，求祢今日光照我的生命。',
      plan.repentence,
      '反思',
      plan.devotional.scope[0],
      plan.devotional.link[0],
      plan.devotional.scope[1],
      plan.devotional.link[1],
      plan.devotional.content.join('\n'),
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
    const text = toTextMessage({
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
    expect(text).toContain('經文 詩篇 66:16');
  });

  it('includes the date-specific Holy Week video', () => {
    const text = toTextMessage({ ...plan, date: '2026-03-29' });
    expect(text).toContain('聖週好好靈修導讀');
    expect(text).toContain(
      'https://drive.google.com/file/d/12NBd3Q5sNbsoM2PsW2GQ34il5zeI1-2x/view?usp=share_link',
    );
  });

  it.each([
    '字'.repeat(4096),
    '字'.repeat(4095) + '🙏' + '字'.repeat(5000),
    '一段經文\n'.repeat(2000),
  ])('keeps every character in ordered parts within the message limit', (text) => {
    const parts = splitMessage(text);
    expect(parts.join('')).toBe(text);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      expect(part.length).toBeLessThanOrEqual(4096);
      expect(part.isWellFormed()).toBe(true);
    }
  });

  it('prefers line boundaries when splitting and produces no empty messages', () => {
    expect(splitMessage('')).toEqual([]);
    expect(splitMessage('a'.repeat(3000) + '\n' + 'b'.repeat(3000))).toEqual([
      'a'.repeat(3000) + '\n',
      'b'.repeat(3000),
    ]);
  });
});
