import { Context } from 'hono';
import { getPlan, saveRecipient } from '@/readingPlans';

export type Bindings = {
  DB: D1Database;
};

export type Vars = {
  getPlan: ReturnType<typeof getPlan>;
  saveRecipient: ReturnType<typeof saveRecipient>;
};

export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Vars;
}>;
