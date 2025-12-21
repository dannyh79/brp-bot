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

    await new LineMultiNotifier({ channelAccessToken: stubChannelAccessToken }).pushMessage(
      pushMessageArg['to'],
      pushMessageArg['message'],
    );

    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stubChannelAccessToken}`,
      },
      body: expect.stringContaining(JSON.stringify(pushMessageArg.to[0])),
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stubChannelAccessToken}`,
      },
      body: expect.stringContaining(JSON.stringify(pushMessageArg.to[1])),
    });
  });
});

const stubChannelAccessToken = 'some-token';

const stubMessage = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華, 因為祂是美善的, 祂的慈愛永遠長存!',
  },
  repentence:
    '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求你洗淨我的罪過，清除我的罪惡。求你讓我重新享受蒙你拯救的喜樂，賜我一個樂意順服你的心靈。',
  devotional: {
    scope: ['出埃及記 第 8 章'],
    content: ['1. 你覺得神透過今天的經文對你說什麼呢?', '2. 有什麼你可以做出的行動或改變呢?'],
    link: ['https://www.bible.com/bible/1392/EXO.8'],
  },
  prayer:
    '”神啊！我將我的，___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n『我們在天上的父：願人都尊你的名為聖。願你的國降臨；願你的旨意行在地上，如同行在天上。我們日用的飲食，今日賜給我們。免我們的債，如同我們免了人的債。不叫我們陷入試探；救我們脫離那惡者。因為國度、權柄、榮耀，全是你的，直到永遠。阿們！』”',
};

const pushMessageArg = {
  to: ['some-group-id1', 'some-group-id2'],
  message: stubMessage,
};
