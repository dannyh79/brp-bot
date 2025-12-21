import { GoogleApis } from 'googleapis';
import { AuthClient, GoogleAuth, JWT } from 'google-auth-library';
import { GoogleSheetsService } from '@root/scripts/lib.mts';

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

const newGoogleSheetService = () =>
  new GoogleSheetsService({
    google: mockGoogle,
    sheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
    sheetName: 'data-brp',
    keyFilePath: './scripts/service-account.json',
  });

describe('GoogleSheetsService', () => {
  beforeEach(vi.clearAllMocks);

  it('passes the correct keyFilePath to GoogleAuth', async () => {
    const service = newGoogleSheetService();
    await service.execute();
    expect(mockGoogle.auth.GoogleAuth).toHaveBeenCalledWith({
      keyFile: './scripts/service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  });

  it('authenticates with GoogleAuth.getClient()', async () => {
    const service = newGoogleSheetService();
    await service.execute();
    expect(mockGoogle.auth.GoogleAuth).toHaveBeenCalledOnce();
    expect(
      vi.mocked(mockGoogle.auth.GoogleAuth).mock.results[0].value.getClient,
    ).toHaveBeenCalledOnce();
  });

  it('calls Google Sheets API with default range when no range is provided', async () => {
    const service = newGoogleSheetService();
    mockGet.mockResolvedValueOnce({ data: { values: stubSheetData } });
    await service.execute();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      range: 'data-brp!A1:Z',
    });
  });

  it('calls Google Sheets API with header and data ranges when range is provided', async () => {
    const service = new GoogleSheetsService({
      google: mockGoogle,
      sheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      sheetName: 'data-brp',
      keyFilePath: './scripts/service-account.json',
      rangeStart: 5,
      rangeEnd: 10,
    });

    mockGet.mockResolvedValueOnce({ data: { values: [stubSheetData[0]] } }); // Header
    mockGet.mockResolvedValueOnce({ data: { values: [stubSheetData[1]] } }); // Data

    await service.execute();

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      range: 'data-brp!A1:Z1',
    });
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      range: 'data-brp!A5:Z10',
    });
  });

  it('returns data successfully', async () => {
    const service = newGoogleSheetService();
    mockGet.mockResolvedValueOnce({ data: { values: stubSheetData } });
    const result = await service.execute();
    expect(result).toEqual(stubSheetData);
  });

  it('returns combined data successfully when range is provided', async () => {
    const service = new GoogleSheetsService({
      google: mockGoogle,
      sheetId: '123456789pZYSNDDii7UyDu1BNQqVENxS8xRRRRRRRRR',
      sheetName: 'data-brp',
      keyFilePath: './scripts/service-account.json',
      rangeStart: 2,
      rangeEnd: 2,
    });
    mockGet.mockResolvedValueOnce({ data: { values: [stubSheetData[0]] } }); // Header
    mockGet.mockResolvedValueOnce({ data: { values: [stubSheetData[1]] } }); // Data

    const result = await service.execute();
    expect(result).toEqual(stubSheetData);
  });

  it('throws an error, when authentication fails', async () => {
    vi.mocked(mockGoogle.auth.GoogleAuth).mockImplementationOnce(
      () =>
        ({
          getClient: vi.fn().mockRejectedValue(new Error('Authentication Failed')),
        }) as unknown as GoogleAuth<AuthClient>,
    );

    const service = newGoogleSheetService();
    await expect(() => service.execute()).rejects.toThrow('Authentication Failed');
  });
});
