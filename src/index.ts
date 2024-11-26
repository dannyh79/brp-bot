import { fromHono } from 'chanfana';
import { Hono } from 'hono';
import { GetPlan } from './endpoints/getPlan';

const app = new Hono();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: '/doc',
});

// Register OpenAPI endpoints
openapi.get('/plan', GetPlan);

export default app;
