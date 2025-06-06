import { env } from 'cloudflare:test';
import D1RecipientRepository, { Record } from '@/repositories/d1Recipient';
import { ErrorRecordNotFound } from '@/repositories/errors';
import { insertRecipientRecord, recipientRecordFixture } from 'test/helpers/d1';

const recipient1 = recipientRecordFixture;
const recipient2 = { ...recipientRecordFixture, id: 'C5678f49365c6b492b337189e3343a9d9' };

describe('D1RecipientRepository', () => {
  const repo = new D1RecipientRepository(env.DB);

  describe('all()', () => {
    it('returns all recipients', async () => {
      await Promise.all([recipient1, recipient2].map(insertRecipientRecord));
      const result = await repo.all();
      expect(result).toMatchObject([recipient1, recipient2]);
    });
  });

  describe('findById()', () => {
    it('returns recipient object', async () => {
      await insertRecipientRecord(recipient1);
      const result = await repo.findById(recipient1.id);
      expect(result).toMatchObject(recipient1);
    });

    it('returns null, when no record found by ID', async () => {
      await insertRecipientRecord(recipient1);
      const result = await repo.findById('C5678f49365c6b492b337189e3343a9d9');
      expect(result).toBeNull();
    });
  });

  describe('save()', () => {
    beforeEach(async () => {
      await env.DB.prepare('DELETE FROM recipients').run();
    });

    it('saves a recipient record', async () => {
      await repo.save(recipient1);

      const result = await env.DB.prepare('SELECT * FROM recipients WHERE id = ?')
        .bind(recipient1.id)
        .first<Record>();
      expect(result?.id).toEqual(recipient1.id);
    });

    it('throws error, when trying to save a recipient by the same ID', async () => {
      await env.DB.prepare('DELETE FROM recipients').run();
      await repo.save(recipient1);
      await expect(() => repo.save(recipient1)).rejects.toThrowError();
    });
  });

  describe('destroy()', () => {
    beforeEach(async () => {
      await env.DB.prepare('DELETE FROM recipients').run();
    });

    it('deletes a recipient record', async () => {
      await insertRecipientRecord(recipient1);
      await repo.destroy(recipient1);

      const result = await env.DB.prepare('SELECT * FROM recipients WHERE id = ?')
        .bind(recipient1.id)
        .first<Record>();
      expect(result).toBeNull();
    });

    it('throws error, when trying to destroy a non-existent recipient', async () => {
      await expect(() => repo.destroy(recipient2)).rejects.toThrowError(ErrorRecordNotFound);
    });
  });
});
