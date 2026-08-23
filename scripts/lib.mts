import { execSync } from 'node:child_process';
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

export type CommandExecutor = (command: string, options: { stdio: 'inherit' }) => unknown;

export type WriteToD1FromGoogleSheetsOptions = {
  isRemote?: boolean;
  executeCommand?: CommandExecutor;
};

export const writeToD1FromGoogleSheets = async (
  service: Service<string[][]>,
  { isRemote, executeCommand = execSync }: WriteToD1FromGoogleSheetsOptions = {
    isRemote: false,
  },
): Promise<void> => {
  const rows = await service.execute();
  if (rows.length < 2) {
    console.log('No data rows found to write to D1.');
    return;
  }
  writeToD1(!!isRemote, executeCommand)(formatRows(rows));
};

type PlanDataRow = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
  devotional_intro: string | undefined;
  church_prayer_guide: string | undefined;
};

type DataRow = Partial<PlanDataRow> & Record<string, string | undefined>;

const novemberStart = '2026-11-01';
const sourceFieldMap: Record<string, keyof PlanDataRow> = {
  'devotional_content': 'devotional_intro',
  'pray for church': 'church_prayer_guide',
};
const proseFields = new Set<keyof PlanDataRow>([
  'praise_content',
  'devotional_intro',
  'church_prayer_guide',
]);

const formatRows = (rows: string[][]): PlanDataRow[] => {
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const dataRows = rows.slice(1);
  return dataRows.map(
    (row: string[]) =>
      row.reduce((object, cell, index) => {
        const field = sourceFieldMap[headers[index]] ?? headers[index];
        if (
          ['devotional_intro', 'church_prayer_guide'].includes(field) &&
          object.date &&
          object.date < novemberStart
        ) {
          return object;
        }

        const formattedCell = toTrimmed(
          proseFields.has(field as keyof PlanDataRow)
            ? cell === undefined
              ? ''
              : toChinesePunctuation(cell)
            : (cell ?? ''),
        );
        object[field] =
          formattedCell === '' && ['devotional_intro', 'church_prayer_guide'].includes(field)
            ? undefined
            : formattedCell;
        return object;
      }, {} as DataRow) as PlanDataRow,
  );
};

const escapeSql = (str: string) => str.replace(/'/g, "''");

const toSqlValue = (value: string | undefined) =>
  value === undefined ? 'NULL' : `'${escapeSql(value)}'`;

const writeToD1 = (isRemote: boolean, executeCommand: CommandExecutor) => (rows: PlanDataRow[]) => {
  const query = `
  INSERT INTO plans (date, praise_scope, praise_content, devotional_scope, devotional_intro, church_prayer_guide) VALUES
    ${rows
      .map(
        (r) =>
          `('${escapeSql(r.date)}', '${escapeSql(r.praise_scope)}', '${escapeSql(r.praise_content)}', '${escapeSql(r.devotional_scope)}', ${toSqlValue(r.devotional_intro)}, ${toSqlValue(r.church_prayer_guide)})`,
      )
      .join(',\n')}
    ON CONFLICT (date) DO UPDATE SET
      praise_scope = excluded.praise_scope,
      praise_content = excluded.praise_content,
      devotional_scope = excluded.devotional_scope,
      devotional_intro = excluded.devotional_intro,
      church_prayer_guide = COALESCE(excluded.church_prayer_guide, plans.church_prayer_guide);
  `;

  const command = [
    'npx wrangler d1 execute DB',
    isRemote ? '--remote' : '',
    `--command="${query}"`,
  ].join(' ');
  executeCommand(command, { stdio: 'inherit' });
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
