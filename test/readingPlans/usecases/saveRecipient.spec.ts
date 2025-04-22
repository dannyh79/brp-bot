import { Recipient, RecipientSchema, saveRecipient } from '@/readingPlans';
import * as helper from 'test/helpers/d1';

const recipient = RecipientSchema.parse(helper.recipientRecordFixture);

class StubRepository implements Repository<Recipient> {
  data = recipient;

  save(entity: Recipient) {
    return entity.id === this.data.id ? Promise.reject() : Promise.resolve();
  }

  all() {
    return Promise.resolve([]);
  }

  findById() {
    return Promise.resolve(null);
  }

  destroy() {
    return Promise.resolve();
  }
}

describe('saveRecipient()', () => {
  const repo = new StubRepository();

  it('returns recipient object', async () => {
    const nonExistentRecipient = {
      ...helper.recipientRecordFixture,
      id: 'C5678f49365c6b492b337189e3343a9d9',
    };
    const result = await saveRecipient(repo)(nonExistentRecipient);
    expect(result).toMatchObject(nonExistentRecipient);
  });

  it('returns null, when there is error saving the record', async () => {
    const result = await saveRecipient(repo)(recipient);
    expect(result).toBeNull();
  });
});
