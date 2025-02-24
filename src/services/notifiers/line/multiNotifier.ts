import { GetPlanOutput } from '@/readingPlans';
import { Notifier } from '../types';
import { LineMultiNotifierArg, LinePushMessageRequest } from './types';
import * as utils from './utils';

/**
 * Implement line's MessagingApiClient, for "@line/bot-sdk" has worker incompatible dep "axios".
 *
 * @see {@link https://developers.line.biz/en/reference/messaging-api/#send-push-message} for API doc
 */
export class LineMultiNotifier implements Notifier<string[], GetPlanOutput> {
  private channelAccessToken: string;
  /** LINE Messaging API base URL. */
  private baseUrl: string = 'https://api.line.me/v2/bot';

  constructor({ channelAccessToken }: LineMultiNotifierArg) {
    this.channelAccessToken = channelAccessToken;
  }

  async pushMessage(recipients: string[], message: GetPlanOutput) {
    const reqs = recipients.map(async (to) => {
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
