import { GetPlanOutput } from '@/readingPlans';
import { Notifier } from '../types';
import { LineMessage, LinePushMessageRequest, LineSingleNotifierArg } from './types';
import * as utils from './utils';

/** Implement line's MessagingApiClient, for @line/bot-sdk has worker incompatible dep "axios". */
export class LineSingleNotifier implements Notifier<GetPlanOutput, LineMessage[]> {
  private channelAccessToken: string;
  private to: string;
  /** LINE Messaging API base URL. */
  private baseUrl: string = 'https://api.line.me/v2/bot';

  constructor({ channelAccessToken, to }: LineSingleNotifierArg) {
    this.channelAccessToken = channelAccessToken;
    this.to = to;
  }

  async pushMessage(message: GetPlanOutput): Promise<LineMessage[]> {
    const url = `${this.baseUrl}/message/push`;
    const payload: LinePushMessageRequest = {
      to: this.to,
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
  }
}

export default LineSingleNotifier;
