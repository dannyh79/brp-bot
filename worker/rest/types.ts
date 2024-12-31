import { Context } from 'hono';
import { get2024Plan as getPlan } from '@/readingPlans';

export type Vars = {
  getPlan: ReturnType<typeof getPlan>;
};

export type AppContext = Context<{
  Variables: Vars;
}>;
