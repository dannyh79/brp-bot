import { Recipient, saveRecipient } from '@/readingPlans';
import { recipientRecordFixture } from 'test/helpers/d1';

const recipient = recipientRecordFixture;

class StubRepository implements Repository<Recipient> {
  data = recipient;
  save(entity: Recipient) {
    if (entity.id !== this.data.id) {
      return Promise.reject();
    }

    return Promise.resolve();
  }

  findById() {
    return Promise.resolve(null);
  }
}

describe('saveRecipient()', () => {
  const repo = new StubRepository();

  it('returns recipient object', async () => {
    expect(await saveRecipient(repo)({ id: 'C5678f49365c6b492b337189e3343a9d9' })).toMatchObject({
      id: 'C5678f49365c6b492b337189e3343a9d9',
    });
  });

  it('returns null', async () => {
    expect(await saveRecipient(repo)({ id: 'C1234f49365c6b492b337189e3343a9d9' })).toBeNull();
  });
});
