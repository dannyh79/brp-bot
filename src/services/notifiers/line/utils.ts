import { GetPlanOutput } from '@/readingPlans';
import { LineMessage } from './types';

const formatDateString = (str: string): { date: string; dayOfWeek: string } => {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${str}`);
  }

  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  return {
    date: `${month}/${day}`,
    dayOfWeek,
  };
};

export const toBubbleMessage = (arg: GetPlanOutput): LineMessage => {
  const { date: dateFromData, praise, repentence, devotional, prayer } = arg;
  const { date, dayOfWeek } = formatDateString(dateFromData);
  const [personalPrayer, ...mainPrayer] = prayer.split('\n');

  return {
    type: 'flex',
    altText: `Bible Reading Plan for ${dateFromData}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '好好靈修',
                color: '#FFFFFF',
                size: 'xxl',
                weight: 'bold',
                flex: 3,
                align: 'end',
              },
              {
                type: 'text',
                text: 'X',
                size: 'md',
                color: '#FFFFFF',
                align: 'center',
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'DAILY',
                    color: '#FFFFFF',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: 'DEVOTION',
                    color: '#FFFFFF',
                    weight: 'bold',
                  },
                ],
                flex: 5,
              },
            ],
            alignItems: 'center',
          },
        ],
        paddingAll: 'xl',
        backgroundColor: '#FFCC32',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${date} ${dayOfWeek}`,
            color: '#3C5464',
            offsetBottom: 'md',
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
                        text: '讚',
                        color: '#FFFFFF',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '美',
                        color: '#FFFFFF',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    spacing: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `${praise.content}(${praise.scope})`,
                    flex: 11,
                    size: 'xs',
                    color: '#FFFFFF',
                    style: 'italic',
                    wrap: true,
                  },
                ],
                paddingStart: 'md',
                paddingEnd: 'md',
                spacing: 'lg',
              },
            ],
            spacing: 'lg',
            cornerRadius: 'md',
            backgroundColor: '#3C5C64',
            paddingTop: 'lg',
            paddingBottom: 'md',
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
                        color: '#1D292E',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '改',
                        color: '#1D292E',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    spacing: 'sm',
                  },
                  {
                    type: 'text',
                    text: repentence,
                    flex: 11,
                    size: 'xs',
                    color: '#1D292E',
                    wrap: true,
                  },
                ],
                spacing: 'lg',
                paddingStart: 'md',
                paddingEnd: 'md',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'md',
            paddingTop: 'lg',
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
                        color: '#FFFFFF',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '思',
                        color: '#FFFFFF',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: devotional.scope,
                        color: '#FFFFFF',
                        size: 'lg',
                        weight: 'bold',
                        wrap: true,
                      },
                      {
                        type: 'text',
                        text: devotional.content.join('\n'),
                        color: '#FFFFFF',
                        size: 'xs',
                        wrap: true,
                        flex: 9,
                      },
                    ],
                    flex: 11,
                    paddingTop: 'none',
                    spacing: 'md',
                  },
                ],
                paddingStart: 'md',
                paddingEnd: 'md',
                spacing: 'lg',
              },
            ],
            spacing: 'lg',
            cornerRadius: 'md',
            backgroundColor: '#3C5464',
            paddingTop: 'lg',
            paddingBottom: 'md',
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
                        color: '#1D292E',
                        size: 'lg',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: '求',
                        color: '#1D292E',
                        size: 'lg',
                        weight: 'bold',
                      },
                    ],
                    flex: 1,
                    spacing: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 11,
                    contents: [
                      {
                        type: 'text',
                        text: personalPrayer,
                        size: 'xs',
                        color: '#1D292E',
                        wrap: true,
                      },
                      {
                        type: 'text',
                        text: mainPrayer.join('\n'),
                        size: 'xs',
                        color: '#3C5464',
                        style: 'italic',
                        wrap: true,
                        flex: 24,
                      },
                    ],
                    spacing: 'md',
                  },
                ],
                paddingStart: 'md',
                paddingEnd: 'md',
                spacing: 'lg',
              },
            ],
            spacing: 'lg',
            backgroundColor: '#FFFFFF',
            paddingTop: 'lg',
            paddingBottom: 'md',
          },
        ],
      },
    },
  };
};
