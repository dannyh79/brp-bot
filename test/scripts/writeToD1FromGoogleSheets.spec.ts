import { execSync } from 'node:child_process';
import { GoogleSheetsService, Service, writeToD1FromGoogleSheets } from '@root/scripts/lib.mts';

vi.mock('@root/scripts/lib.mts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@root/scripts/lib.mts')>();
  return {
    ...actual,
    GoogleSheetsService: vi.fn(),
    writeToD1FromGoogleSheets: vi.fn(actual.writeToD1FromGoogleSheets),
  };
});

describe('script writeToD1FromGoogleSheets', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SPREADSHEET_ID', undefined);
    vi.stubEnv('SHEET_RANGE_START', undefined);
    vi.stubEnv('SHEET_RANGE_END', undefined);
    vi.mocked(GoogleSheetsService).mockClear();
    vi.mocked(writeToD1FromGoogleSheets).mockClear();
  });

  it('prints help message when missing env SPREADSHEET_ID', async () => {
    const logger = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(
      async () => await import('@root/scripts/writeToD1FromGoogleSheets.mts'),
    ).rejects.toThrowError();
    expect(logger).toHaveBeenCalledOnce();
  });

  it('passes correct rangeStart and rangeEnd when SHEET_RANGE_START and SHEET_RANGE_END are set', async () => {
    vi.stubEnv('SPREADSHEET_ID', 'test-id');
    vi.stubEnv('SHEET_RANGE_START', '10');
    vi.stubEnv('SHEET_RANGE_END', '20');

    await import('@root/scripts/writeToD1FromGoogleSheets.mts');

    expect(GoogleSheetsService).toHaveBeenCalledTimes(1);
    const serviceArgs = vi.mocked(GoogleSheetsService).mock.calls[0][0];
    expect(serviceArgs).toHaveProperty('rangeStart', 10);
    expect(serviceArgs).toHaveProperty('rangeEnd', 20);
  });

  it('passes correct rangeStart when only SHEET_RANGE_START is set', async () => {
    vi.stubEnv('SPREADSHEET_ID', 'test-id');
    vi.stubEnv('SHEET_RANGE_START', '15');

    await import('@root/scripts/writeToD1FromGoogleSheets.mts');

    expect(GoogleSheetsService).toHaveBeenCalledTimes(1);
    const serviceArgs = vi.mocked(GoogleSheetsService).mock.calls[0][0];
    expect(serviceArgs).toHaveProperty('rangeStart', 15);
    expect(serviceArgs.rangeEnd).toBeUndefined();
  });

  it('passes undefined range properties when no range env vars are set', async () => {
    vi.stubEnv('SPREADSHEET_ID', 'test-id');

    await import('@root/scripts/writeToD1FromGoogleSheets.mts');

    expect(GoogleSheetsService).toHaveBeenCalledTimes(1);
    const serviceArgs = vi.mocked(GoogleSheetsService).mock.calls[0][0];
    expect(serviceArgs.rangeStart).toBeUndefined();
    expect(serviceArgs.rangeEnd).toBeUndefined();
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
        /^npx[\s]+wrangler[\s]+d1[\s]+execute[\s]+DB[\s]+--command="[\s]*INSERT[\s]+INTO[\s]+plans.*ON[\s]+CONFLICT[\s]+\(date\)[\s]+DO[\s]+UPDATE[\s]+SET[\s]+praise_scope[\s]*=[\s]*excluded.praise_scope,[\s]*praise_content[\s]*=[\s]*excluded.praise_content,[\s]*devotional_scope[\s]*=[\s]*excluded.devotional_scope,[\s]*devotional_content[\s]*=[\s]*excluded.devotional_content;/is,
      ),
      { stdio: 'inherit' },
    );
  });

  it('writes row data to D1 remote database', async () => {
    await writeToD1FromGoogleSheets(new MockGoogleService(), { isRemote: true });

    expect(execSync).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /^npx[\s]+wrangler[\s]+d1[\s]+execute[\s]+DB[\s]+--remote[\s]+--command="[\s]*INSERT[\s]+INTO[\s]+plans.*ON[\s]+CONFLICT[\s]+\(date\)[\s]+DO[\s]+UPDATE[\s]+SET[\s]+praise_scope[\s]*=[\s]*excluded.praise_scope,[\s]*praise_content[\s]*=[\s]*excluded.praise_content,[\s]*devotional_scope[\s]*=[\s]*excluded.devotional_scope,[\s]*devotional_content[\s]*=[\s]*excluded.devotional_content;/is,
      ),
      { stdio: 'inherit' },
    );
  });
});

const stubData = [
  // BRP data column heads with random columns
  [
    'date',
    'some-random-column',
    'praise_scope',
    'praise_content',
    'devotional_scope',
    'devotional_content',
  ],
  [
    '2025-02-01',
    'some-random-column-cell',
    '詩篇 100:4-5 CCB',
    '要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；\n要感謝祂，稱頌祂的名。因為耶和華是美善的，\n祂的慈愛永遠長存，祂的信實千古不變。',
    '出埃及記 第 36 章',
  ],
  [
    '2025-02-02',
    'some-random-column-cell',
    // Cell with excess line-breaks or spaces at both ends
    '\n詩篇 145:1-3 CCB ',
    // Cell with excess line-breaks or spaces at both ends and a space after non-Chinese punctuation marks.
    '\n 我的上帝,我的王啊!我要尊崇你,我要永永遠遠稱頌你的名. \n我要天天稱頌你,永永遠遠讚美你的名。\n耶和華是偉大的,當受至高的頌讚,祂的偉大無法測度。\n',
    '出埃及記 第 37 章',
  ],

  // Row with devotional_content value
  [
    '2025-04-14',
    'some-random-column-cell',
    '歷代志下 5:13 CCB',
    '吹號的和歌樂手一起同聲讚美和稱謝耶和華，伴隨著號、鈸及各種樂器的聲音，\n高聲讚美耶和華：「祂是美善的， 祂的慈愛永遠長存！」\n那時，有雲彩充滿了耶和華的殿。',
    '馬可福音 11:12-19',
    // Cell with excess line-breaks or spaces at both ends and a space after non-Chinese punctuation marks.
    '\n耶穌如何面對不結果子的無花果樹呢? 這對於你的生命有哪些提醒呢?',
  ],
];

const expectedQueryValues = `('2025-02-01', '詩篇 100:4-5 CCB', '要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；\n要感謝祂，稱頌祂的名。因為耶和華是美善的，\n祂的慈愛永遠長存，祂的信實千古不變。', '出埃及記 第 36 章', NULL),\n('2025-02-02', '詩篇 145:1-3 CCB', '我的上帝，我的王啊！我要尊崇你，我要永永遠遠稱頌你的名。\n我要天天稱頌你，永永遠遠讚美你的名。\n耶和華是偉大的，當受至高的頌讚，祂的偉大無法測度。', '出埃及記 第 37 章', NULL),\n('2025-04-14', '歷代志下 5:13 CCB', '吹號的和歌樂手一起同聲讚美和稱謝耶和華，伴隨著號、鈸及各種樂器的聲音，\n高聲讚美耶和華：「祂是美善的， 祂的慈愛永遠長存！」\n那時，有雲彩充滿了耶和華的殿。', '馬可福音 11:12-19', '耶穌如何面對不結果子的無花果樹呢？這對於你的生命有哪些提醒呢？')`;

class MockGoogleService implements Service<string[][]> {
  execute(): Promise<string[][]> {
    return Promise.resolve(stubData);
  }
}
