import { SELF, env } from 'cloudflare:test';
import * as endpoints from '@worker/rest/v1/endpoints';
import * as helper from 'test/helpers/d1';

const stubDomain = 'https://brp-bot.pages.dev';

describe('GET /api/v1/plan', () => {
  beforeEach(async () => {
    await helper.insertPlanRecord();
  });

  beforeEach(vi.resetAllMocks);

  it('responds 200 with plan for the date', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2025-01-01`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      date: '2025-01-01',
      praise: {
        scope: '歷代志上 16:34 CCB',
        content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
      },
      repentence:
        '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求祢洗淨我的罪過，清除我的罪惡。\n求祢讓我重新享受蒙祢拯救的喜樂，賜我一個樂意順服祢的心靈，並開始以 ___ 的行動做出改變。',
      devotional: {
        scope: ['出埃及記 第 8 章'],
        content: ['1. 你覺得神透過今天的經文對你說什麼呢？', '2. 有什麼你可以做出的行動或改變呢？'],
      },
      prayer:
        '神啊！我將我的 ___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n我們在天上的父：願人都尊你的名為聖。\n願你的國降臨；願你的旨意行在地上，如同行在天上。\n我們日用的飲食，今日賜給我們。\n免我們的債，如同我們免了人的債。\n不叫我們陷入試探；救我們脫離那惡者。\n因為國度、權柄、榮耀，全是你的，直到永遠。阿們！',
    });
  });

  it('responds 200 with plan in HTML, with querystring format=html', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2025-01-01&format=html`);
    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it('renders normalized reading and prayer blocks in their requested order', async () => {
    await env.DB.prepare(
      `
        INSERT INTO subsection_blocks (date, section, position, title, scripture_content, scripture_scope, content, sort_order)
        VALUES
          (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8),
          (?1, ?9, ?10, NULL, NULL, NULL, ?11, ?8)
        `,
    )
      .bind(
        '2025-01-01',
        'prayer',
        'after_content',
        '為教會禱告',
        '「凡敬畏神的人，你們都來聽！」',
        '詩篇 66:16',
        '為 FORWARD 奉獻預備自己的心。',
        1,
        'devotional',
        'before_content',
        '樂意撒種，經歷神敞開天窗的豐盛祝福。',
      )
      .run();

    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2025-01-01&format=html`);
    const body = await response.text();

    expect(body).toContain('樂意撒種，經歷神敞開天窗的豐盛祝福。');
    expect(body).toContain('為教會禱告');
    expect(body).toContain('「凡敬畏神的人，你們都來聽！」，詩篇 66:16');
    expect(body).toContain('為 FORWARD 奉獻預備自己的心。');
    expect(body.indexOf('樂意撒種，經歷神敞開天窗的豐盛祝福。')).toBeLessThan(
      body.indexOf('出埃及記 第 8 章'),
    );
  });
  it('responds 404, when no plan found', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2024-12-31`);
    expect(response.status).toBe(404);
  });

  it('responds 500, when failing to parse usecase output', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // silences console.error
    vi.spyOn(endpoints, 'GetPlanOutputSchema', 'get').mockReturnValue({
      safeParse: () => ({ success: false, error: { message: 'some error' } }),
    } as unknown as typeof endpoints.GetPlanOutputSchema);
    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2025-01-01`);
    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith('some error');
  });

  describe('without date params', () => {
    beforeEach(vi.useFakeTimers);
    afterEach(vi.useRealTimers);

    it('responds 200 with plan for the current date', async () => {
      vi.setSystemTime(new Date('2025-01-01 00:00:00 GMT+8'));
      const response = await SELF.fetch(`${stubDomain}/api/v1/plan`);
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        date: '2025-01-01',
        praise: {
          scope: '歷代志上 16:34 CCB',
          content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
        },
        repentence:
          '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求祢洗淨我的罪過，清除我的罪惡。\n求祢讓我重新享受蒙祢拯救的喜樂，賜我一個樂意順服祢的心靈，並開始以 ___ 的行動做出改變。',
        devotional: {
          scope: ['出埃及記 第 8 章'],
          content: [
            '1. 你覺得神透過今天的經文對你說什麼呢？',
            '2. 有什麼你可以做出的行動或改變呢？',
          ],
        },
        prayer:
          '神啊！我將我的 ___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n我們在天上的父：願人都尊你的名為聖。\n願你的國降臨；願你的旨意行在地上，如同行在天上。\n我們日用的飲食，今日賜給我們。\n免我們的債，如同我們免了人的債。\n不叫我們陷入試探；救我們脫離那惡者。\n因為國度、權柄、榮耀，全是你的，直到永遠。阿們！',
      });
    });

    it('responds 200 with plan in HTML, with querystring format=html', async () => {
      vi.setSystemTime(new Date('2025-01-01 00:00:00 GMT+8'));
      const response = await SELF.fetch(`${stubDomain}/api/v1/plan?format=html`);
      expect(response.status).toBe(200);
      expect(await response.text()).toMatchSnapshot();
    });
  });
});

describe('POST /api/v1/recipients', () => {
  const recipient = helper.recipientRecordFixture;

  it('responds 401, when not authorized', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'C5678f49365c6b492b337189e3343a9d9' }),
    });
    expect(response.status).toBe(401);
  });

  it('responds 204, when saves a recipient', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.API_TOKEN}` },
      body: JSON.stringify({ id: 'C5678f49365c6b492b337189e3343a9d9' }),
    });
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('responds 304, when the recipient already exists', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.API_TOKEN}` },
      body: JSON.stringify({ id: recipient.id }),
    });
    expect(response.status).toBe(304);
    expect(await response.text()).toBe('');
  });
});

describe('DELETE /api/v1/recipients/:id', () => {
  const recipient = helper.recipientRecordFixture;

  it('responds 401, when not authorized', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients/${recipient.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(401);
  });

  it('responds 204, when deletes a recipient', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients/${recipient.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${env.API_TOKEN}` },
    });
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('responds 404, when no recipient found', async () => {
    await helper.insertRecipientRecord();
    const response = await SELF.fetch(
      `${stubDomain}/api/v1/recipients/C5678f49365c6b492b337189e3343a9d9`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${env.API_TOKEN}` },
      },
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('');
  });
});
