import { html, raw } from 'hono/html';
import { FC, PropsWithChildren } from 'hono/jsx';
import { toLocaleDateObject } from '@/readingPlans';
import * as endpoints from '../v1/endpoints';

export type LayoutProps = PropsWithChildren<{ title: string; customScript?: string | undefined }>;

export const Layout: FC<LayoutProps> = ({ title, children, customScript = '' }) =>
  html`<!DOCTYPE html>
    <html lang="zh-Hant">
      <head>
        <title>${title}</title>
        <meta
          name="description"
          content="The Hope 好好靈修每日靈修內容。 PDF 版請至 thehope.co/brp 。"
        />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script defer src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body>
        ${children}${raw(customScript)}
      </body>
    </html>`;

export type PlanPageProps = {
  plan: endpoints.GetPlanOutput;
  customScript?: string | undefined;
};

const repentencePrelude = [
  '聖靈，求祢今日光照我的生命。',
  '顯明那些祢命定我去行，我卻尚未行的事；',
  '也顯明那些祢不喜悅，我卻仍執意去行的事。',
];

const holyWeekVideos: Record<string, string | undefined> = {
  '2026-03-29':
    'https://drive.google.com/file/d/12NBd3Q5sNbsoM2PsW2GQ34il5zeI1-2x/view?usp=share_link',
  '2026-03-30':
    'https://drive.google.com/file/d/1vP_IUzGZ67Le1ezd1Ry_6Ot_tYLKCgcK/view?usp=share_link',
  '2026-03-31':
    'https://drive.google.com/file/d/1_dLF3UaJsrdy9BhdfaxwS6SIm3V7CsBS/view?usp=share_link',
  '2026-04-01':
    'https://drive.google.com/file/d/1lInHFzEMODynAyfX3bFylxYlLwTk28hq/view?usp=share_link',
  '2026-04-02':
    'https://drive.google.com/file/d/1tS_IEVv-uxnM3gP4qq0MGQCjAxlRiWlW/view?usp=share_link',
  // FIXME: AMEND THIS when the video is ready
  '2026-04-03': undefined,
  '2026-04-04':
    'https://drive.google.com/file/d/1faz7SpfxktQjI2g1QEqpNKsn25J3djZw/view?usp=share_link',
  '2026-04-05':
    'https://drive.google.com/file/d/1sWJ8NEj-FhdZYSbC8XW_2-6K0mub7K5i/view?usp=share_link',
};

export const PlanPage: FC<PlanPageProps> = ({ plan, customScript }) => {
  const [preludePrayer, ...theLordPrayer] = plan.prayer.split('\n');
  const { date, dayOfWeek } = toLocaleDateObject(plan.date);
  const holyWeekVideo = holyWeekVideos[plan.date];

  return (
    <Layout title={`好好靈修 Daily Devotion - ${plan.date}`} customScript={customScript}>
      <main class="max-w-md mx-2 md:mx-auto p-4 bg-[#FEFEFE] rounded-xl shadow-md text-[#5D5D5D]">
        <h1 class="bg-[#FFCC32] font-bold text-[#1D292E] text-2xl pl-4 py-4 rounded-lg mb-3">
          好好靈修 Daily Devotion
        </h1>

        {holyWeekVideo && (
          <section class="mb-4 bg-[#1D292E] text-white rounded-lg p-4">
            <h3 class="font-bold text-xl mb-2">聖週好好靈修導讀</h3>
            <a
              href={holyWeekVideo}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[#FFCC32] break-all"
            >
              點此觀看導讀影片
            </a>
          </section>
        )}

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
                {/* TODO: Put 聖週靈修好好閱讀 link from 2026-03-29 thru 2026-04-05 as href here */}
                {/* start: block that only shows from 2026-03-29 thru 2026-04-05 */}
                {/* <div class="pl-2"> */}
                {/*   <a */}
                {/*     // href={link} */}
                {/*     class="text-blue-500 hover:underline text-md block my-2" */}
                {/*     target="_blank" */}
                {/*     rel="noopener noreferrer" */}
                {/*   > */}
                {/*     聖週靈修好好閱讀 */}
                {/*   </a> */}
                {/* </div> */}
                {/* end: block that only shows from 2026-03-29 thru 2026-04-05 */}

                {plan.devotional.scope.map((scope, index) => (
                  <ScopeWithLink key={scope} scope={scope} link={plan.devotional.link[index]} />
                ))}
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

const ScopeWithLink = ({ scope, link }: { scope: string; link: string }) => (
  <div class="pl-2">
    <p class="font-bold text-xl">{scope}</p>
    <a
      href={link}
      class="text-blue-500 hover:underline text-md block my-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      YouVersion 連結
    </a>
  </div>
);
