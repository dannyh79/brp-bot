import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import * as endpoints from './endpoints/getPlan';
import { withUsecases } from './middlewares';
import InMemoryPlanRepository from './repositories/inMemoryPlan';
import getPlan from './usecases/getPlan';

const app = new OpenAPIHono();

app
  .use(withUsecases)
  // Setup Swagger UI
  .get('/ui', swaggerUI({ url: '/doc' }));

// Register OpenAPI endpoints
app.openapi(endpoints.getPlan, async (c) => {
  // TODO: use usecase injected from withUsecases()
  const repo = new InMemoryPlanRepository();
  const query = c.req.valid('query');

  const data = await getPlan(repo)(query);
  if (!data) {
    return c.notFound();
  } else {
    return c.json(data, 200);
  }
});

// Setup OpenAPI registry
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API',
  },
});

export default app;
