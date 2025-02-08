import { Context } from 'hono';
import * as readingPlan from '@/readingPlans';

export type Bindings = {
  DB: D1Database;
};

export type Vars = {
  getPlan: ReturnType<typeof readingPlan.getPlan>;
  destroyRecipient: ReturnType<typeof readingPlan.destroyRecipient>;
  saveRecipient: ReturnType<typeof readingPlan.saveRecipient>;
};

export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Vars;
}>;
