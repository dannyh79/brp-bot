import { z } from '@hono/zod-openapi';

export const RecipientSchema = z.object({
  id: z.string(),
  createdAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export type Recipient = z.infer<typeof RecipientSchema>;

export const NewRecipient = ({
  id,
  createdAt,
  deletedAt,
}: Pick<Recipient, 'id'> & Partial<Recipient>): Recipient => ({
  id,
  createdAt: createdAt ? createdAt : new Date(),
  deletedAt: deletedAt ? deletedAt : null,
});
