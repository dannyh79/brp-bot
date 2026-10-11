import { Plan, toLocaleDateObject } from '@/readingPlans';

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

export const toTextMessage = (plan: Plan): string => {
  const { date, dayOfWeek } = toLocaleDateObject(plan.date);
  const [personalPrayer, ...mainPrayer] = plan.prayer.split('\n');
  const video = holyWeekVideos[plan.date];
  const sections: [Plan['subsectionBlocks'][number]['section'], string, string][] = [
    ['praise', '讚美', [plan.praise.content, plan.praise.scope].join('\n')],
    ['repentance', '悔改', [repentancePrelude, plan.repentence].join('\n\n')],
    [
      'devotional',
      '反思',
      [
        ...plan.devotional.scope.map((scope, index) =>
          [scope, plan.devotional.link[index]].filter(Boolean).join('\n'),
        ),
        plan.devotional.content.join('\n'),
      ].join('\n\n'),
    ],
    ['prayer', '祈求', [personalPrayer, mainPrayer.join('\n')].join('\n\n')],
  ];
  const blocksFor = (
    section: (typeof sections)[number][0],
    position: 'before_content' | 'after_content',
  ) =>
    plan.subsectionBlocks
      .filter((block) => block.section === section && block.position === position)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((block) =>
        [
          block.title,
          [block.scriptureContent, block.scriptureScope].filter(Boolean).join(' '),
          block.content,
        ]
          .filter(Boolean)
          .join('\n'),
      );

  return [
    '好好靈修 Daily Devotion',
    ...(video ? [`聖週好好靈修導讀\n${video}`] : []),
    `${date} ${dayOfWeek}`,
    ...sections.map(([section, title, content]) =>
      [
        title,
        ...blocksFor(section, 'before_content'),
        content,
        ...blocksFor(section, 'after_content'),
      ].join('\n\n'),
    ),
  ].join('\n\n');
};

export const splitMessage = (text: string): string[] => {
  const parts: string[] = [];
  while (text.length > 4096) {
    let end = 4096;
    // Keep a surrogate pair together even at Telegram's size boundary.
    if (text.charCodeAt(end - 1) >= 0xd800 && text.charCodeAt(end - 1) <= 0xdbff) end--;
    const newline = text.lastIndexOf('\n', end - 1);
    if (newline > 0) end = newline + 1;
    parts.push(text.slice(0, end));
    text = text.slice(end);
  }
  if (text) parts.push(text);
  return parts;
};
