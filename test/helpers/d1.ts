import { env } from 'cloudflare:test';

export const planRecordFixture = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
  },
  devotional: {
    scope: '出埃及記 第八章',
  },
};

export const insertPlanRecord = async (data = planRecordFixture) => {
  await env.DB.prepare(
    `
    INSERT INTO plans (date, praise_scope, praise_content, devotional_scope)
    VALUES (?1, ?2, ?3, ?4)
    `,
  )
    .bind(data.date, data.praise.scope, data.praise.content, data.devotional.scope)
    .run();
};
