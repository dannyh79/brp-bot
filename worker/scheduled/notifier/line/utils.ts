import * as line from '@line/bot-sdk';
import { GetPlanOutput } from '@/usecases/getPlan';
import { LineMessage } from './types';

export const toBubbleMessage = (arg: GetPlanOutput): LineMessage => {
  const { date, scope, content } = arg;

  const toParagraph = (text: string): line.messagingApi.FlexComponent => ({
    type: 'text',
    text,
    wrap: true,
    color: '#666666',
    size: 'sm',
    flex: 5,
  });

  return {
    type: 'flex',
    altText: `Bible Reading Plan for ${date}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: date,
            weight: 'bold',
            size: 'xl',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '範圍',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: scope,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: content.map(toParagraph),
              },
            ],
          },
        ],
      },
    },
  };
};
