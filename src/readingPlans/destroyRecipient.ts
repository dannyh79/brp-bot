import { z } from '@hono/zod-openapi';
import { NewRecipient, Recipient } from './entities/recipient';

export const DestroyRecipientInputSchema = z.object({
  id: z.string().openapi({ example: 'C1234f49365c6b492b337189e3343a9d9' }),
});

export type DestroyRecipientInput = z.infer<typeof DestroyRecipientInputSchema>;

export type DestroyRecipientOutput = z.infer<typeof DestroyRecipientInputSchema> | null;

/** TODO: impl */
export const destroyRecipient: UsecaseConstructor<
  Repository<Recipient>,
  DestroyRecipientInput,
  DestroyRecipientOutput
> = () => async (args) => {
  const recipient = NewRecipient(args);
  return args.id === 'C1234f49365c6b492b337189e3343a9d9' ? recipient : null;
};

export default destroyRecipient;
