import { Context } from 'hono';
import * as readingPlan from '@/readingPlans';

export type Bindings = {
  DB: D1Database;
  API_TOKEN: string;
  MOCK_DATE: boolean;
};

export type Vars = {
  getPlan: ReturnType<typeof readingPlan.getPlan>;
  destroyRecipient: ReturnType<typeof readingPlan.destroyRecipient>;
  saveRecipient: ReturnType<typeof readingPlan.saveRecipient>;
  mockDate: Date;
};

export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Vars;
}>;
