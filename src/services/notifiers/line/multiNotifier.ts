import { Get2024PlanOutput } from '@/readingPlans';
import { Notifier } from '../types';
import { LineMultiNotifierArg, LinePushMessageRequest } from './types';
import * as utils from './utils';

/**
 * Implement line's MessagingApiClient, for "@line/bot-sdk" has worker incompatible dep "axios".
 *
 * @see {@link https://developers.line.biz/en/reference/messaging-api/#send-push-message} for API doc
 */
export class LineMultiNotifier implements Notifier<Get2024PlanOutput> {
  private channelAccessToken: string;
  private to: string[];
  /** LINE Messaging API base URL. */
  private baseUrl: string = 'https://api.line.me/v2/bot';

  constructor({ channelAccessToken, to }: LineMultiNotifierArg) {
    this.channelAccessToken = channelAccessToken;
    this.to = to;
  }

  async pushMessage(message: Get2024PlanOutput) {
    const reqs = this.to.map(async (to) => {
      const url = `${this.baseUrl}/message/push`;
      const payload: LinePushMessageRequest = {
        to,
        messages: [utils.toBubbleMessage(message)],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to push message: ${response.status} ${errorText}`);
      }

      return response.json();
    });

    return Promise.allSettled(reqs);
  }
}

export default LineMultiNotifier;
