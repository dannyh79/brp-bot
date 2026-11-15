import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { basicAuth } from 'hono/basic-auth';
import { createMiddleware } from 'hono/factory';
import { newRepositories, newUsecases } from '@worker/scheduled';
import { toDateString } from '@worker/lib';
import { registerAuthComponent } from './middlewares';
import * as endpoints from './v1/endpoints';
import { NotificationPage, PlanPage } from './templates';
import { notificationChannels } from './notificationChannels';

const app = new OpenAPIHono();

//#region Uncomment this to expose POST /callback endpoint (for retrieving recipient ID for LINE)
// app.post('/api/v1/callback', async (ctx) => {
//   const res = await ctx.req.json();
//   console.log(res);
//   return ctx.json({}, 200);
// });
//#endregion

const notificationAuth = createMiddleware(async (c, next) => {
  const password = (c.env as Env).NOTIFICATION_ADMIN_PASSWORD;
  if (!password?.trim()) return c.text('Notification authentication is not configured', 503);
  await basicAuth({ username: 'admin', password })(c, next);
});
app.use('/admin/notifications', notificationAuth);
app.use('/api/v1/admin/notifications', notificationAuth);

app.get('/admin/notifications', async (c) => {
  c.header('Cache-Control', 'no-store');
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  );
  return c.render(await NotificationPage({ channels: Object.entries(notificationChannels).map(([value, { label }]) => ({ value, label })) }));
});

app.post('/api/v1/admin/notifications', async (c) => {
  const env = c.env as Env;
  let body: unknown;
  try {
    if (!c.req.header('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return c.json({ message: 'Expected JSON' }, 400);
    }
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON' }, 400);
  }
  const parsed = z
    .object({ date: z.iso.date(), channel: z.enum(Object.keys(notificationChannels) as (keyof typeof notificationChannels)[]) })
    .safeParse(body);
  if (!parsed.success) return c.json({ message: 'Invalid date or channel' }, 400);
  const { date, channel } = parsed.data;
  const delivery = notificationChannels[channel];
  if (!delivery.configured(env)) return c.json({ message: `${channel} is not configured` }, 503);
  const usecases = newUsecases(newRepositories(env));
  const plan = await usecases.getPlan({ date });
  if (!plan) return c.json({ message: 'Plan not found' }, 404);
  try {
    const results = await delivery.send({ env, date, plan, usecases });
    const failed = results.filter((result) => result.status === 'rejected').length;
    const delivered = results.length - failed;
    if (failed) {
      console.error('Manual notification delivery failed', { date, channel, delivered, failed });
      return c.json({ message: 'Delivery failed; check logs before retrying', delivered, failed }, 502);
    }
    return c.json({ delivered, failed });
  } catch {
    console.error('Manual notification delivery failed', { date, channel });
    return c.json({ message: 'Delivery failed; check logs before retrying', delivered: 0, failed: 0 }, 502);
  }
});

// Register OpenAPI endpoints

app.openapi(endpoints.getPlan, async (c) => {
  const { date, format } = c.req.valid('query');

  const usecase = c.get('getPlan');
  const usecaseOutput = await usecase({ date: date || toDateString(new Date()) });

  if (!usecaseOutput) {
    return c.notFound();
  }

  const { data, error, success } = endpoints.GetPlanOutputSchema.safeParse(usecaseOutput);

  if (!success) {
    console.error(error.message);
    return c.json({ message: 'Internal server error' }, 500);
  }

  switch (format) {
    case 'html': {
      let customScript: string | undefined;
      try {
        // NOTE: Use runtime import to avoid bundler errors
        const scriptName = 'customScript';
        const module = await import(`./templates/${scriptName}.ts`);

        customScript = module.default;
      } catch {
        // Ignore if custom script not found
      }
      return c.render(<PlanPage plan={data} customScript={customScript} />);
    }
    case 'json':
    default:
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
