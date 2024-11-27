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

# To test scheduled tasks
# See: https://developers.cloudflare.com/workers/examples/cron-trigger/#test-cron-triggers-using-wrangler
pnpm dev --test-scheduled

# Use cron query value by desired schedule
curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
```

## Gotchas

Scheduled notification is designated to send to only one LINE contact, `LINE_RECEIPIENT_ID`,, for now.
