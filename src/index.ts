import { fromHono } from 'chanfana';
import { Hono } from 'hono';
import HelloWorld from './endpoints/helloWorld';

const app = new Hono();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: '/doc',
});

// Register OpenAPI endpoints
openapi.get('/', HelloWorld);

export default app;
