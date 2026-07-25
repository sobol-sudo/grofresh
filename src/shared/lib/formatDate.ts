/**
 * Formats a date into a human-readable string.
 * @param date - The date to format (defaults to the current date)
 * @param locale - The locale to format with (defaults to "en-US")
 * @returns The formatted date string
 */
export function formatDate(
  date: Date = new Date(),
  locale: string = "en-US"
): string {
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}