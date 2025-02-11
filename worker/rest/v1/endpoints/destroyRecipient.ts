import { createRoute, z } from '@hono/zod-openapi';
import * as m from '@worker/rest/middlewares';

export const DestroyRecipientParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: 'C1234f49365c6b492b337189e3343a99',
  }),
});

export const destroyRecipient = createRoute({
  method: 'delete',
  path: '/api/v1/recipients/{id}',
  tags: ['Recipients'],
  summary: `Destroys a recipient`,
  security: [{ Bearer: [] }],
  request: {
    params: DestroyRecipientParamsSchema,
  },
  middleware: [m.withAuth, m.withUsecases] as const,
  responses: {
    '204': { description: 'The Recipient is destroyed' },
    '404': { description: 'Recipient not found by id' },
    '401': { description: 'Not authorized' },
  },
});

export default destroyRecipient;
