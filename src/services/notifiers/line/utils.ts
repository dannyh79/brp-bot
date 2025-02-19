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

const repentencePrelude =
  '聖靈懇求祢在今天光照我在生命中，有沒有什麼是祢要我去做，但我沒有去做的事？\n又有什麼是祢不喜悅我去做，但我卻行的事？';

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
                      {
                        type: 'text',
                        text: devotional.scope,
                        gravity: 'center',
                        flex: 8,
                        size: 'lg',
                        color: '#5D5D5D',
                        wrap: true,
                        lineSpacing: '10px',
                        weight: 'bold',
                      },
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
