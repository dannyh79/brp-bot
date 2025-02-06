import { createRoute, z } from '@hono/zod-openapi';
import { withUsecases } from '@worker/rest/middlewares';

export const SaveReceipientInput = z.object({
  id: z.string().openapi({ example: 'C1234f49365c6b492b337189e3343a9d9' }),
});

export const saveReceipient = createRoute({
  method: 'post',
  path: '/api/v1/recipients',
  tags: ['Plans'],
  summary: `Saves a recipient`,
  request: {
    body: {
      content: {
        'application/json': {
          schema: SaveReceipientInput,
        },
      },
    },
  },
  middleware: [withUsecases] as const,
  responses: {
    '204': { description: 'The Recipient is saved' },
    '304': { description: 'The Recipient already exists' },
  },
});

export default saveReceipient;
