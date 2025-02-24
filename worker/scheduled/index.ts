import { getPlan, listRecipients } from '@/readingPlans';
import D1PlanRepository from '@/repositories/d1Plan';
import D1RecipientRepository from '@/repositories/d1Recipient';
import { LineMultiNotifier } from '@/services/notifiers';
import { Repositories, Services, Usecases } from './types';

export const newRepositories = (env: Env): Repositories => ({
  plans: new D1PlanRepository(env.DB),
  recipients: new D1RecipientRepository(env.DB),
});

export const newUsecases = (repos: Repositories): Usecases => ({
  getPlan: getPlan(repos.plans),
  listRecipients: listRecipients(repos.recipients),
});

export const newServices = (env: Env): Services => ({
  notifier: new LineMultiNotifier({ channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN }),
});
