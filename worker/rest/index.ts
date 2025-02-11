import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { registerAuthComponent } from './middlewares';
import * as endpoints from './v1/endpoints';

const app = new OpenAPIHono();

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

registerAuthComponent(app);

app.openapi(endpoints.saveRecipient, async (c) => {
  const body = c.req.valid('json');
  const usecase = c.get('saveRecipient');
  const result = await usecase(body);
  return c.body(null, result ? 204 : 304);
});

app.openapi(endpoints.destroyRecipient, async (c) => {
  const param = c.req.valid('param');
  const usecase = c.get('destroyRecipient');
  const result = await usecase(param);
  return c.body(null, result ? 204 : 404);
});

// Setup OpenAPI registry
app.doc('/api/v1/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API',
  },
});

// Setup Swagger UI
app.get('/api/v1/ui', swaggerUI({ url: '/api/v1/doc' }));

export default app;
