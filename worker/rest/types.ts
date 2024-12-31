import { Context } from 'hono';
import { getPlan } from '@/readingPlans';

export type Vars = {
  getPlan: ReturnType<typeof getPlan>;
};

export type AppContext = Context<{
  Variables: Vars;
}>;
