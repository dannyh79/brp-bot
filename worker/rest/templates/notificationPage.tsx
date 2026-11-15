import { html, raw } from 'hono/html';

const script = `
const form = document.querySelector('#send'), result = document.querySelector('#result'), button = form.querySelector('button');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const date = form.date.value, channel = form.channel.value;
  if (!confirm('Send the ' + channel + ' plan for ' + date + '? This can duplicate previous deliveries.')) return;
  button.disabled = true;
  result.textContent = 'Sending…';
  try {
    const response = await fetch(location.pathname, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({date, channel})});
    const data = await response.json();
    result.textContent = response.ok ? 'Delivered: ' + data.delivered + ', failed: ' + data.failed : (data.message || 'Delivery failed') + (data.failed !== undefined ? ' (delivered: ' + data.delivered + ', failed: ' + data.failed + ')' : '');
  } catch { result.textContent = 'Request failed. Check logs before retrying; delivery may have occurred.'; }
  finally { button.disabled = false; }
});`;

export const NotificationPage = () =>
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
          <form id="send">
            <label>
              Channel
              <select name="channel">
                <option value="telegram">Telegram</option>
                <option value="line">LINE</option>
              </select>
            </label>
            <label>
              Plan date (Taipei) <input name="date" type="date" required />
            </label>
            <button>Send notification</button>
          </form>
          <p id="result" role="status"></p>
          <script>{raw(script)}</script>
        </body>
      </html>
    )}`;
