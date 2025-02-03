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
                align: 'center',
                contents: [],
                offsetTop: '7%',
                offsetEnd: '7%',
              },
              {
                type: 'text',
                text: formatDateString(date).split(' ')[0],
                margin: 'none',
                align: 'start',
                offsetBottom: '15%',
                offsetStart: '6%',
              },
              {
                type: 'text',
                text: formatDateString(date).split(' ')[1],
                offsetBottom: '9%',
                align: 'start',
                offsetStart: 'lg',
              },
              {
                type: 'text',
                text: 'DAILY',
                offsetBottom: '43%',
                offsetStart: '70%',
              },
              {
                type: 'text',
                text: 'DEVOTION',
                offsetBottom: '37%',
                offsetStart: '70%',
              },
              {
                type: 'text',
                text: 'x',
                offsetStart: '60%',
                offsetBottom: '72%',
                size: 'xxl',
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
            type: 'box',
            layout: 'vertical',
            contents: [
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
                        align: 'center',
                        offsetTop: '25px',
                        offsetBottom: 'none',
                        offsetStart: 'none',
                      },
                      {
                        type: 'text',
                        text: '美',
                        size: 'lg',
                        align: 'center',
                        offsetTop: '45px',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    text: `${praise.content}\n(${praise.scope})`,
                    flex: 9,
                    size: 'xs',
                    color: '#8c8c8c',
                    wrap: true,
                    gravity: 'center',
                    margin: 'xxl',
                  },
                ],
                offsetTop: 'xl',
              },
              {
                type: 'text',
                text: '───────────────────',
                size: 'xs',
                color: '#FFFFFF',
                align: 'center',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'none',
            paddingTop: 'none',
            cornerRadius: 'md',
            backgroundColor: '#C7CADA',
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
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '悔',
                        size: 'lg',
                        align: 'center',
                        offsetTop: '5px',
                        offsetBottom: 'none',
                        offsetStart: 'none',
                      },
                      {
                        type: 'text',
                        text: '改',
                        size: 'lg',
                        align: 'center',
                        offsetTop: '15px',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    text: repentence,
                    flex: 9,
                    size: 'xs',
                    color: '#8c8c8c',
                    wrap: true,
                    gravity: 'center',
                    margin: 'xxl',
                  },
                ],
                offsetTop: 'xl',
              },
              {
                type: 'text',
                text: '───────────────────',
                size: 'xs',
                color: '#C7CADA',
                align: 'center',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'none',
            paddingTop: 'none',
            cornerRadius: 'md',
            backgroundColor: '#FFFFFF',
            margin: 'xxl',
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
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '反',
                        size: 'lg',
                        margin: 'none',
                        offsetStart: 'md',
                        offsetTop: '30px',
                      },
                      {
                        type: 'text',
                        text: '思',
                        size: 'lg',
                        align: 'start',
                        offsetStart: 'md',
                        offsetTop: '40px',
                      },
                      {
                        type: 'text',
                        text: devotional.scope,
                        flex: 9,
                        size: 'sm',
                        margin: 'none',
                        wrap: true,
                        action: {
                          type: 'postback',
                          label: 'action',
                          data: 'hello',
                        },
                        offsetStart: '50px',
                        position: 'absolute',
                        offsetTop: '30px',
                      },
                      {
                        type: 'text',
                        text: devotional.content.join('\n'),
                        size: 'xs',
                        color: '#8c8c8c',
                        wrap: true,
                        flex: 9,
                        align: 'start',
                        gravity: 'center',
                        offsetStart: '50px',
                        margin: 'xs',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'text',
                text: '───────────────────',
                size: 'xs',
                offsetBottom: '12px',
                color: '#FFFFFF',
                align: 'center',
                offsetStart: '10px',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'none',
            paddingTop: 'none',
            cornerRadius: 'md',
            backgroundColor: '#C7CADA',
            offsetTop: 'none',
            margin: 'xxl',
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
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '祈',
                        size: 'lg',
                        align: 'center',
                        offsetTop: '80px',
                      },
                      {
                        type: 'text',
                        text: '求',
                        size: 'lg',
                        align: 'center',
                        offsetTop: '95px',
                      },
                    ],
                    offsetBottom: '50px',
                  },
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
                        backgroundColor: '#E2E2E2',
                        height: '100px',
                        offsetTop: '50px',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: prayer,
                    flex: 9,
                    size: 'xs',
                    color: '#8c8c8c',
                    wrap: true,
                    gravity: 'center',
                    margin: 'xxl',
                  },
                ],
                offsetTop: 'xl',
              },
              {
                type: 'text',
                text: '───────────────────',
                size: 'xs',
                color: '#C7CADA',
                align: 'center',
                offsetStart: '10px',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'none',
            paddingTop: 'none',
            cornerRadius: 'md',
            backgroundColor: '#FFFFFF',
            offsetTop: 'xxl',
          },
        ],
      },
    },
  };
};
