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
> = () => async (args) => {
  const { id } = args;
  if (id === 'C1234f49365c6b492b337189e3343a9d9') {
    return null;
  }
  return NewRecipient({ id });
};

export default saveRecipient;
