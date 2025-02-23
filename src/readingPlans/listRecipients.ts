import { z } from '@hono/zod-openapi';
import { Recipient } from './entities/recipient';

export const ListRecipientsOutputSchema = z.array(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
  }),
);

export type ListRecipientsOutput = z.infer<typeof ListRecipientsOutputSchema>;

export const listRecipients: UsecaseConstructor<
  Repository<Recipient>,
  void,
  ListRecipientsOutput
> = (repo) => async () => await repo.all();

export default listRecipients;
