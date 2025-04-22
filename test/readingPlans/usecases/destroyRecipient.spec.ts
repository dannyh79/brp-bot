import { Recipient, RecipientSchema, destroyRecipient } from '@/readingPlans';
import * as helper from 'test/helpers/d1';

const recipient = RecipientSchema.parse(helper.recipientRecordFixture);

class StubRepository implements Repository<Recipient> {
  data = recipient;

  destroy({ id }: Recipient) {
    return id === this.data.id ? Promise.resolve() : Promise.reject();
  }

  reset() {
    this.data = recipient;
  }

  save() {
    return Promise.resolve();
  }

  all() {
    return Promise.resolve([]);
  }

  findById() {
    return Promise.resolve(null);
  }
}

describe('destroyRecipient()', () => {
  const repo = new StubRepository();

  beforeEach(() => {
    repo.reset();
  });

  it('returns recipient object', async () => {
    const result = await destroyRecipient(repo)(recipient);
    expect(result).toMatchObject(recipient);
  });

  it('returns null, when there is error destroying the record', async () => {
    const nonExistentRecipient = {
      ...helper.recipientRecordFixture,
      id: 'C5678f49365c6b492b337189e3343a9d9',
    };
    const result = await destroyRecipient(repo)(nonExistentRecipient);
    expect(result).toBeNull();
  });
});
