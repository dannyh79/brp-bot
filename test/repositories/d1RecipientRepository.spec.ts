import { env } from 'cloudflare:test';
import D1RecipientRepository from '@/repositories/d1Recipient';
import { insertRecipientRecord, recipientRecordFixture } from 'test/helpers/d1';

const recipient = recipientRecordFixture;

beforeEach(async () => {
  await insertRecipientRecord(recipient);
});

describe('D1RecipientRepository', () => {
  const repo = new D1RecipientRepository(env.DB);

  describe('findById()', () => {
    it('returns recipient object', async () => {
      expect(await repo.findById(recipient.id)).toMatchObject(recipient);
    });

    it('returns null', async () => {
      expect(await repo.findById('C5678f49365c6b492b337189e3343a9d9')).toBeNull();
    });
  });
});
