# BRP Bot

## Prereqs

- asdf

## Getting Started

```sh
asdf install

cp wrangler.toml.example wrangler.toml
# Then update the values in wrangler.toml to your needs

cp .dev.vars.example .dev.vars
# Then update the values in .dev.vars to your needs

pnpm db:migrate

# Update worker/d1/seed.sql YOUR-LINE-GROUP-ID to your LINE group ID
# See: Gotchas section for more info
pnpm db:seed

# To test scheduled tasks
# See: https://developers.cloudflare.com/workers/examples/cron-trigger/#test-cron-triggers-using-wrangler
pnpm dev --test-scheduled

# OpenAPI available at http://localhost:8787/api/v1/doc
# SwaggerUI available at http://localhost:8787/api/v1/ui

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

### Interacting with D1 Database

```sh
# Create migration
pnpm db:migrate:create {{ migration_file_name }}
# Then edit the file in /migrations

# Apply migrations
pnpm db:migrate

# Write data from GoogleSheets spreadsheet to D1 database
# Prereqs:
# - GoogleSheets sheet (Sheet schema: TODO)
# - GCP service account that has access to the sheet
SPREADSHEET_ID={{ GoogleSheets spreadsheet ID }} SHEET_NAME={{ GoogleSheets sheet name }} KEY_FILE_PATH={{ /path/to/your/gcp-service-account.json }} pnpm db:write

# Access local database; requires sqlite client `sqlite3`
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/{{ some_version }}.sqlite
```

## Gotchas

### LINE

#### How to Get Your LINE Group's Group ID for Live Testing

Assume a LINE bot is already configured:

1. Expose endpoint `POST /api/v1/callback` by uncomment the code block in /worker/rest/index.ts
2. Deploy to Cloudflare via `npx wrangler deploy`
3. Set Webhook URL in "Messaging API" tab, from [LINE Developers console](https://developers.line.biz/console)
4. Confirm "Use webhook" option is enabled; cURL response should include `"active":true`

   ```sh
   curl \
   -H 'Authorization: Bearer YOUR_LINE_CHANNEL_ACCESS_TOKEN' \
   -H 'Content-Type:application/json' \
   https://api.line.me/v2/bot/channel/webhook/endpoint
   # {"endpoint":"https://example.workers.dev/api/v1/callback","active":true}
   ```

5. Invite your LINE bot into the LINE group

6. Monitor logs on Cloudflare to retrieve `groupId` value from payload's `["events"][0]["source"]` field

   > https://developers.cloudflare.com/workers/observability/logs/ > https://developers.line.biz/en/docs/messaging-api/group-chats/#receiving-webhook-events

7. Once retrieved the `groupId` Hide endpoint `POST /api/v1/callback` by comment the code block in /worker/rest/index.ts and deploy again
8. Disable "Use webhook" option from [LINE Developers console](https://developers.line.biz/console)
9. Replace /worker/d1/seed.sql `YOUR-LINE-GROUP-ID` value by the `groupId`, then run `pnpm db:seed`

#### How to Get env `LINE_ADMIN_RECEIPIENT_ID`

Use "Your user ID" value, started from `U`, in "Basic settings" tab, from [LINE Developers console](https://developers.line.biz/console).
