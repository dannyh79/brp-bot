import { TelegramMultiNotifier } from '@/services/notifiers/telegram';

const token = '123456:secret-token';
const mockFetch = vi.fn();
const success = () => Response.json({ ok: true, result: { message_id: 1 } });

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const send = async (recipients: string[], message: string) => {
  const pending = new TelegramMultiNotifier({ botToken: token }).pushMessage(recipients, message);
  await vi.runAllTimersAsync();
  return pending;
};

describe('Telegram delivery acceptance', () => {
  it('sends plain text, preserving special characters without a parse mode', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(success()));
    const results = await send(['-100123', '@devotion_channel'], '祈求 <神> & _盼望_');
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe(`https://api.telegram.org/bot${token}/sendMessage`);
    const request = mockFetch.mock.calls[0][1];
    expect(request.method).toBe('POST');
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(request.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(request.body)).toEqual({
      chat_id: '-100123',
      text: '祈求 <神> & _盼望_',
      link_preview_options: { is_disabled: true },
    });
  });

  it('delivers every part in order and paces requests for group limits', async () => {
    const times: number[] = [];
    mockFetch.mockImplementation(() => {
      times.push(Date.now());
      return Promise.resolve(success());
    });
    await send(['-100123'], 'a'.repeat(4096) + 'b');
    expect(mockFetch.mock.calls.map(([, request]) => JSON.parse(request.body).text)).toEqual([
      'a'.repeat(4096),
      'b',
    ]);
    expect(times[1] - times[0]).toBeGreaterThanOrEqual(3100);
  });

  it('continues to the next destination after a failed chat and stops its remaining parts', async () => {
    mockFetch
      .mockResolvedValueOnce(Response.json({ ok: false, error_code: 403 }, { status: 403 }))
      .mockImplementation(() => Promise.resolve(success()));
    const results = await send(['-100123', '-100456'], 'a'.repeat(4096) + 'b');
    expect(results.map((result) => result.status)).toEqual(['rejected', 'fulfilled']);
    expect(mockFetch.mock.calls.map(([, request]) => JSON.parse(request.body).chat_id)).toEqual([
      '-100123',
      '-100456',
      '-100456',
    ]);
  });

  it('honors retry_after once for an explicit rate-limit rejection', async () => {
    const times: number[] = [];
    mockFetch.mockImplementation(() => {
      times.push(Date.now());
      return Promise.resolve(
        times.length === 1
          ? Response.json(
              { ok: false, error_code: 429, parameters: { retry_after: 5 } },
              { status: 429 },
            )
          : success(),
      );
    });
    expect((await send(['-100123'], 'test'))[0].status).toBe('fulfilled');
    expect(times[1] - times[0]).toBeGreaterThanOrEqual(5000);
  });

  it.each([61, -1, '5', 0.5, undefined])(
    'does not wait for invalid or excessive retry_after: %s',
    async (retryAfter) => {
      mockFetch.mockImplementation(() =>
        Promise.resolve(
          Response.json(
            { ok: false, error_code: 429, parameters: { retry_after: retryAfter } },
            { status: 429 },
          ),
        ),
      );
      expect((await send(['-100123'], 'test'))[0].status).toBe('rejected');
      expect(mockFetch).toHaveBeenCalledOnce();
    },
  );

  it('bounds retries when Telegram keeps rejecting requests', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        Response.json(
          { ok: false, error_code: 429, parameters: { retry_after: 1 } },
          { status: 429 },
        ),
      ),
    );
    expect((await send(['-100123'], 'test'))[0].status).toBe('rejected');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    () => Promise.resolve(Response.json({ ok: false, error_code: 400, description: token })),
    () => Promise.resolve(new Response(token, { status: 502 })),
    () => Promise.resolve(Response.json({ result: {} })),
    () => Promise.reject(new Error(`Network failed for https://api.telegram.org/bot${token}`)),
  ])('reports API, malformed, and network failures without leaking the token', async (response) => {
    mockFetch.mockImplementation(response);
    const [result] = await send(['-100123'], 'test');
    expect(result.status).toBe('rejected');
    if (result.status === 'rejected') {
      expect(String(result.reason)).toContain('Telegram');
      expect(String(result.reason)).not.toContain(token);
    }
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('does not send empty messages or requests without destinations', async () => {
    expect(await send([], 'test')).toEqual([]);
    expect(await send(['-100123'], '')).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
