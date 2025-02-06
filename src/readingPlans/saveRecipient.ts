import { z } from '@hono/zod-openapi';
import { NewRecipient, Recipient } from './entities/recipient';

export const SaveRecipientInputSchema = z.object({
  id: z.string().openapi({ example: 'C1234f49365c6b492b337189e3343a9d9' }),
});

export type SaveRecipientInput = z.infer<typeof SaveRecipientInputSchema>;

export type SaveRecipientOutput = z.infer<typeof SaveRecipientInputSchema> | null;

export const saveRecipient: UsecaseConstructor<
  Repository<Recipient>,
  SaveRecipientInput,
  SaveRecipientOutput
> = (repo) => async (args) => {
  const recipient = NewRecipient(args);
  try {
    await repo.save(recipient);
    return recipient;
  } catch {
    return null;
  }
};

export default saveRecipient;
