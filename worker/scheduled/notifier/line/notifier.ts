import { GetPlanOutput } from '@/usecases/getPlan';
import { Notifier } from '../types';
import { LineMessage, LineNotifierArg } from './types';
import * as utils from './utils';

/** Implement line's MessagingApiClient, for @line/bot-sdk has worker incompatible dep "axios". */
export class LineNotifier implements Notifier<GetPlanOutput, LineMessage[]> {
  private channelAccessToken: string;
  private to: string;
  /** LINE Messaging API base URL. */
  private baseUrl: string = 'https://api.line.me/v2/bot';

  constructor({ channelAccessToken, to }: LineNotifierArg) {
    this.channelAccessToken = channelAccessToken;
    this.to = to;
  }

  async pushMessage(message: GetPlanOutput): Promise<LineMessage[]> {
    const url = `${this.baseUrl}/message/push`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify({
        to: this.to,
        messages: utils.toBubbleMessage(message),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to push message: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export default LineNotifier;
