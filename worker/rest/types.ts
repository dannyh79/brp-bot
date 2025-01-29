import { Context } from 'hono';
import { getPlan } from '@/readingPlans';

export type Bindings = {
  DB: D1Database;
};

export type Vars = {
  getPlan: ReturnType<typeof getPlan>;
};

export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Vars;
}>;
