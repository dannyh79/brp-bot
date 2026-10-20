import { z } from '@hono/zod-openapi';
import { Notifier } from '../types';
import { splitMessage } from './utils';
import { TelegramMessage } from './types';

/**
 * Telegram allows 20 messages/minute per group; it also advises at most 1/second per chat
 * and about 30/second for free broadcasts. Group pacing is the strictest for this sender.
 * @see https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
 */
const TELEGRAM_GROUP_MESSAGES_PER_MINUTE = 20;
/** Local pacing adds a 100 ms safety margin to the group's minimum interval. */
const TELEGRAM_SEND_INTERVAL_MS = 60_000 / TELEGRAM_GROUP_MESSAGES_PER_MINUTE + 100;

const responseSchema = z.object({
  ok: z.boolean(),
  error_code: z.number().int().optional(),
  description: z.string().optional(),
  parameters: z.object({ retry_after: z.number().int().min(0).optional() }).optional(),
});
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class TelegramMultiNotifier implements Notifier<
  string[],
  TelegramMessage,
  PromiseSettledResult<void>[]
> {
  constructor(private readonly config: { botToken: string }) {}

  async pushMessage(
    recipients: string[],
    message: TelegramMessage,
  ): Promise<PromiseSettledResult<void>[]> {
    const parts = splitMessage(message);
    if (!parts.length) return [];
    const results: PromiseSettledResult<void>[] = [];
    let attempted = false;
    // shortcut: delivery stays within one cron invocation, use a queue before large broadcasts.
    for (const recipient of recipients) {
      try {
        for (const part of parts) {
          if (attempted) await wait(TELEGRAM_SEND_INTERVAL_MS);
          attempted = true;
          await this.send(recipient, part);
        }
        results.push({ status: 'fulfilled', value: undefined });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }
    return results;
  }

  private async send(chatId: string, message: TelegramMessage): Promise<void> {
    // Local policy: two attempts, a 10s request timeout, and no waits above 60s.
    for (let attempt = 0; attempt < 2; attempt++) {
      let response: Response;
      try {
        response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            ...message,
            link_preview_options: { is_disabled: true },
          }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        // Fetch errors can contain the token-bearing URL; never propagate them.
        throw new Error('Telegram request failed or timed out');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new Error(`Telegram returned invalid JSON (HTTP ${response.status})`);
      }
      const parsed = responseSchema.safeParse(body);
      if (!parsed.success) throw new Error('Telegram returned an invalid response');
      const data = parsed.data;
      if (response.ok && data.ok) return;
      /** Telegram specifies the flood-control wait in seconds.
       * @see https://core.telegram.org/bots/api#responseparameters
       */
      const retryAfter = data.parameters?.retry_after;
      // Retry only an explicit rejection; uncertain network outcomes may already be delivered.
      if (
        !data.ok &&
        data.error_code === 429 &&
        attempt === 0 &&
        retryAfter !== undefined &&
        retryAfter <= 60
      ) {
        await wait(Math.max(TELEGRAM_SEND_INTERVAL_MS, retryAfter * 1000));
        continue;
      }
      const description = data.description?.replaceAll(this.config.botToken, '[redacted]');
      throw new Error(
        `Telegram delivery failed (HTTP ${response.status}, API ${data.error_code ?? 'unknown'})` +
          (description ? `: ${description}` : ''),
      );
    }
  }
}
