import { env } from 'cloudflare:test';
import app from '@worker/rest';
import { insertPlanRecord, insertRecipientRecord } from 'test/helpers/d1';

const settings = {
  ...env,
  NOTIFICATION_ADMIN_PASSWORD: 'test-password',
  TELEGRAM_BOT_TOKEN: '123456:secret-token',
  TELEGRAM_CHAT_IDS: '-100123',
  TELEGRAM_ADMIN_CHAT_ID: '987654',
  LINE_CHANNEL_ACCESS_TOKEN: 'line-token',
  LINE_ADMIN_RECIPIENT_ID: 'line-admin',
};
let network = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  network = vi
    .fn<(url: string, init?: RequestInit) => Promise<Response>>()
    .mockResolvedValue(Response.json({ ok: true }));
  vi.stubGlobal('fetch', network);
});
afterEach(() => vi.unstubAllGlobals());

const token = (credentials = 'admin:test-password') => `Basic ${btoa(credentials)}`;

async function request(auth?: string, date = '2025-01-01', method = 'POST', channel = 'telegram') {
  return app.request(
    method === 'GET' ? '/admin/notifications' : '/api/v1/admin/notifications',
    {
      method,
      headers: {
        ...(auth ? { Authorization: auth } : {}),
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(method === 'POST' ? { body: JSON.stringify({ date, channel }) } : {}),
    },
    settings,
  );
}

describe('manual notification delivery', () => {
  it('rejects missing and incorrect credentials and disables access without a password', async () => {
    for (const auth of [undefined, token('admin:wrong'), token('other:test-password')]) {
      const response = await request(auth);
      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toContain('Basic');
    }
    expect((await request(undefined, '', 'GET')).status).toBe(401);
    const disabled = await app.request(
      '/api/v1/admin/notifications',
      { headers: { Authorization: token('admin:') } },
      { ...settings, NOTIFICATION_ADMIN_PASSWORD: '' },
    );
    expect(disabled.status).toBe(503);
    expect(network).not.toHaveBeenCalled();
  });

  it('provides a mobile page and sends only an existing plan for the chosen date', async () => {
    await insertPlanRecord();
    const jwt = token();
    const page = await request(jwt, '', 'GET');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('type="date"');
    expect((await request(jwt, '2025-02-30')).status).toBe(400);
    expect((await request(jwt, '2025-01-02')).status).toBe(404);
    const response = await request(jwt);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ delivered: 1, failed: 0 });
    const sends = network.mock.calls.filter(([url]) => url.includes('api.telegram.org'));
    expect(sends).toHaveLength(1);
    expect(JSON.parse(sends[0][1].body).chat_id).toBe('-100123');
  });

  it('sends only to LINE when selected and reports rejected deliveries', async () => {
    await insertPlanRecord();
    await insertRecipientRecord();
    const jwt = token();
    const response = await request(jwt, '2025-01-01', 'POST', 'line');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ delivered: 1, failed: 0 });
    expect(network.mock.calls.some(([url]) => url.includes('api.telegram.org'))).toBe(false);
    expect(
      network.mock.calls.some(([url]) => url === 'https://api.line.me/v2/bot/message/push'),
    ).toBe(true);
    network.mockResolvedValue(new Response('private detail', { status: 403 }));
    const failed = await request(jwt, '2025-01-01', 'POST', 'line');
    expect(failed.status).toBe(502);
    expect(await failed.json()).toEqual({
      message: 'Delivery failed; check logs before retrying',
      delivered: 0,
      failed: 1,
    });
  });

  it('reports delivery failures without exposing the Telegram response', async () => {
    await insertPlanRecord();
    const jwt = token();
    network.mockResolvedValue(
      Response.json({ ok: false, error_code: 403, description: 'private detail' }, { status: 403 }),
    );
    const response = await request(jwt);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      message: 'Delivery failed; check logs before retrying',
      delivered: 0,
      failed: 1,
    });
  });
});
