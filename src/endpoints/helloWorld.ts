import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';

export class HelloWorld extends OpenAPIRoute {
  schema = {
    tags: ['Hello World'],
    summary: `Returns message "Hello World!`,
    responses: {
      '200': {
        description: `Returns message "Hello World!`,
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle() {
    return {
      message: 'Hello World!',
    };
  }
}

export default HelloWorld;
