import { Context } from 'hono';
import getPlan from '@/readingPlans/getPlan';

export type Vars = {
  getPlan: ReturnType<typeof getPlan>;
};

export type AppContext = Context<{
  Variables: Vars;
}>;
