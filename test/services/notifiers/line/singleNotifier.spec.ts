import { LineSingleNotifier } from '@/services/notifiers';

const mockFetch = vi.fn();
const originalFetch = globalThis.fetch;
globalThis.fetch = mockFetch;

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

describe('LineSingleNotifier', () => {
  it('sends POST request to the endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn(),
    });

    await new LineSingleNotifier(stubNotifierArg).pushMessage(stubMessage);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stubNotifierArg.channelAccessToken}`,
      },
      body: expect.stringContaining(JSON.stringify(stubNotifierArg.to)),
    });
  });
});

const stubNotifierArg = {
  to: 'some-group-id',
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
