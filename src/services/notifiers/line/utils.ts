import { GetPlanOutput } from '@/readingPlans';
import { LineMessage } from './types';

const formatDateString = (str: string): string => {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${str}`);
  }

  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  return `${month}/${day} ${dayOfWeek}`;
};

export const toBubbleMessage = (arg: GetPlanOutput): LineMessage => {
  const { date, praise, repentence, devotional, prayer } = arg;

  return {
    type: 'flex',
    altText: `Bible Reading Plan for ${date}`,
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
                text: '好好靈修',
                color: '#1D292E',
                size: 'xl',
                flex: 4,
                weight: 'regular',
              },
            ],
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#FFCC32',
        spacing: 'md',
        paddingTop: '22px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: formatDateString(date),
            color: '#b7b7b7',
            size: 'xs',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '讚美',
                size: 'sm',
                gravity: 'center',
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'filler',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [],
                    cornerRadius: '30px',
                    height: '12px',
                    width: '12px',
                    borderColor: '#6486E3',
                    borderWidth: '2px',
                  },
                  {
                    type: 'filler',
                  },
                ],
                flex: 0,
              },
              // NOTE: Placeholder for layout
              {
                type: 'text',
                text: ' ',
                gravity: 'center',
                flex: 8,
                size: 'sm',
              },
            ],
            spacing: 'lg',
            cornerRadius: '30px',
            margin: 'xl',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'filler',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'filler',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        width: '2px',
                        backgroundColor: '#6486E3',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 1,
                  },
                ],
                width: '12px',
              },
              {
                type: 'text',
                text: `${praise.content} (${praise.scope})`,
                gravity: 'center',
                flex: 8,
                size: 'xs',
                color: '#8c8c8c',
                wrap: true,
              },
            ],
            spacing: 'lg',
            paddingBottom: 'md',
            paddingTop: 'sm',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '悔改',
                    gravity: 'center',
                    size: 'sm',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'filler',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [],
                    cornerRadius: '30px',
                    width: '12px',
                    height: '12px',
                    borderWidth: '2px',
                    borderColor: '#6486E3',
                  },
                  {
                    type: 'filler',
                  },
                ],
                flex: 0,
              },
              // NOTE: Placeholder for layout
              {
                type: 'text',
                text: ' ',
                gravity: 'center',
                flex: 8,
                size: 'sm',
              },
            ],
            spacing: 'lg',
            cornerRadius: '30px',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'filler',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'filler',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        width: '2px',
                        backgroundColor: '#6486E3',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 1,
                  },
                ],
                width: '12px',
              },
              {
                type: 'text',
                text: repentence,
                gravity: 'center',
                flex: 8,
                size: 'xs',
                color: '#8c8c8c',
                wrap: true,
              },
            ],
            spacing: 'lg',
            paddingTop: 'sm',
            paddingBottom: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '反思',
                    gravity: 'center',
                    size: 'sm',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'filler',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [],
                    cornerRadius: '30px',
                    width: '12px',
                    height: '12px',
                    borderWidth: '2px',
                    borderColor: '#6486E3',
                  },
                  {
                    type: 'filler',
                  },
                ],
                flex: 0,
              },
              // NOTE: Placeholder for layout
              {
                type: 'text',
                text: ' ',
                gravity: 'center',
                flex: 8,
                size: 'sm',
              },
            ],
            spacing: 'lg',
            cornerRadius: '30px',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'filler',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'filler',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        width: '2px',
                        backgroundColor: '#6486E3',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 1,
                  },
                ],
                width: '12px',
              },
              {
                type: 'box',
                layout: 'vertical',
                flex: 8,
                contents: [
                  {
                    type: 'text',
                    text: devotional.scope,
                    gravity: 'center',
                    size: 'sm',
                  },
                  {
                    type: 'text',
                    text: devotional.content.join('\n'),
                    gravity: 'center',
                    size: 'xs',
                    color: '#8c8c8c',
                    wrap: true,
                  },
                ],
              },
            ],
            spacing: 'lg',
            paddingTop: 'sm',
            paddingBottom: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '祈求',
                    gravity: 'center',
                    size: 'sm',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'filler',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [],
                    cornerRadius: '30px',
                    width: '12px',
                    height: '12px',
                    borderWidth: '2px',
                    borderColor: '#6486E3',
                  },
                  {
                    type: 'filler',
                  },
                ],
                flex: 0,
              },
              // NOTE: Placeholder for layout
              {
                type: 'text',
                text: ' ',
                gravity: 'center',
                flex: 8,
                size: 'sm',
              },
            ],
            spacing: 'lg',
            cornerRadius: '30px',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'filler',
                  },
                ],
                flex: 1,
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'filler',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        width: '2px',
                        backgroundColor: '#6486E3',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 1,
                  },
                ],
                width: '12px',
              },
              {
                type: 'text',
                text: prayer,
                gravity: 'center',
                flex: 8,
                size: 'xs',
                color: '#8c8c8c',
                wrap: true,
              },
            ],
            spacing: 'lg',
            paddingTop: 'sm',
          },
        ],
      },
    },
  };
};
