import { Recipient, RecipientSchema, listRecipients } from '@/readingPlans';
import * as helper from 'test/helpers/d1';

describe('listRecipients()', () => {
  const repo = new StubRepository();

  it('returns a list of recipient objects', async () => {
    const result = await listRecipients(repo)();
    expect(result).toMatchObject([recipient1, recipient2]);
  });
});

const recipient1 = RecipientSchema.parse(helper.recipientRecordFixture);
const recipient2 = RecipientSchema.parse({
  ...helper.recipientRecordFixture,
  id: 'C5678f49365c6b492b337189e3343a9d9',
});

class StubRepository implements Repository<Recipient> {
  data = [recipient1, recipient2];

  async all() {
    return this.data;
  }

  async destroy() {}
  async save() {}

  async findById() {
    return null;
  }
}
