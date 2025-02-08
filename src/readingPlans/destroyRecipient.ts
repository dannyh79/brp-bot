import { z } from '@hono/zod-openapi';
import { NewRecipient, Recipient } from './entities/recipient';

export const DestroyRecipientInputSchema = z.object({
  id: z.string().openapi({ example: 'C1234f49365c6b492b337189e3343a9d9' }),
});

export type DestroyRecipientInput = z.infer<typeof DestroyRecipientInputSchema>;

export type DestroyRecipientOutput = z.infer<typeof DestroyRecipientInputSchema> | null;

export const destroyRecipient: UsecaseConstructor<
  Repository<Recipient>,
  DestroyRecipientInput,
  DestroyRecipientOutput
> = (repo) => async (args) => {
  const recipient = NewRecipient(args);
  try {
    await repo.destroy(recipient);
    return recipient;
  } catch {
    return null;
  }
};

export default destroyRecipient;
