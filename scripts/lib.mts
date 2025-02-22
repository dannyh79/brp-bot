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
};

export class GoogleSheetsService implements Service<string[][]> {
  #sheetId: string;
  #sheetName: string;
  #keyFilePath: string;
  #google: GoogleApis;
  #jwt!: JWT;

  constructor(args: ServiceArgs) {
    this.#google = args.google;
    this.#sheetId = args.sheetId;
    this.#sheetName = args.sheetName;
    this.#keyFilePath = args.keyFilePath;
  }

  async execute(): Promise<string[][]> {
    await this.#authenticate();

    const response = await this.#google
      .sheets({ version: 'v4', auth: this.#jwt })
      .spreadsheets.values.get({
        spreadsheetId: this.#sheetId,
        range: `${this.#sheetName}!A1:Z`,
      });

    const rows: string[][] | null | undefined = response.data.values;
    if (!rows || rows.length < 2) {
      throw new Error('No data found or only headers present in data.');
    }

    return rows;
  }

  async #authenticate(): Promise<void> {
    this.#jwt = await (new this.#google.auth.GoogleAuth({
      keyFile: this.#keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    }).getClient() as Promise<JWT>);
  }
}

type PlanDataRow = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
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

const formatRows = (rows: string[][]): PlanDataRow[] => {
  const headers = rows[0];
  const dataRows = rows.slice(1);
  return dataRows.map((row: string[]) =>
    row.reduce((object, cell, index) => {
      // FIXME: Remove type assertion
      const field = headers[index] as keyof PlanDataRow;
      object[field] = toTrimmed(field === 'praise_content' ? toChinesePunctuation(cell) : cell);
      return object;
    }, {} as PlanDataRow),
  );
};

const writeToD1 = (isRemote: boolean) => (rows: PlanDataRow[]) => {
  const query = `
  INSERT INTO plans (date, praise_scope, praise_content, devotional_scope) VALUES
    ${rows
      .map(
        (r) => `('${r.date}', '${r.praise_scope}', '${r.praise_content}', '${r.devotional_scope}')`,
      )
      .join(',\n')}
    ON CONFLICT (date) DO UPDATE SET
      praise_scope = excluded.praise_scope,
      praise_content = excluded.praise_content,
      devotional_scope = excluded.devotional_scope;
  `;

  const command = [
    'npx wrangler d1 execute DB',
    isRemote ? '--remote' : '',
    `--command="${query}"`,
  ].join(' ');
  execSync(command, { stdio: 'inherit' });
};

export type WriteToD1FromGoogleSheetsOptions = {
  isRemote: boolean;
};

export const writeToD1FromGoogleSheets = async (
  service: Service<string[][]>,
  { isRemote }: WriteToD1FromGoogleSheetsOptions,
): Promise<void> => {
  const rows = await service.execute();
  writeToD1(isRemote)(formatRows(rows));
};
