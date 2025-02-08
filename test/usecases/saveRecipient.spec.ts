import { Recipient, saveRecipient } from '@/readingPlans';
import { recipientRecordFixture } from 'test/helpers/d1';

const recipient = recipientRecordFixture;

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
    const result = await saveRecipient(repo)({ id: 'C5678f49365c6b492b337189e3343a9d9' });
    expect(result).toMatchObject({
      id: 'C5678f49365c6b492b337189e3343a9d9',
    });
  });

  it('returns null', async () => {
    const result = await saveRecipient(repo)(recipient);
    expect(result).toBeNull();
  });
});
