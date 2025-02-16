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
                color: '#1D292E',
                size: 'xl',
                weight: 'bold',
                flex: 2,
                align: 'end',
              },
              {
                type: 'text',
                text: 'X',
                size: 'md',
                align: 'center',
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'DAILY',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: 'DEVOTION',
                    weight: 'bold',
                  },
                ],
                flex: 5,
              },
            ],
            alignItems: 'center',
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#FFCC32',
        spacing: 'md',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${date} ${dayOfWeek}`,
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
                        size: 'lg',
                      },
                      {
                        type: 'text',
                        text: '美',
                        size: 'lg',
                      },
                    ],
                    spacing: 'xl',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `${praise.content}\n(${praise.scope})`,
                    flex: 11,
                    size: 'xs',
                    color: '#1C1C1D',
                    wrap: true,
                  },
                ],
                paddingStart: 'md',
                paddingEnd: 'md',
                spacing: 'lg',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [],
                backgroundColor: '#FFFFFFAA',
                borderWidth: 'light',
                width: '95%',
                offsetStart: '5%',
                offsetEnd: '5%',
              },
            ],
            spacing: 'lg',
            cornerRadius: 'md',
            backgroundColor: '#C7CADA',
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
                        size: 'lg',
                      },
                      {
                        type: 'text',
                        text: '改',
                        size: 'lg',
                      },
                    ],
                    flex: 1,
                    spacing: 'xl',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  {
                    type: 'text',
                    text: repentence,
                    flex: 11,
                    size: 'xs',
                    color: '#1C1C1D',
                    wrap: true,
                  },
                ],
                spacing: 'lg',
                paddingStart: 'md',
                paddingEnd: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [],
                backgroundColor: '#C7CADAAA',
                borderWidth: 'light',
                width: '95%',
                offsetStart: '5%',
                offsetEnd: '5%',
              },
            ],
            spacing: 'lg',
            paddingBottom: 'md',
            paddingTop: 'lg',
            backgroundColor: '#FFFFFF',
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
                      },
                      {
                        type: 'text',
                        text: '思',
                        size: 'lg',
                        align: 'start',
                      },
                    ],
                    flex: 1,
                    spacing: 'xl',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: devotional.scope,
                        size: 'lg',
                        weight: 'bold',
                        wrap: true,
                      },
                      {
                        type: 'text',
                        text: devotional.content.join('\n'),
                        size: 'xs',
                        color: '#1C1C1D',
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
              {
                type: 'box',
                layout: 'horizontal',
                contents: [],
                backgroundColor: '#FFFFFFAA',
                borderWidth: 'light',
                width: '95%',
                offsetStart: '5%',
                offsetEnd: '5%',
              },
            ],
            spacing: 'lg',
            cornerRadius: 'md',
            backgroundColor: '#C7CADA',
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
                        size: 'lg',
                      },
                      {
                        type: 'text',
                        text: '求',
                        size: 'lg',
                      },
                    ],
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    spacing: 'xl',
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
                        color: '#1C1C1D',
                        wrap: true,
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
                                type: 'box',
                                layout: 'vertical',
                                contents: [],
                                borderWidth: 'light',
                                borderColor: '#E2E2E299',
                                width: '1px',
                              },
                            ],
                            flex: 1,
                          },
                          {
                            type: 'text',
                            text: mainPrayer.join('\n'),
                            size: 'xs',
                            color: '#1C1C1DAA',
                            wrap: true,
                            flex: 24,
                          },
                        ],
                      },
                    ],
                    spacing: 'md',
                  },
                ],
                paddingStart: 'md',
                paddingEnd: 'md',
                spacing: 'sm',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [],
                backgroundColor: '#C7CADAAA',
                borderWidth: 'light',
                width: '95%',
                offsetStart: '5%',
                offsetEnd: '5%',
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
