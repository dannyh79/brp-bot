import { LineMultiNotifier } from '@/services/notifiers';

const mockFetch = vi.fn();
const originalFetch = globalThis.fetch;
globalThis.fetch = mockFetch;

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

describe('LineMultiNotifier', () => {
  it('sends POST request to the endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn(),
    });

    await new LineMultiNotifier(stubNotifierArg).pushMessage(stubMessage);

    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stubNotifierArg.channelAccessToken}`,
      },
      body: expect.stringContaining(JSON.stringify(stubNotifierArg.to[0])),
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stubNotifierArg.channelAccessToken}`,
      },
      body: expect.stringContaining(JSON.stringify(stubNotifierArg.to[1])),
    });
  });
});

const stubNotifierArg = {
  to: ['some-group-id1', 'some-group-id2'],
  channelAccessToken: 'some-token',
};

const stubMessage = {
  date: '11/26',
  scope: '創世紀 23',
  content: [
    '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?',
    '2. 亞伯拉罕的品格有什麼值得你學習的地方?',
  ],
};
