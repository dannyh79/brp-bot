import { exit } from 'node:process';
import { Config, writeToD1FromGoogleSheets } from './lib.mts';

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

const sheetId: string | undefined = process.env.SPREADSHEET_ID;
const sheetName = process.env.SHEET_NAME || 'data-brp';
const keyFilePath = process.env.KEY_FILE_PATH || './scripts/service-account.json';
const isRemote = process.env.REMOTE === 'true';

if (!sheetId) {
  console.warn(helpMsg);
  exit(1);
}

const config: Config = { sheetId, sheetName, keyFilePath, isRemote };
writeToD1FromGoogleSheets(config);
