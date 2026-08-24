import { execFileSync } from 'node:child_process';
import { GoogleApis } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface Service<T> {
  execute(): Promise<T>;
}

export type ServiceArgs = {
  google: GoogleApis;
  sheetId: string;
  sheetName: string;
  keyFilePath: string;
  rangeStart?: number;
  rangeEnd?: number;
};

export class GoogleSheetsService implements Service<string[][]> {
  #sheetId: string;
  #sheetName: string;
  #keyFilePath: string;
  #google: GoogleApis;
  #jwt!: JWT;
  #rangeStart?: number;
  #rangeEnd?: number;

  constructor(args: ServiceArgs) {
    this.#google = args.google;
    this.#sheetId = args.sheetId;
    this.#sheetName = args.sheetName;
    this.#keyFilePath = args.keyFilePath;
    this.#rangeStart = args.rangeStart;
    this.#rangeEnd = args.rangeEnd;
  }

  async execute(): Promise<string[][]> {
    await this.#authenticate();
    const sheets = this.#google.sheets({ version: 'v4', auth: this.#jwt });

    if (!this.#rangeStart) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.#sheetId,
        range: `${this.#sheetName}!A1:Z`,
      });
      const rows: string[][] | null | undefined = response.data.values;
      if (!rows) {
        return [];
      }
      return rows;
    }

    // Fetch header row (A1:Z1)
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: this.#sheetId,
      range: `${this.#sheetName}!A1:Z1`,
    });
    const headerRow = headerResponse.data.values?.[0];
    if (!headerRow) {
      throw new Error('Header row (A1:Z1) not found.');
    }

    // Fetch data rows
    const dataRange = `A${this.#rangeStart}:Z${this.#rangeEnd ?? ''}`;
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: this.#sheetId,
      range: `${this.#sheetName}!${dataRange}`,
    });
    const dataRows = dataResponse.data.values;
    if (!dataRows || dataRows.length === 0) {
      return [headerRow];
    }

    return [headerRow, ...dataRows];
  }

  async #authenticate(): Promise<void> {
    this.#jwt = await (new this.#google.auth.GoogleAuth({
      keyFile: this.#keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    }).getClient() as Promise<JWT>);
  }
}

export type CommandExecutor = (
  file: string,
  args: string[],
  options: { stdio: 'inherit' },
) => unknown;

export type WriteToD1FromGoogleSheetsOptions = {
  dateStart?: string;
  dateEnd?: string;
  isRemote?: boolean;
  executeCommand?: CommandExecutor;
};

const filterRowsByDate = <T extends { date: string }>(
  rows: T[],
  { dateStart, dateEnd }: WriteToD1FromGoogleSheetsOptions,
) => {
  if (dateStart && dateEnd && dateStart > dateEnd) {
    throw new Error('DATE_START must be on or before DATE_END.');
  }

  return rows.filter(
    (row) => (!dateStart || row.date >= dateStart) && (!dateEnd || row.date <= dateEnd),
  );
};

export const writeToD1FromGoogleSheets = async (
  service: Service<string[][]>,
  options: WriteToD1FromGoogleSheetsOptions = {},
): Promise<void> => {
  const source = await service.execute();
  if (source.length < 2) {
    console.log('No plan rows found to write to D1.');
    return;
  }

  const rows = filterRowsByDate(formatRows(source), options);
  if (rows.length === 0) {
    console.log('No plan rows found to write to D1.');
    return;
  }
  writeToD1(!!options.isRemote, options.executeCommand ?? execFileSync)(rows);
};

type SubsectionBlockRow = {
  date: string;
  section: string;
  position: string;
  title: string | undefined;
  scripture_content: string | undefined;
  scripture_scope: string | undefined;
  content: string;
  sort_order: number;
};

const formatSubsectionBlocks = (rows: string[][]): SubsectionBlockRow[] => {
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).flatMap((row) => {
    const value = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']));
    if (!value.date || !value.section || !value.position || !value.content) return [];

    return [
      {
        date: value.date,
        section: value.section,
        position: value.position,
        title: value.title || undefined,
        scripture_content: value.scripture_content || undefined,
        scripture_scope: value.scripture_scope || undefined,
        content: value.content,
        sort_order: Number(value.sort_order || 1),
      },
    ];
  });
};

