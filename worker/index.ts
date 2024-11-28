import app from './rest';
import getPlanThenNotifyLine from './scheduled';

export default {
  scheduled: getPlanThenNotifyLine,
  fetch: app.fetch,
};
