import { toDateString } from '@worker/lib';

describe('toDateString', () => {
  it('formats Date object to string in YYYY-MM-DD format, in UTC+8', () => {
    const date = new Date('Thu, 03 Apr 2025 16:00:00 GMT');
    const result = toDateString(date);
    expect(result).toBe('2025-04-04');
  });
});
