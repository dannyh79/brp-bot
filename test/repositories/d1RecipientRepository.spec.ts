import { env } from 'cloudflare:test';
import D1RecipientRepository, { Record } from '@/repositories/d1Recipient';
import { insertRecipientRecord, recipientRecordFixture } from 'test/helpers/d1';

const recipient = recipientRecordFixture;

describe('D1PlanRepository', () => {
  const repo = new D1RecipientRepository(env.DB);

  describe('findById()', () => {
    beforeEach(async () => {
      await insertRecipientRecord(recipient);
    });

    it('returns receipient object', async () => {
      expect(await repo.findById(recipient.id)).toMatchObject(recipient);
    });

    it('returns null', async () => {
      expect(await repo.findById('C5678f49365c6b492b337189e3343a9d9')).toBeNull();
    });
  });

  describe('save()', () => {
    beforeEach(async () => {
      await env.DB.prepare('DELETE FROM recipients').run();
    });

    it('saves a recipient record', async () => {
      await repo.save(recipient);

      const result = await env.DB.prepare('SELECT * FROM recipients WHERE id = ?')
        .bind(recipient.id)
        .first<Record>();
      expect(result?.id).toEqual(recipient.id);
    });

    it('Throws error when trying to save a recipient by the same ID', async () => {
      await repo.save(recipient);
      await expect(repo.save(recipient)).rejects.toThrowError();
    });
  });
});
