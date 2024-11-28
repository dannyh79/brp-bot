import { Notifier } from '../types';
import { LineMessage, LineMessageArg, LineNotifierArg } from './types';

/** Implement line's MessagingApiClient, for @line/bot-sdk has worker incompatible dep "axios". */
class LineNotifier implements Notifier<LineMessageArg, LineMessage[]> {
  private channelAccessToken: string;
  /** LINE Messaging API base URL. */
  private baseUrl: string = 'https://api.line.me/v2/bot';

  constructor({ channelAccessToken }: LineNotifierArg) {
    this.channelAccessToken = channelAccessToken;
  }

  async pushMessage({ to, messages }: LineMessageArg): Promise<LineMessage[]> {
    const url = `${this.baseUrl}/message/push`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify({
        to,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to push message: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export const createClient = (channelAccessToken: string) =>
  new LineNotifier({ channelAccessToken });

export default createClient;
