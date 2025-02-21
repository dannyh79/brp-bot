import { execSync } from 'node:child_process';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const helpMsg = `
Usage:
SPREADSHEET_ID={{ GoogleSheets spreadsheet ID }} SHEET_NAME={{ GoogleSheets sheet name }} KEY_FILE_PATH={{ /path/to/your/gcp-service-account.json }} pnpm db:write

Description: The command fetches BRP data from Google Sheets spreadsheet, then upserts the data into local D1 database. Use optional env "REMOTE=true" to write data to remote D1 database.

- SPREADSHEET_ID: Spreadsheet unique ID; No default value
-     SHEET_NAME: Spreadsheet sheet name; Defaults to "data-brp"
-  KEY_FILE_PATH: GCP service account private key file; Defaults to "./scripts/service-account.json"
-         REMOTE: Whether to write Data to remote D1 database; Defaults to false

See below for more info:
- https://developers.google.com/sheets/api/guides/concepts (for SPREADSHEET_ID)
- https://cloud.google.com/iam/docs/service-account-overview (for KEY_FILE_PATH's key file)
`;

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'data-brp';
const KEY_FILE_PATH = process.env.KEY_FILE_PATH || './scripts/service-account.json';
const REMOTE = process.env.REMOTE === 'true';

const authenticate = (): Promise<JWT> => {
  return new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  }).getClient() as Promise<JWT>;
};

type PlanDataRow = {
  date: string;
  praise_scope: string;
  praise_content: string;
  devotional_scope: string;
};

const fetchSheetData = async (): Promise<string[][]> => {
  const auth = await authenticate();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z`,
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

const writeToD1 = (rows: PlanDataRow[]) => {
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

  const writeToRemote = REMOTE;
  const command = [
    'npx wrangler d1 execute DB',
    writeToRemote ? '--remote' : '',
    `--command="${query}"`,
  ].join(' ');
  execSync(command, { stdio: 'inherit' });
};

export const writeToD1FromGoogleSheets = async (): Promise<void> => {
  if (!SPREADSHEET_ID) {
    console.warn(helpMsg);
    return;
  }

  await fetchSheetData().then(formatRows).then(writeToD1);
};
