import { html, raw } from 'hono/html';

export const NotificationPage = ({
  channels,
  confirmation,
  message,
}: {
  channels: { value: string; label: string }[];
  confirmation?: { channel: string; date: string };
  message?: string;
}) =>
  html`<!doctype html>${(
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Resend notification</title>
          <style>
            {raw(
              'body{font:16px system-ui;max-width:32rem;margin:2rem auto;padding:0 1rem}input,select,button{font:inherit;padding:.75rem;margin:.5rem 0}label,button{display:block}',
            )}
          </style>
        </head>
        <body>
          <h1>Resend notification</h1>
          <p>Resending may duplicate messages already delivered.</p>
          {confirmation ? (
            <form method="post" action="/api/v1/admin/notifications">
              <p>Send {confirmation.channel} for {confirmation.date}?</p>
              <input type="hidden" name="channel" value={confirmation.channel} />
              <input type="hidden" name="date" value={confirmation.date} />
              <button name="action" value="send">Confirm send</button>
              <a href="/admin/notifications">Cancel</a>
            </form>
          ) : (
            <form method="post" action="/api/v1/admin/notifications">
              <label>
                Channel
                <select name="channel">
                  {channels.map(({ value, label }) => <option value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                Plan date (Taipei) <input name="date" type="date" required />
              </label>
              <button name="action" value="confirm">Review notification</button>
            </form>
          )}
          {message && <p role="status">{message}</p>}
        </body>
      </html>
    )}`;
