import * as line from './notifier/line';
import getPlan from './getPlan';

export default getPlan(line.LineNotifier);
