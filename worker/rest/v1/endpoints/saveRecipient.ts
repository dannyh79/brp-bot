import { createRoute, z } from '@hono/zod-openapi';
import * as m from '@worker/rest/middlewares';

export const SaveRecipientInput = z.object({
  id: z.string().openapi({ example: 'C1234f49365c6b492b337189e3343a9d9' }),
});

export const saveRecipient = createRoute({
  method: 'post',
  path: '/api/v1/recipients',
  tags: ['Recipients'],
  summary: `Saves a recipient`,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SaveRecipientInput,
        },
      },
    },
  },
  middleware: [m.withAuth, m.withUsecases] as const,
  responses: {
    '204': { description: 'The Recipient is saved' },
    '304': { description: 'The Recipient already exists' },
    '401': { description: 'Not authorized' },
  },
});

export default saveRecipient;
