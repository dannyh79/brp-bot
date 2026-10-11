import { z } from '@hono/zod-openapi';
import { Notifier } from '../types';
import { splitMessage } from './utils';

const responseSchema = z.object({
  ok: z.boolean(),
  error_code: z.number().int().optional(),
  parameters: z.object({ retry_after: z.number().int().min(0).optional() }).optional(),
});
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class TelegramMultiNotifier implements Notifier<
  string[],
  string,
  PromiseSettledResult<void>[]
> {
  constructor(private readonly config: { botToken: string }) {}

  async pushMessage(recipients: string[], message: string): Promise<PromiseSettledResult<void>[]> {
    const parts = splitMessage(message);
    if (!parts.length) return [];
    const results: PromiseSettledResult<void>[] = [];
    let attempted = false;
    // shortcut: delivery stays within one cron invocation, use a queue before large broadcasts.
    for (const recipient of recipients) {
      try {
        for (const text of parts) {
          // A group allows 20 messages/minute; pace all requests conservatively.
          if (attempted) await wait(3100);
          attempted = true;
          await this.send(recipient, text);
        }
        results.push({ status: 'fulfilled', value: undefined });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }
    return results;
  }

  private async send(chatId: string, text: string): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt++) {
      let response: Response;
      try {
        response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
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
      const retryAfter = data.parameters?.retry_after;
      // Retry only an explicit rejection; uncertain network outcomes may already be delivered.
      if (
        !data.ok &&
        data.error_code === 429 &&
        attempt === 0 &&
        retryAfter !== undefined &&
        retryAfter <= 60
      ) {
        await wait(Math.max(3100, retryAfter * 1000));
        continue;
      }
      throw new Error(
        `Telegram delivery failed (HTTP ${response.status}, API ${data.error_code ?? 'unknown'})`,
      );
    }
  }
}
