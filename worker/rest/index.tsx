import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { basicAuth } from 'hono/basic-auth';
import { csrf } from 'hono/csrf';
import { createMiddleware } from 'hono/factory';
import { toDateString } from '@worker/lib';
import { registerAuthComponent } from './middlewares';
import * as endpoints from './v1/endpoints';
import { NotificationPage, PlanPage } from './templates';
import { notificationChannels, sendNotification } from './notificationChannels';

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
const notificationHeaders = createMiddleware(async (c, next) => {
  c.header('Cache-Control', 'no-store');
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  );
  await next();
});
app.use('/admin/notifications', notificationHeaders);
app.use('/api/v1/admin/notifications', notificationHeaders);
app.use('/api/v1/admin/notifications', csrf());

const notificationInput = z.object({
  date: z.iso.date(),
  channel: z.enum(Object.keys(notificationChannels) as (keyof typeof notificationChannels)[]),
});
const channels = Object.entries(notificationChannels).map(([value, { label }]) => ({ value, label }));

app.get('/admin/notifications', async (c) => {
  return c.render(await NotificationPage({ channels }));
});

app.post('/api/v1/admin/notifications', async (c) => {
  const form = await c.req.parseBody();
  const parsed = notificationInput.safeParse(form);
  if (!parsed.success || (form.action !== 'confirm' && form.action !== 'send')) {
    c.status(400);
    return c.render(await NotificationPage({ channels, message: 'Invalid date or channel' }));
  }
  if (form.action === 'confirm') {
    return c.render(await NotificationPage({ channels, confirmation: parsed.data }));
  }
  const { status, body } = await sendNotification(c.env as Env, parsed.data.date, parsed.data.channel);
  const message = 'delivered' in body
    ? `${'message' in body ? `${body.message} — ` : ''}Delivered: ${body.delivered}, failed: ${body.failed}`
    : body.message;
  c.status(status);
  return c.render(await NotificationPage({ channels, message }));
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
