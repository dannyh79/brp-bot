import { Plan, toLocaleDateObject } from '@/readingPlans';
import { TelegramFormat, TelegramMessage } from './types';

/** Telegram sendMessage text limit after entity parsing. See https://core.telegram.org/bots/api#sendmessage. */
export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const repentancePrelude =
  '聖靈，求祢今日光照我的生命。\n顯明那些祢命定我去行，我卻尚未行的事；\n也顯明那些祢不喜悅，我卻仍執意去行的事。';

// Keep Telegram's presentation independent of LINE's formatter.
const holyWeekVideos: Record<string, string | undefined> = {
  '2026-03-29':
    'https://drive.google.com/file/d/12NBd3Q5sNbsoM2PsW2GQ34il5zeI1-2x/view?usp=share_link',
  '2026-03-30':
    'https://drive.google.com/file/d/1vP_IUzGZ67Le1ezd1Ry_6Ot_tYLKCgcK/view?usp=share_link',
  '2026-03-31':
    'https://drive.google.com/file/d/1_dLF3UaJsrdy9BhdfaxwS6SIm3V7CsBS/view?usp=share_link',
  '2026-04-01':
    'https://drive.google.com/file/d/1lInHFzEMODynAyfX3bFylxYlLwTk28hq/view?usp=share_link',
  '2026-04-02':
    'https://drive.google.com/file/d/1tS_IEVv-uxnM3gP4qq0MGQCjAxlRiWlW/view?usp=share_link',
  '2026-04-03':
    'https://drive.google.com/file/d/10q3LfNf42Pepkky7d3UH4NmWkl1sAqHL/view?usp=share_link',
  '2026-04-04':
    'https://drive.google.com/file/d/1faz7SpfxktQjI2g1QEqpNKsn25J3djZw/view?usp=share_link',
  '2026-04-05':
    'https://drive.google.com/file/d/1sWJ8NEj-FhdZYSbC8XW_2-6K0mub7K5i/view?usp=share_link',
};

export const toTextMessage = (plan: Plan): TelegramMessage => {
  const { date, dayOfWeek } = toLocaleDateObject(plan.date);
  const [month, day] = date.split('/');
  const [personalPrayer, ...mainPrayer] = plan.prayer.split('\n');
  const video = holyWeekVideos[plan.date];
  const message: TelegramMessage = { text: '', entities: [] };
  const append = (text: string, format?: TelegramFormat) => {
    const offset = message.text.length;
    message.text += text;
    if (format && text.length) message.entities.push({ ...format, offset, length: text.length });
  };
  const quote = (content?: string, scope?: string) =>
    append([content, scope ? `— ${scope}` : ''].filter(Boolean).join('\n'), { type: 'blockquote' });
  const renderBlock = (block: Plan['subsectionBlocks'][number]) => {
    if (block.title) append(`〈${block.title}〉\n`);
    if (block.scriptureContent || block.scriptureScope) {
      quote(block.scriptureContent, block.scriptureScope);
      append('\n\n');
    }
    append(block.content);
  };
  const sections: [Plan['subsectionBlocks'][number]['section'], string, () => void][] = [
    ['praise', '讚美', () => quote(plan.praise.content, plan.praise.scope)],
    ['repentance', '悔改', () => append([repentancePrelude, plan.repentence].join('\n\n'))],
    [
      'devotional',
      '反思',
      () => {
        plan.devotional.scope.forEach((scope, index) => {
          if (index) append(' · ');
          const url = plan.devotional.link[index];
          append(scope, url ? { type: 'text_link', url } : undefined);
        });
        append('\n\n' + plan.devotional.content.join('\n\n'));
      },
    ],
    ['prayer', '祈求', () => append([personalPrayer, mainPrayer.join('\n')].join('\n\n'))],
  ];
  const blocksFor = (
    section: (typeof sections)[number][0],
    position: 'before_content' | 'after_content',
  ) =>
    plan.subsectionBlocks
      .filter((block) => block.section === section && block.position === position)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  append('好好靈修', { type: 'bold' });
  append(`\n${month}月${day}日・${dayOfWeek}｜Daily Devotion`);
  if (video) {
    append('\n\n\n');
    append('聖週好好靈修導讀', { type: 'bold' });
    append('\n');
    append('點此觀看導讀影片', { type: 'text_link', url: video });
  }
  for (const [section, title, render] of sections) {
    append('\n\n\n');
    append(`── ${title} ──`, { type: 'bold' });
    append('\n');
    for (const block of blocksFor(section, 'before_content')) {
      renderBlock(block);
      append('\n\n\n');
    }
    render();
    for (const block of blocksFor(section, 'after_content')) {
      append('\n\n\n');
      renderBlock(block);
    }
  }
  return message;
};

/** Text and entity offsets both use UTF-16 units. See https://core.telegram.org/bots/api#messageentity. */
export const splitMessage = ({ text, entities }: TelegramMessage): TelegramMessage[] => {
  const parts: TelegramMessage[] = [];
  let offset = 0;
  while (offset < text.length) {
    let end = Math.min(offset + TELEGRAM_MESSAGE_MAX_LENGTH, text.length);
    if (end < text.length) {
      // Keep a surrogate pair together even at Telegram's size boundary.
      if (text.charCodeAt(end - 1) >= 0xd800 && text.charCodeAt(end - 1) <= 0xdbff) end--;
      const newline = text.lastIndexOf('\n', end - 1);
      if (newline > offset) end = newline + 1;
    }
    parts.push({
      text: text.slice(offset, end),
      entities: entities.flatMap((entity) => {
        const start = Math.max(offset, entity.offset);
        const length = Math.min(end, entity.offset + entity.length) - start;
        return length > 0 ? [{ ...entity, offset: start - offset, length }] : [];
      }),
    });
    offset = end;
  }
  return parts;
};
