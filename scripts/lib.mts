import { execSync } from 'node:child_process';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const authenticate = (keyFile: string): Promise<JWT> => {
  return new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  }).getClient() as Promise<JWT>;
};

type PlanDataRow = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
};

const fetchSheetData = async (config: Config): Promise<string[][]> => {
  const auth = await authenticate(config.keyFilePath);
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${config.sheetName}!A1:Z`,
  });

  const rows: string[][] | null | undefined = response.data.values;
  if (!rows || rows.length < 2) {
    throw new Error('No data found or only headers present in data.');
  }

  return rows;
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

export type Config = {
  sheetId: string;
  sheetName: string;
  keyFilePath: string;
  isRemote: boolean;
};

export const writeToD1FromGoogleSheets = async (config: Config): Promise<void> => {
  await fetchSheetData(config).then(formatRows).then(writeToD1(config.isRemote));
};
