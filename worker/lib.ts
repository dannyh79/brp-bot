/** The en-CA (Canadian English) locale outputs dates in YYYY-MM-DD format by default. */
const locale = 'en-CA' as const;
const timeZone = 'Asia/Taipei' as const;

/**
 * Formats date object to string in YYYY-MM-DD format.
 *
 * @remarks
 * Output date string is converted to date in UTC+8 (Asia/Taipei).
 */
export const toDateString = (date: Date): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone,
  }).format(date);
