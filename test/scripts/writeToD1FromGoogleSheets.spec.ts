import { google } from 'googleapis';
import {
  GoogleSheetsService,
  writeSubsectionBlocksToD1,
  writeToD1FromGoogleSheets,
} from '@root/scripts/lib.mts';
import type { Service } from '@root/scripts/lib.mts';
import type * as scriptsLib from '@root/scripts/lib.mts';

vi.mock('@root/scripts/lib.mts', async (importOriginal) => {
  const actual = await importOriginal<typeof scriptsLib>();
  return {
    ...actual,
    GoogleSheetsService: vi.fn(),
    writeToD1FromGoogleSheets: vi.fn(actual.writeToD1FromGoogleSheets),
    writeSubsectionBlocksToD1: vi.fn(actual.writeSubsectionBlocksToD1),
  };
});

const execSync = vi.fn();

describe('script writeToD1FromGoogleSheets', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SPREADSHEET_ID', undefined);
    vi.stubEnv('DATE_START', undefined);
    vi.stubEnv('DATE_END', undefined);
    process.exitCode = undefined;
    vi.mocked(GoogleSheetsService).mockClear();
    vi.mocked(writeToD1FromGoogleSheets).mockClear();
    vi.mocked(writeSubsectionBlocksToD1).mockClear();
  });

  it('prints help and exits nonzero when SPREADSHEET_ID is missing', async () => {
    const logger = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // The module reads environment variables at import time.
    await import('@root/scripts/writeToD1FromGoogleSheets.mts');
    expect(logger).toHaveBeenCalledOnce();
    expect(process.exitCode).toBe(1);
  });

  it('passes an inclusive date range to plan and subsection syncs', async () => {
    vi.stubEnv('SPREADSHEET_ID', 'test-id');
    vi.stubEnv('DATE_START', '2026-11-01');
    vi.stubEnv('DATE_END', '2026-11-30');
    vi.mocked(writeToD1FromGoogleSheets).mockImplementationOnce(async () => {});
    vi.mocked(writeSubsectionBlocksToD1).mockImplementationOnce(async () => {});

    await import('@root/scripts/writeToD1FromGoogleSheets.mts');

    expect(GoogleSheetsService).toHaveBeenCalledWith({
      google,
      sheetId: 'test-id',
      sheetName: 'data-brp',
      keyFilePath: './scripts/service-account.json',
    });
    expect(GoogleSheetsService).toHaveBeenCalledWith({
      google,
      sheetId: 'test-id',
      sheetName: 'subsection_blocks',
      keyFilePath: './scripts/service-account.json',
    });
    expect(writeToD1FromGoogleSheets).toHaveBeenCalledWith(expect.anything(), {
      dateStart: '2026-11-01',
      dateEnd: '2026-11-30',
      isRemote: false,
    });
    expect(writeSubsectionBlocksToD1).toHaveBeenCalledWith(expect.anything(), {
      dateStart: '2026-11-01',
      dateEnd: '2026-11-30',
      isRemote: false,
    });
  });
});

describe('D1 writers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passes the plan SQL as an argument instead of a shell command', async () => {
    await writeToD1FromGoogleSheets(new DateRangeGoogleService(), { executeCommand: execSync });

    expect(execSync).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['wrangler', 'd1', 'execute', 'DB', '--command']),
      { stdio: 'inherit' },
    );
    expect(execSync.mock.calls[0][1].at(-1)).toContain("('2026-11-01', '詩篇 118：28'");
  });

  it('writes only plan rows within the inclusive date range', async () => {
    await writeToD1FromGoogleSheets(new DateRangeGoogleService(), {
      dateStart: '2026-11-01',
      dateEnd: '2026-11-01',
      executeCommand: execSync,
    });

    expect(execSync.mock.calls[0][1].at(-1)).toContain('2026-11-01');
    expect(execSync.mock.calls[0][1].at(-1)).not.toContain('2026-11-02');
  });

  it('writes only subsection blocks within the inclusive date range', async () => {
    await writeSubsectionBlocksToD1(new SubsectionBlockGoogleService(), {
      dateStart: '2026-11-01',
      dateEnd: '2026-11-01',
      executeCommand: execSync,
    });

    expect(execSync.mock.calls[0][1].at(-1)).toContain(
      "('2026-11-01', 'prayer', 'after_content', '為教會禱告', NULL, NULL, '為 FORWARD 奉獻預備自己的心。', 1)",
    );
    expect(execSync.mock.calls[0][1].at(-1)).not.toContain('2026-11-02');
  });

  it('deletes a selected range even when it has no subsection blocks', async () => {
    await writeSubsectionBlocksToD1(new SubsectionBlockGoogleService(), {
      dateStart: '2026-12-01',
      dateEnd: '2026-12-01',
      executeCommand: execSync,
    });

    expect(execSync.mock.calls[0][1].at(-1)).toBe(
      "DELETE FROM subsection_blocks WHERE date >= '2026-12-01' AND date <= '2026-12-01';",
    );
  });
});

class SubsectionBlockGoogleService implements Service<string[][]> {
  execute(): Promise<string[][]> {
    return Promise.resolve([
      [
        'date',
        'section',
        'position',
        'title',
        'scripture_content',
        'scripture_scope',
        'content',
        'sort_order',
      ],
      [
        '2026-11-01',
        'prayer',
        'after_content',
        '為教會禱告',
        '',
        '',
        '為 FORWARD 奉獻預備自己的心。',
        '1',
      ],
      ['2026-11-02', 'devotional', 'before_content', '', '', '', '隔日引導。', '1'],
    ]);
  }
}

class DateRangeGoogleService implements Service<string[][]> {
  execute(): Promise<string[][]> {
    return Promise.resolve([
      ['date', 'praise_scope', 'praise_content', 'devotional_scope', 'devotional_content'],
      ['2026-11-01', '詩篇 118:28', '你是我的上帝，我要稱謝你。', '瑪拉基書 第 4 章', ''],
      ['2026-11-02', '馬拉基書 3:6', '耶和華說我是不改變的。', '歷代志上 第 29 章', ''],
    ]);
  }
}
