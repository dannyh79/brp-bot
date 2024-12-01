import { SELF } from 'cloudflare:test';

const stubDomain = 'https://brp-bot.pages.dev';

describe('/plan', () => {
  // FIXME: Test against stub data
  it('responds 200 with plan for the date', async () => {
    const response = await SELF.fetch(`${stubDomain}/plan?date=2024-12-01`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      date: '2024-12-01',
      scope: '創世紀 25:29-34',
      content: [
        '1. 請在今天當中默想這幾節經文',
        '2. 以掃因為誇飾了身體疲憊的感受,認為自己即將要失去生命,於是選擇滿足一時的口腹之慾,而輕忽了長子的名分。\n 感受和慾望往往是我們當下最真切的體驗,這使得我們容易被這些情緒所驅動。然而,實際上,我們非常需要聖靈的引導,以幫助我們分辨,並在日常生活中持續用真理來回應自己的感受和慾望,從而避免被它們所蒙蔽。你認為在日常生活中,可以通過哪些具體行動來幫助自己更常受到聖靈和真理的引導呢?',
      ],
    });
  });

  it('responds 404', async () => {
    const response = await SELF.fetch(`${stubDomain}/plan?date=2024-12-32`);
    expect(response.status).toBe(404);
  });
});
