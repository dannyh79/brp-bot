import { createRoute, z } from '@hono/zod-openapi';
import { withUsecases } from '@worker/rest/middlewares';

export const DestroyRecipientParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: 'C1234f49365c6b492b337189e3343a99',
  }),
});

export const destroyReceipient = createRoute({
  method: 'delete',
  path: '/api/v1/recipients/{id}',
  tags: ['Recipients'],
  summary: `Destroys a recipient`,
  request: {
    params: DestroyRecipientParamsSchema,
  },
  middleware: [withUsecases] as const,
  responses: {
    '204': { description: 'The Recipient is destroyed' },
    '404': { description: 'Recipient not found by id' },
  },
});

export default destroyReceipient;