export const writeSubsectionBlocksToD1 = async (
  service: Service<string[][]>,
  options: WriteToD1FromGoogleSheetsOptions = {},
): Promise<void> => {
  const source = await service.execute();
  const rows = source.length < 2 ? [] : filterRowsByDate(formatSubsectionBlocks(source), options);
  if (rows.length === 0 && !options.dateStart && !options.dateEnd) {
    console.log('No subsection blocks found to write to D1.');
    return;
  }

  writeSubsectionBlocksToD1Query(!!options.isRemote, options.executeCommand ?? execFileSync)(
    rows,
    options,
  );
};

type PlanDataRow = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
};

const formatRows = (rows: string[][]): PlanDataRow[] => {
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).flatMap((row) => {
    const value = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']));
    if (!value.date || !value.praise_scope || !value.praise_content || !value.devotional_scope) {
      return [];
    }

    return [
      {
        date: value.date,
        praise_scope: toChinesePunctuation(toTrimmed(value.praise_scope)),
        praise_content: toChinesePunctuation(toTrimmed(value.praise_content)),
        devotional_scope: toTrimmed(value.devotional_scope),
      },
    ];
  });
};

const escapeSql = (str: string) => str.replace(/'/g, "''");

const toSqlValue = (value: string | undefined) =>
  value === undefined ? 'NULL' : `'${escapeSql(value)}'`;

const executeD1Query = (query: string, isRemote: boolean, executeCommand: CommandExecutor) => {
  executeCommand(
    'npx',
    ['wrangler', 'd1', 'execute', 'DB', ...(isRemote ? ['--remote'] : []), '--command', query],
    { stdio: 'inherit' },
  );
};

const writeToD1 = (isRemote: boolean, executeCommand: CommandExecutor) => (rows: PlanDataRow[]) => {
  const query = `
  INSERT INTO plans (date, praise_scope, praise_content, devotional_scope) VALUES
    ${rows
      .map(
        (r) =>
          `('${escapeSql(r.date)}', '${escapeSql(r.praise_scope)}', '${escapeSql(r.praise_content)}', '${escapeSql(r.devotional_scope)}')`,
      )
      .join(',\n')}
    ON CONFLICT (date) DO UPDATE SET
      praise_scope = excluded.praise_scope,
      praise_content = excluded.praise_content,
      devotional_scope = excluded.devotional_scope;
  `;

  executeD1Query(query, isRemote, executeCommand);
};

const writeSubsectionBlocksToD1Query =
  (isRemote: boolean, executeCommand: CommandExecutor) =>
  (rows: SubsectionBlockRow[], { dateStart, dateEnd }: WriteToD1FromGoogleSheetsOptions) => {
    const selectedDates = [...new Set(rows.map((row) => row.date))];
    const deleteWhere =
      dateStart || dateEnd
        ? [
            dateStart ? `date >= '${escapeSql(dateStart)}'` : '',
            dateEnd ? `date <= '${escapeSql(dateEnd)}'` : '',
          ]
            .filter(Boolean)
            .join(' AND ')
        : `date IN (${selectedDates.map((date) => `'${escapeSql(date)}'`).join(', ')})`;
    const insert = rows.length
      ? `
    INSERT INTO subsection_blocks (date, section, position, title, scripture_content, scripture_scope, content, sort_order) VALUES
      ${rows
        .map(
          (row) =>
            `('${escapeSql(row.date)}', '${escapeSql(row.section)}', '${escapeSql(row.position)}', ${toSqlValue(row.title)}, ${toSqlValue(row.scripture_content)}, ${toSqlValue(row.scripture_scope)}, '${escapeSql(row.content)}', ${row.sort_order})`,
        )
        .join(',\n')}
    ON CONFLICT (date, section, position, sort_order) DO UPDATE SET
      title = excluded.title,
      scripture_content = excluded.scripture_content,
      scripture_scope = excluded.scripture_scope,
      content = excluded.content;`
      : '';
    executeD1Query(
      `DELETE FROM subsection_blocks WHERE ${deleteWhere};${insert}`,
      isRemote,
      executeCommand,
    );
  };

const toChinesePunctuation = (input: string): string => {
  const halfToFullMap: { [key: string]: string } = {
    ',': '，',
    '.': '。',
    ':': '：',
    ';': '；',
    '!': '！',
    '?': '？',
    '(': '（',
    ')': '）',
    '[': '【',
    ']': '】',
    '{': '｛',
    '}': '｝',
    '"': '“',
    "'": '‘',
    '<': '《',
    '>': '》',
    '-': '－',
    '_': '＿',
    '~': '～',
  };

  return input.replace(
    /[,.:;!?()[\]{}"'<>-_~]\s?/g,
    (match) => halfToFullMap[match.trimEnd()] || match,
  );
};

const toTrimmed = (input: string): string => input.trim();
