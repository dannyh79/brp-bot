import { google } from 'googleapis';
import {
  GoogleSheetsService,
  type ServiceArgs,
  writeSubsectionBlocksToD1,
  writeToD1FromGoogleSheets,
} from './lib.mts';

const helpMsg = `
Usage:
SPREADSHEET_ID={{ Google Sheets spreadsheet ID }} SHEET_NAME={{ base plan sheet name }} DATE_START=YYYY-MM-DD DATE_END=YYYY-MM-DD pnpm db:write

Description: Fetches base plans and subsection blocks from Google Sheets, then upserts the selected inclusive date range into local D1. Use optional env "REMOTE=true" to write to remote D1.

-       SPREADSHEET_ID: Google Sheets spreadsheet ID; no default value
-           SHEET_NAME: Base plan tab; defaults to "data-brp"
- SUBSECTION_SHEET_NAME: Subsection block tab; defaults to "subsection_blocks"
-           DATE_START: Inclusive start date in YYYY-MM-DD; defaults to the earliest source date
-             DATE_END: Inclusive end date in YYYY-MM-DD; defaults to the latest source date
-        KEY_FILE_PATH: GCP service account private key file; defaults to "./scripts/service-account.json"
-               REMOTE: Whether to write to remote D1; defaults to false

See below for more info:
- https://developers.google.com/sheets/api/guides/concepts (for SPREADSHEET_ID)
- https://cloud.google.com/iam/docs/service-account-overview (for KEY_FILE_PATH's key file)
`;

const sheetId: string | undefined = process.env.SPREADSHEET_ID;
const sheetName = process.env.SHEET_NAME || 'data-brp';
const keyFilePath = process.env.KEY_FILE_PATH || './scripts/service-account.json';
const isRemote = process.env.REMOTE === 'true';

const dateStart = process.env.DATE_START;
const dateEnd = process.env.DATE_END;
const subsectionSheetName = process.env.SUBSECTION_SHEET_NAME || 'subsection_blocks';

const isMissingSubsectionSheetError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 400 &&
  'message' in error &&
  error.message === `Unable to parse range: ${subsectionSheetName}!A1:Z`;

if (!sheetId) {
  console.warn(helpMsg);
  process.exitCode = 1;
} else {
  const planServiceArgs: ServiceArgs = {
    google,
    sheetId,
    sheetName,
    keyFilePath,
  };
  const subsectionServiceArgs: ServiceArgs = {
    google,
    sheetId,
    sheetName: subsectionSheetName,
    keyFilePath,
  };
  const options = { dateStart, dateEnd, isRemote };
  await writeToD1FromGoogleSheets(new GoogleSheetsService(planServiceArgs), options);
  try {
    await writeSubsectionBlocksToD1(new GoogleSheetsService(subsectionServiceArgs), options);
  } catch (error) {
    if (!isMissingSubsectionSheetError(error)) throw error;
    console.warn(
      `Subsection blocks sheet "${subsectionSheetName}" was not found; skipped subsection block sync.`,
    );
  }
}
