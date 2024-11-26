import { Plan } from '@/entities/plan';
import { Repository } from './types';

export default class InMemoryPlanRepository implements Repository<Plan> {
  findById(date: string): Promise<Plan | null> {
    return Promise.resolve(data[date] ?? null);
  }
}

const data: Record<string, Plan> = {
  '2024-11-26': {
    date: '2024-11-26',
    scope: '創世紀 23',
    content: [
      '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?',
      '2. 亞伯拉罕的品格有什麼值得你學習的地方?',
    ],
  },
  '2024-11-27': {
    date: '2024-11-27',
    scope: '創世紀 24:1-9',
    content: [
      '1. 亞伯拉罕如何吩咐他的僕人為以撒尋找合適的妻子呢?',
      '2. 從亞伯拉罕對他僕人的再三叮嚀中,你看見在他心中所在意的優先次序是什麼呢?',
    ],
  },
  '2024-11-28': {
    date: '2024-11-28',
    scope: '創世紀 24:10-67',
    content: [
      '1. 亞伯拉罕的僕人在尋找以撒的妻子時,如何向神禱告尋求呢?從他僕人的行動中可以看見他對神如何有一顆敬畏的心呢?',
      '2. 在利百加的回應中,你看到了她有什麼樣的品格和信心?從她的選擇和順服可以看見她對神如何有一顆敬畏的心呢?',
    ],
  },
  '2024-11-29': {
    date: '2024-11-29',
    scope: '創世紀 25',
    content: [
      '1. 從 24-34 節中,你看見以掃和雅各他們兄弟性情上有哪些差異呢?以及他們看重的各是什麼?',
      '2. 以掃的疲憊真的會讓他感到快要死了嗎?你認為在第32節中,以掃為什麼會這樣回答?他為何會因當時的感受而輕視作為長子的名分和祝福?這對你有什麼樣的提醒呢?',
    ],
  },
  '2024-11-30': {
    date: '2024-11-30',
    scope: '創世紀 26',
    content: [
      '1. 第 2-5 節中你看見上帝如何清楚的指示以撒呢?在你的生活中是否也常常尋求神的心意並且聽見神的指引呢?通常你會用什麼樣的行動回應神呢?',
      '2. 以撒如何回應哪些與他們相爭水井的牧人們呢?從以撒的回應中你看見他擁有什麼樣的品格呢?你認為他對神的相信如何幫助他有這樣的回應呢?',
    ],
  },
};
