import { Plan } from '@/readingPlans';
import { FC } from 'hono/jsx';

const Layout: FC = (props) => (
  <html>
    <body>{props.children}</body>
  </html>
);

export type PlanPageProps = {
  plan: Plan;
};

export const PlanPage: FC<PlanPageProps> = ({ plan }) => (
  <Layout>
    <main>
      <h1>{plan.date}</h1>
      <p>
        {plan.praise.content} ({plan.praise.scope})
      </p>
      <p>{plan.repentence}</p>
      <p>{plan.devotional.scope}</p>
      <p>{plan.prayer}</p>
    </main>
  </Layout>
);
