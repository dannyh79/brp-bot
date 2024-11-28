import app from './rest';
import getPlanThenNotify from './scheduled';

export default {
  scheduled: getPlanThenNotify,
  fetch: app.fetch,
};
