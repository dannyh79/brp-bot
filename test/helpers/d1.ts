import { Recipient } from '@/readingPlans';
import { env } from 'cloudflare:test';

export const planRecordFixture = {
  date: '2025-01-01',
  praise: {
    scope: '歷代志上 16:34 CCB',
    content: '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
  },
  devotional: {
    scope: '出埃及記 第 8 章',
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

export const recipientRecordFixture: Recipient = {
  id: 'C1234f49365c6b492b337189e3343a9d9',
  createdAt: new Date('2025-01-01'),
  deletedAt: null,
};

export const insertRecipientRecord = async (data = recipientRecordFixture) => {
  await env.DB.prepare(
    `
    INSERT INTO recipients (id, created_at, deleted_at)
    VALUES (?1, ?2, ?3)
    `,
  )
    .bind(
      data.id,
      data.createdAt.toISOString(),
      data.deletedAt ? data.deletedAt.toISOString() : null,
    )
    .run();
};
