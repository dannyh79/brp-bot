import { GetPlanOutput, toLocaleDateObject } from '@/readingPlans';
import { LineMessage } from './types';

const repentencePrelude =
  '聖靈，求祢今日光照我的生命。\n顯明那些祢命定我去行，我卻尚未行的事；\n也顯明那些祢不喜悅，我卻仍執意去行的事。';

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

export const toBubbleMessage = (arg: NonNullable<GetPlanOutput>): LineMessage => {
  const { date: dateFromData, praise, repentence, devotional, prayer } = arg;
  const { date, dayOfWeek } = toLocaleDateObject(dateFromData);
  const [personalPrayer, ...mainPrayer] = prayer.split('\n');
  const holyWeekVideo = holyWeekVideos[dateFromData];

  return {
    type: 'flex',
    altText: `Bible Reading Plan for ${dateFromData}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '好好靈修 Daily Devotion',
                color: '#1D292E',
                size: 'xl',
                weight: 'bold',
              },
            ],
            backgroundColor: '#FFCC32',
            paddingTop: 'xl',
            paddingBottom: 'xl',
            paddingStart: 'lg',
            paddingEnd: 'lg',
            cornerRadius: 'lg',
          },
        ],
        spacing: 'md',
        paddingTop: 'lg',
        paddingStart: 'lg',
        paddingEnd: 'lg',
        paddingBottom: 'sm',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              ...(holyWeekVideo
                ? [
                    {
                      type: 'box' as const,
                      layout: 'vertical' as const,
                      backgroundColor: '#1D292E',
                      cornerRadius: 'lg',
                      paddingAll: 'md',
                      contents: [
                        {
                          type: 'text' as const,
                          text: '聖週好好靈修導讀',
                          color: '#FFFFFF',
                          weight: 'bold' as const,
                          size: 'sm' as const,
                        },
                        {
                          type: 'button' as const,
                          action: {
                            type: 'uri' as const,
                            label: '點此觀看導讀影片',
                            uri: holyWeekVideo,
                          },
                          style: 'link' as const,
                          color: '#FFCC32',
                          height: 'sm' as const,
                        },
                      ],
                    },
                    {
                      type: 'filler' as const,
                    },
                  ]
                : []),
              {
                type: 'text',
                text: `${date} ${dayOfWeek}`,
                color: '#5D5D5D',
                size: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '讚',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '美',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    alignItems: 'flex-end',
                    offsetBottom: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        cornerRadius: '30px',
                        height: '12px',
                        width: '12px',
                        backgroundColor: '#1D292E',
                      },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            width: '2px',
                            backgroundColor: '#1D292E',
                          },
                        ],
                        flex: 1,
                        justifyContent: 'center',
                      },
                    ],
                    width: '12px',
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: [praise.content, praise.scope].join('\n'),
                        flex: 8,
                        size: 'xs',
                        color: '#5D5D5D',
                        wrap: true,
                        lineSpacing: '5px',
                        weight: 'bold',
                      },
                    ],
                    flex: 14,
                    paddingBottom: 'md',
                    paddingStart: 'xl',
                  },
                ],
                spacing: 'md',
                paddingBottom: 'md',
                paddingTop: 'sm',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '悔',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '改',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    alignItems: 'flex-end',
                    offsetBottom: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        cornerRadius: '30px',
                        height: '12px',
                        width: '12px',
                        backgroundColor: '#1D292E',
                      },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            width: '2px',
                            backgroundColor: '#1D292E',
                          },
                        ],
                        flex: 1,
                        justifyContent: 'center',
                      },
                    ],
                    width: '12px',
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: repentencePrelude,
                            gravity: 'center',
                            flex: 8,
                            size: 'xs',
                            color: '#FFFFFF',
                            wrap: true,
                            lineSpacing: '5px',
                          },
                        ],
                        flex: 8,
                        backgroundColor: '#1D292E',
                        paddingStart: 'xl',
                        paddingEnd: 'xl',
                        paddingTop: 'md',
                        paddingBottom: 'md',
                        cornerRadius: 'lg',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: repentence,
                            gravity: 'center',
                            flex: 8,
                            size: 'xs',
                            color: '#5D5D5D',
                            wrap: true,
                            lineSpacing: '5px',
                          },
                        ],
                        paddingStart: 'xl',
                      },
                    ],
                    flex: 14,
                    paddingTop: 'sm',
                    spacing: 'md',
                    paddingBottom: 'md',
                  },
                ],
                spacing: 'md',
                paddingBottom: 'md',
                paddingTop: 'sm',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '反',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '思',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    alignItems: 'flex-end',
                    offsetBottom: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        cornerRadius: '30px',
                        height: '12px',
                        width: '12px',
                        backgroundColor: '#1D292E',
                      },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            width: '2px',
                            backgroundColor: '#1D292E',
                          },
                        ],
                        flex: 1,
                        justifyContent: 'center',
                      },
                    ],
                    width: '12px',
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      ...devotional.scope.map((scope, index) =>
                        toScopeWithLink({ scope, link: devotional.link[index] }),
                      ),
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: devotional.content.join('\n'),
                            gravity: 'center',
                            flex: 8,
                            size: 'xs',
                            color: '#FFFFFF',
                            wrap: true,
                            lineSpacing: '5px',
                          },
                        ],
                        flex: 8,
                        backgroundColor: '#1D292E',
                        paddingStart: 'xl',
                        paddingEnd: 'xl',
                        paddingTop: 'md',
                        paddingBottom: 'md',
                        cornerRadius: 'lg',
                      },
                    ],
                    flex: 14,
                    spacing: 'md',
                    paddingBottom: 'md',
                  },
                ],
                spacing: 'md',
                paddingBottom: 'md',
                paddingTop: 'sm',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '祈',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '求',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    alignItems: 'flex-end',
                    offsetBottom: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        cornerRadius: '30px',
                        height: '12px',
                        width: '12px',
                        backgroundColor: '#1D292E',
                      },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            width: '2px',
                            backgroundColor: '#1D292E',
                          },
                        ],
                        flex: 1,
                        justifyContent: 'center',
                      },
                    ],
                    width: '12px',
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: personalPrayer,
                            gravity: 'center',
                            flex: 8,
                            size: 'xs',
                            color: '#FFFFFF',
                            wrap: true,
                            lineSpacing: '5px',
                          },
                        ],
                        flex: 8,
                        backgroundColor: '#1D292E',
                        paddingStart: 'xl',
                        paddingEnd: 'xl',
                        paddingTop: 'md',
                        paddingBottom: 'md',
                        cornerRadius: 'lg',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: mainPrayer.join('\n'),
                            gravity: 'center',
                            flex: 8,
                            size: 'xs',
                            color: '#5D5D5D',
                            wrap: true,
                            lineSpacing: '5px',
                          },
                        ],
                        paddingStart: 'xl',
                      },
                    ],
                    flex: 14,
                    paddingTop: 'sm',
                    spacing: 'md',
                  },
                ],
                spacing: 'md',
                paddingBottom: 'md',
                paddingTop: 'sm',
              },
            ],
            spacing: 'lg',
            backgroundColor: '#EEF0F4',
            cornerRadius: 'lg',
            paddingAll: 'lg',
          },
        ],
        paddingBottom: 'lg',
        paddingStart: 'lg',
        paddingEnd: 'lg',
        paddingTop: 'sm',
      },
    },
  };
};

const toScopeWithLink = ({ scope, link }: { scope: string; link: string }) => ({
  type: 'box' as const,
  layout: 'vertical' as const,
  contents: [
    {
      type: 'text' as const,
      text: scope,
      size: 'lg' as const,
      color: '#5D5D5D',
      wrap: true,
      lineSpacing: '10px',
      weight: 'bold' as const,
      gravity: 'center' as const,
    },
    {
      type: 'box' as const,
      layout: 'horizontal' as const,
      contents: [
        {
          type: 'button' as const,
          action: {
            type: 'uri' as const,
            label: 'YouVersion 連結',
            uri: link,
          },
          adjustMode: 'shrink-to-fit' as const,
          style: 'link' as const,
          height: 'sm' as const,
          flex: 1,
        },
        {
          type: 'filler' as const,
          flex: 1,
        },
      ],
      flex: 1,
      offsetEnd: 'lg' as const,
    },
  ],
  flex: 8,
});
