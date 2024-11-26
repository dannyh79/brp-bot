import app from './rest';
import getPlan from './scheduled';

export default {
  scheduled: getPlan,
  fetch: app.fetch,
};
