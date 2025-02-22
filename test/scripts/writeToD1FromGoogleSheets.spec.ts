import { execSync } from 'node:child_process';
import { Service, writeToD1FromGoogleSheets } from '@root/scripts/lib.mts';

describe('script writeToD1FromGoogleSheets', () => {
  it('prints help message when missing env SPREADSHEET_ID', async () => {
    const logger = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(
      async () => await import('@root/scripts/writeToD1FromGoogleSheets.mts'),
    ).rejects.toThrowError();
    expect(logger).toHaveBeenCalledOnce();
  });
});

describe('function writeToD1FromGoogleSheets', async () => {
  vi.mock('node:child_process', async () => {
    const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process');
    return {
      ...actual,
      execSync: vi.fn(),
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('NO extra spaces or line breaks in query command', async () => {
    await writeToD1FromGoogleSheets(new MockGoogleService());
    expect(execSync).toHaveBeenNthCalledWith(1, expect.stringContaining(expectedQueryValues), {
      stdio: 'inherit',
    });
  });

  it('writes row data to D1 local database', async () => {
    await writeToD1FromGoogleSheets(new MockGoogleService());

    expect(execSync).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /^npx[\s]+wrangler[\s]+d1[\s]+execute[\s]+DB[\s]+--command="[\s]*INSERT[\s]+INTO[\s]+plans.*ON[\s]+CONFLICT[\s]+\(date\)[\s]+DO[\s]+UPDATE[\s]+SET[\s]+praise_scope[\s]*=[\s]*excluded.praise_scope,[\s]*praise_content[\s]*=[\s]*excluded.praise_content,[\s]*devotional_scope[\s]*=[\s]*excluded.devotional_scope[\s]*;/is,
      ),
      { stdio: 'inherit' },
    );
  });

  it('writes row data to D1 remote database', async () => {
    await writeToD1FromGoogleSheets(new MockGoogleService(), { isRemote: true });

    expect(execSync).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /^npx[\s]+wrangler[\s]+d1[\s]+execute[\s]+DB[\s]+--remote[\s]+--command="[\s]*INSERT[\s]+INTO[\s]+plans.*ON[\s]+CONFLICT[\s]+\(date\)[\s]+DO[\s]+UPDATE[\s]+SET[\s]+praise_scope[\s]*=[\s]*excluded.praise_scope,[\s]*praise_content[\s]*=[\s]*excluded.praise_content,[\s]*devotional_scope[\s]*=[\s]*excluded.devotional_scope[\s]*;/is,
      ),
      { stdio: 'inherit' },
    );
  });
});

const stubData = [
  ['date', 'praise_scope', 'praise_content', 'devotional_scope'],
  [
    '2025-02-01',
    '詩篇 100:4-5 CCB',
    '要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；\n要感謝祂，稱頌祂的名。因為耶和華是美善的，\n祂的慈愛永遠長存，祂的信實千古不變。',
    '出埃及記 第三十六章',
  ],
  [
    '2025-02-02',
    // Cell with excess line-breaks or spaces at both ends
    '\n詩篇 145:1-3 CCB ',
    // Cell with excess line-breaks or spaces at both ends and a space after non-Chinese punctuation marks.
    '\n 我的上帝,我的王啊!我要尊崇你,我要永永遠遠稱頌你的名. \n我要天天稱頌你,永永遠遠讚美你的名。\n耶和華是偉大的,當受至高的頌讚,祂的偉大無法測度。\n',
    '出埃及記 第三十七章',
  ],
];

const expectedQueryValues = `('2025-02-01', '詩篇 100:4-5 CCB', '要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；\n要感謝祂，稱頌祂的名。因為耶和華是美善的，\n祂的慈愛永遠長存，祂的信實千古不變。', '出埃及記 第三十六章'),\n('2025-02-02', '詩篇 145:1-3 CCB', '我的上帝，我的王啊！我要尊崇你，我要永永遠遠稱頌你的名。\n我要天天稱頌你，永永遠遠讚美你的名。\n耶和華是偉大的，當受至高的頌讚，祂的偉大無法測度。', '出埃及記 第三十七章')`;

class MockGoogleService implements Service<string[][]> {
  execute(): Promise<string[][]> {
    return Promise.resolve(stubData);
  }
}
