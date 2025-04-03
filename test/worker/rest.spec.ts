import { SELF, env } from 'cloudflare:test';
import * as helper from 'test/helpers/d1';

const stubDomain = 'https://brp-bot.pages.dev';

describe('GET /api/v1/plan', () => {
  beforeEach(async () => {
    await helper.insertPlanRecord();
  });

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
        scope: '出埃及記 第 8 章',
        content: ['1. 你覺得神透過今天的經文對你說什麼呢？', '2. 有什麼你可以做出的行動或改變呢？'],
      },
      prayer:
        '神啊！我將我的 ___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n我們在天上的父：願人都尊你的名為聖。\n願你的國降臨；願你的旨意行在地上，如同行在天上。\n我們日用的飲食，今日賜給我們。\n免我們的債，如同我們免了人的債。\n不叫我們陷入試探；救我們脫離那惡者。\n因為國度、權柄、榮耀，全是你的，直到永遠。阿們！',
    });
  });

  it('responds 200 with plan in HTML', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/plan?date=2025-01-01&format=html`);
    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it('responds 404', async () => {
    const response = await SELF.fetch(`${stubDomain}/plan?date=2024-12-31`);
    expect(response.status).toBe(404);
  });
});

describe('POST /api/v1/recipients', () => {
  const recipient = helper.recipientRecordFixture;

  beforeEach(async () => {
    await helper.insertRecipientRecord();
  });

  it('responds 401 when not authorized', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'C5678f49365c6b492b337189e3343a9d9' }),
    });
    expect(response.status).toBe(401);
  });

  it('responds 204 when saves a recipient', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.API_TOKEN}` },
      body: JSON.stringify({ id: 'C5678f49365c6b492b337189e3343a9d9' }),
    });
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('responds 304', async () => {
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

  beforeEach(async () => {
    await helper.insertRecipientRecord();
  });

  it('responds 401 when not authorized', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients/${recipient.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(401);
  });

  it('responds 204 when deletes a recipient', async () => {
    const response = await SELF.fetch(`${stubDomain}/api/v1/recipients/${recipient.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${env.API_TOKEN}` },
    });
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('responds 404 when recipient not found', async () => {
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
