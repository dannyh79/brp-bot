import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { basicAuth } from 'hono/basic-auth';
import {
  newLineServices,
  newRepositories,
  newTelegramServices,
  newUsecases,
} from '@worker/scheduled';
import getPlanThenNotifyTelegram from '@worker/scheduled/getPlanThenNotifyTelegram';
import { toDateString } from '@worker/lib';
import { registerAuthComponent } from './middlewares';
import * as endpoints from './v1/endpoints';
import { PlanPage } from './templates';
import { NotificationPage } from './templates/notificationPage';

const app = new OpenAPIHono();

//#region Uncomment this to expose POST /callback endpoint (for retrieving recipient ID for LINE)
// app.post('/api/v1/callback', async (ctx) => {
//   const res = await ctx.req.json();
//   console.log(res);
//   return ctx.json({}, 200);
// });
//#endregion

app.use('/api/v1/admin/notifications', async (c, next) => {
  const password = (c.env as Env).NOTIFICATION_ADMIN_PASSWORD;
  if (!password?.trim()) return c.text('Notification authentication is not configured', 503);
  await basicAuth({ username: 'admin', password })(c, next);
});

app.get('/api/v1/admin/notifications', async (c) => {
  c.header('Cache-Control', 'no-store');
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  );
  return c.html(await NotificationPage());
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
    .object({ date: z.iso.date(), channel: z.enum(['telegram', 'line']) })
    .safeParse(body);
  if (!parsed.success) return c.json({ message: 'Invalid date or channel' }, 400);
  const { date, channel } = parsed.data;
  if (
    channel === 'telegram' &&
    (!env.TELEGRAM_BOT_TOKEN?.trim() ||
      !env.TELEGRAM_CHAT_IDS?.trim() ||
      !env.TELEGRAM_ADMIN_CHAT_ID?.trim())
  ) {
    return c.json({ message: 'Telegram is not configured' }, 503);
  }
  if (
    channel === 'line' &&
    (!env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || !env.LINE_ADMIN_RECIPIENT_ID?.trim())
  ) {
    return c.json({ message: 'LINE is not configured' }, 503);
  }
  const usecases = newUsecases(newRepositories(env));
  const plan = await usecases.getPlan({ date });
  if (!plan) return c.json({ message: 'Plan not found' }, 404);
  let delivered = 0;
  let failed = 0;
  try {
    if (channel === 'line') {
      const recipients = ((await usecases.listRecipients()) ?? []).map((recipient) => recipient.id);
      const results = await newLineServices(env).notifier.pushMessage(recipients, plan);
      failed = results.filter((result) => result.status === 'rejected').length;
      delivered = results.length - failed;
      if (failed) throw new Error('LINE delivery failed');
    } else {
      const notifier = newTelegramServices(env).notifier;
      await getPlanThenNotifyTelegram({
        usecases: { getPlan: async () => plan },
        services: {
          notifier: {
            pushMessage: async (recipients, message) => {
              const results = await notifier.pushMessage(recipients, message);
              failed = results.filter((result) => result.status === 'rejected').length;
              delivered = results.length - failed;
              return results;
            },
          },
        },
      })(
        { scheduledTime: Date.parse(`${date}T12:00:00Z`) } as ScheduledController,
        env,
        {} as ExecutionContext,
      );
    }
  } catch {
    console.error('Manual notification delivery failed', { date, channel, delivered, failed });
    return c.json(
      { message: 'Delivery failed; check logs before retrying', delivered, failed },
      502,
    );
  }
  return c.json({ delivered, failed });
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
