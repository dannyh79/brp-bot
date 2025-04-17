import { html } from 'hono/html';
import { FC, PropsWithChildren } from 'hono/jsx';
import { Plan, toLocaleDateObject } from '@/readingPlans';

export type LayoutProps = PropsWithChildren<{ title: string }>;

export const Layout: FC<LayoutProps> = ({ title, children }) =>
  html`<!DOCTYPE html>
    <html lang="zh-Hant">
      <head>
        <title>${title}</title>
        <meta
          name="description"
          content="[非官方] The Hope 好好靈修每日靈修內容。 PDF 版請至 thehope.co/brp 。"
        />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script defer src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body>
        ${children}
      </body>
    </html>`;

export type PlanPageProps = {
  plan: Plan;
};

const repentencePrelude = [
  '聖靈懇求祢在今天光照我在生命中，有沒有什麼是祢要我去做，但我沒有去做的事？',
  '又有什麼是祢不喜悅我去做，但我卻行的事？',
];

export const PlanPage: FC<PlanPageProps> = ({ plan }) => {
  const [preludePrayer, ...theLordPrayer] = plan.prayer.split('\n');
  const { date, dayOfWeek } = toLocaleDateObject(plan.date);
  return (
    <Layout title={`好好靈修 Daily Devotion - ${plan.date}`}>
      <main class="max-w-md mx-2 md:mx-auto p-4 bg-[#FEFEFE] rounded-xl shadow-md text-[#5D5D5D]">
        <h1 class="bg-[#FFCC32] font-bold text-[#1D292E] text-2xl pl-4 py-4 rounded-lg mb-3">
          好好靈修 Daily Devotion
        </h1>
        <article class="space-y-6 text-md leading-8">
          <div class="bg-[#EEF0F4] rounded-lg px-4 py-4">
            <h2 class="text-lg mb-4">{[date, dayOfWeek].join(' ')}</h2>
            <section class="mb-6 flex">
              <h3 class="font-bold text-[#1D292E] text-xl text-center">讚美</h3>
              <div class="flex flex-col items-center space-y-1">
                <span class="flex-none rounded-full bg-[#1D292E] w-3 h-3"></span>
                <span class="rounded-lg bg-[#1D292E] w-0.75 h-full"></span>
              </div>
              <div class="pb-2 pl-6 w-full font-bold">
                <p>{plan.praise.content}</p>
                <p>{plan.praise.scope}</p>
              </div>
            </section>

            <section class="mb-6 flex">
              <h3 class="font-bold text-[#1D292E] text-xl text-center">悔改</h3>
              <div class="flex flex-col items-center space-y-1">
                <span class="flex-none rounded-full bg-[#1D292E] w-3 h-3"></span>
                <span class="rounded-lg bg-[#1D292E] w-0.75 h-full"></span>
              </div>
              <div class="w-full space-y-2">
                <div class="rounded-2xl bg-[#1D292E] text-white ml-2 px-4 py-2">
                  {repentencePrelude.map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                </div>
                <div class="pb-2 pl-6">
                  {plan.repentence.split('\n').map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <section class="mb-6 flex">
              <h3 class="font-bold text-[#1D292E] text-xl text-center">反思</h3>
              <div class="flex flex-col items-center space-y-1">
                <span class="flex-none rounded-full bg-[#1D292E] w-3 h-3"></span>
                <span class="rounded-lg bg-[#1D292E] w-0.75 h-full"></span>
              </div>
              <div class="w-full space-y-2">
                <div class="pl-2">
                  <p class="font-bold text-xl">{plan.devotional.scope}</p>
                  <a
                    href={plan.devotional.link}
                    class="text-blue-500 hover:underline text-md block my-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YouVersion 連結
                  </a>
                </div>
                <div class="rounded-2xl bg-[#1D292E] text-white ml-2 mb-2 px-4 py-2">
                  {plan.devotional.content.map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <section class="flex">
              <h3 class="font-bold text-[#1D292E] text-xl text-center">祈禱</h3>
              <div class="flex flex-col items-center space-y-1">
                <span class="flex-none rounded-full bg-[#1D292E] w-3 h-3"></span>
                <span class="rounded-lg bg-[#1D292E] w-0.75 h-full"></span>
              </div>
              <div class="w-full space-y-2">
                <p class="rounded-2xl bg-[#1D292E] text-white ml-2 px-4 py-2">{preludePrayer}</p>
                <div class="pb-2 pl-6">
                  {theLordPrayer.map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
    </Layout>
  );
};
