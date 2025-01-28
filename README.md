# BRP Bot

## Prereqs

- asdf

## Getting Started

```sh
asdf install

pnpm dev

# OpenAPI available at http://localhost:8787/doc
# SwaggerUI available at http://localhost:8787/ui

cp .dev.vars.example .dev.vars
# Then update the values in .dev.vars

pnpm db:migrate

# To test scheduled tasks
# See: https://developers.cloudflare.com/workers/examples/cron-trigger/#test-cron-triggers-using-wrangler
pnpm dev --test-scheduled

# Use cron query value by desired schedule
curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
```

## Deploying

_[NEED TO USE MANUAL UPLOAD FROM CLOUDFLARE CONSOLE AT MOMENT](https://github.com/cloudflare/workers-sdk/issues/7287)._

> Only Cloudflare Workers platform is supported at moment.

```sh
cp secrets.json.example secrets.json
# Then update the values in secrets.json

npx wrangler login
pnpm run deploy
npx wrangler secret bulk < secrets.json
```

## Development

### Create Migration and Apply Them

```sh
pnpm db:migrate:create {{ migration_file_name }}
# Then edith the file in /migrations

pnpm db:migrate
```

## Gotchas

### LINE

#### Only One Receipient

Scheduled notification is designated to send to only one LINE contact, `LINE_RECEIPIENT_ID`, for now.

#### How to Get env `LINE_RECEIPIENT_ID`

Assume a LINE bot is already configured:

1. Expose endpoint `POST /callback` by uncomment the code block in /worker/rest/index.ts
2. Deploy to Cloudflare via `npx wrangler deploy`
3. Set Webhook URL in "Messaging API" tab, from [LINE Developers console](https://developers.line.biz/console)
4. Confirm "Use webhook" option is enabled; cURL response should include `"active":true`

   ```sh
   curl \
   -H 'Authorization: Bearer YOUR_LINE_CHANNEL_ACCESS_TOKEN' \
   -H 'Content-Type:application/json' \
   https://api.line.me/v2/bot/channel/webhook/endpoint
   # {"endpoint":"https://example.workers.dev/callback","active":true}
   ```

5. Monitor logs on Cloudflare to retrieve desired value from payload's `["events"][0]["source"]` field

   > https://developers.cloudflare.com/workers/observability/logs/ > https://developers.line.biz/en/docs/messaging-api/group-chats/#receiving-webhook-events

6. Hide endpoint `POST /callback` by comment the code block in /worker/rest/index.ts and deploy again
7. Disable "Use webhook" option from [LINE Developers console](https://developers.line.biz/console)

#### How to Get env `LINE_ADMIN_RECEIPIENT_ID`

Use "Your user ID" value, started from `U`, in "Basic settings" tab, from [LINE Developers console](https://developers.line.biz/console).
