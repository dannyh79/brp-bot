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
> = (repo) => async () =>
  await repo.all().then((result) => {
    const { data, error, success } = ListRecipientsOutputSchema.safeParse(result);
    if (!success) {
      console.error(error.message);
      return [];
    }

    return data;
  });

export default listRecipients;
