import { GoogleApis } from 'googleapis';
import { AuthClient, GoogleAuth, JWT } from 'google-auth-library';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GoogleSheetsService } from '@root/scripts/lib.mts';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new GoogleSheetsService({
      google: mockGoogle,
      sheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      sheetName: 'data-brp',
      keyFilePath: './scripts/service-account.json',
    });
  });

  it('passes the correct keyFilePath to GoogleAuth', async () => {
    await service.execute();
    expect(mockGoogle.auth.GoogleAuth).toHaveBeenCalledWith({
      keyFile: './scripts/service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  });

  it('authenticates with GoogleAuth.getClient()', async () => {
    await service.execute();
    expect(mockGoogle.auth.GoogleAuth).toHaveBeenCalledOnce();
    expect(
      vi.mocked(mockGoogle.auth.GoogleAuth).mock.results[0].value.getClient,
    ).toHaveBeenCalledOnce();
  });

  it('calls Google Sheets API with correct parameters', async () => {
    await service.execute();
    expect(mockGet).toHaveBeenNthCalledWith(1, {
      spreadsheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      range: 'data-brp!A1:Z',
    });
  });

  it('returns data successfully', async () => {
    const result = await service.execute();
    expect(result).toEqual(stubSheetData);
  });

  it('throws an error when no data or only sheet header is returned', async () => {
    const noData: string[][] = [];
    const headersOnly = [stubSheetData[0]];

    [noData, headersOnly].forEach(async (values) => {
      mockGet.mockResolvedValueOnce({
        data: { values },
      });

      await expect(service.execute()).rejects.toThrow(
        'No data found or only headers present in data.',
      );
    });
  });

  it('throws an error when authentication fails', async () => {
    vi.mocked(mockGoogle.auth.GoogleAuth).mockImplementationOnce(
      () =>
        ({
          getClient: vi.fn().mockRejectedValue(new Error('Authentication Failed')),
        }) as unknown as GoogleAuth<AuthClient>,
    );

    await expect(service.execute()).rejects.toThrow('Authentication Failed');
  });
});

const stubSheetData = [
  ['date', 'praise_scope', 'praise_content', 'devotional_scope', 'devotional_content'],
  // missing devotional_content value to simulate actual response
  ['2025-02-01', '詩篇 23 章', 'The Lord is my shepherd.', '創世紀 1 章'],
];

const mockGet = vi.fn().mockResolvedValue({
  data: {
    values: stubSheetData,
  },
});

const mockGoogle = {
  auth: {
    GoogleAuth: vi.fn().mockImplementation(() => ({
      getClient: vi.fn().mockResolvedValue(new JWT()),
    })),
  },
  sheets: vi.fn().mockImplementation(() => ({
    spreadsheets: {
      values: {
        get: mockGet,
      },
    },
  })),
} as unknown as GoogleApis;
