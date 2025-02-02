// const stubGoogleSheetsData = [
//   ['date', 'praise_scope', 'praise_content', 'devotional_scope'],
//   [
//     '2025-02-01',
//     '詩篇 100:4-5 CCB',
//     '要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；\n要感謝祂，稱頌祂的名。因為耶和華是美善的，\n祂的慈愛永遠長存，祂的信實千古不變。',
//     '出埃及記 第三十六章',
//   ],
//   [
//     '2025-02-02',
//     // Cell with excess line-breaks or spaces at both ends
//     '\n詩篇 145:1-3 CCB ',
//     // Cell with excess line-breaks or spaces at both ends and a space after non-Chinese punctuation marks.
//     '\n 我的上帝,我的王啊!我要尊崇你,我要永永遠遠稱頌你的名. \n我要天天稱頌你,永永遠遠讚美你的名。\n耶和華是偉大的,當受至高的頌讚,祂的偉大無法測度。\n',
//     '出埃及記 第三十七章',
//   ],
// ];

/**
 * FIXME:
 * Impl when @cloudflare/vitest-pool-workers supports Vitest v3, for script impl uses Node APIs and Vitest defaults to browser APIs only.
 * https://github.com/cloudflare/workers-sdk/pull/7923
 * https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/
 * https://vitest.dev/guide/workspace
 */
describe.todo('script writeToD1FromGoogleSheet', () => {
  it.todo('prints help message');
  it.todo('throws when authentication fails');
  it.todo('reads data from GoogleSheets');
  it.todo('NO extra spaces or line breaks in row data');
  it.todo('writes row data to D1 local database');
  it.todo('writes row data to D1 remote database');
});
