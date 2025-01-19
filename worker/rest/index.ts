import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import * as endpoints from './v1/endpoints/getPlan';

const app = new OpenAPIHono();

// Setup Swagger UI
app.get('/api/v1/ui', swaggerUI({ url: '/api/v1/doc' }));
//#region Uncomment this to expose POST /callback endpoint (for retrieving recipient ID for LINE)
// app.post('/api/v1/callback', async (ctx) => {
//   const res = await ctx.req.json();
//   console.log(res);
//   return ctx.json({}, 200);
// });
//#endregion

// Register OpenAPI endpoints
app.openapi(endpoints.getPlan, async (c) => {
  const query = c.req.valid('query');

  const usecase = c.get('getPlan');
  const data = await usecase(query);
  if (!data) {
    return c.notFound();
  } else {
    return c.json(data, 200);
  }
});

// Setup OpenAPI registry
app.doc('/api/v1/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API',
  },
});

export default app;
