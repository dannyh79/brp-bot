import { toBubbleMessage } from '@/services/notifiers/line/utils';

describe('toBubbleMessage()', () => {
  const data = {
    date: '2025-01-01',
    praise: {
      scope: '歷代志上 16:34 CCB',
      content: '你們要稱謝耶和華, 因為祂是美善的, 祂的慈愛永遠長存!',
    },
    repentence:
      '上帝啊，求你按你的慈愛恩待我！\n按你極大的憐憫除去我 ___ 的過犯！\n求你洗淨我的罪過，清除我的罪惡。求你讓我重新享受蒙你拯救的喜樂，賜我一個樂意順服你的心靈。',
    devotional: {
      scope: ['出埃及記 第 8 章'],
      link: ['https://www.bible.com/bible/1392/EXO.8'],
      content: ['1. 你覺得神透過今天的經文對你說什麼呢?', '2. 有什麼你可以做出的行動或改變呢?'],
    },
    prayer:
      '”神啊！我將我的，___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n『我們在天上的父：願人都尊你的名為聖。願你的國降臨；願你的旨意行在地上，如同行在天上。我們日用的飲食，今日賜給我們。免我們的債，如同我們免了人的債。不叫我們陷入試探；救我們脫離那惡者。因為國度、權柄、榮耀，全是你的，直到永遠。阿們！』”',
  };

  it('returns LINE bubble message payload', () => {
    const result = toBubbleMessage(data);
    expect(result).toMatchSnapshot();
  });

  it('includes Holy Week video section when date is in range', () => {
    const holyWeekData = {
      ...data,
      date: '2026-03-29',
    };
    const result = toBubbleMessage(holyWeekData);
    expect(JSON.stringify(result)).toContain('聖週好好靈修導讀');
    expect(JSON.stringify(result)).toContain(
      'https://drive.google.com/file/d/12NBd3Q5sNbsoM2PsW2GQ34il5zeI1-2x/view?usp=share_link',
    );
    expect(result).toMatchSnapshot();
  });
});
