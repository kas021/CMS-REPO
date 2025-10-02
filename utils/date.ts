
export function safeDateFormat(value?: string | Date | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—"; // Return a fallback for null or undefined

  const date = new Date(value);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "—"; // Return a fallback for invalid dates
  }

  // Use toLocaleDateString for locale-aware formatting
  return date.toLocaleDateString(undefined, options);
}

/**
 * Safely parses a date string or object and returns a valid Date object or null.
 * This prevents the creation of invalid Date objects which can cause a RangeError.
 * @param value The date string, Date object, or null/undefined.
 * @returns A valid Date object if parsing is successful, otherwise null.
 */
export function safeParseDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date;
}

/**
 * Parses a payment term string (e.g., "After 30 Days", "On Receipt") and returns the number of days.
 * This is a robust function designed to prevent crashes from malformed data.
 * @param term The payment term string.
 * @returns The number of days as an integer. Returns a default of 30 if the term is unparsable.
 */
export function parsePaymentTermDays(term?: string | null): number {
    if (!term) return 30; // Default to 30 days if term is missing
    
    const lowerCaseTerm = term.toLowerCase();
    if (lowerCaseTerm.includes('on receipt')) return 0;
    
    const match = lowerCaseTerm.match(/\d+/); // Find the first sequence of digits
    if (match && match[0]) {
        const days = parseInt(match[0], 10);
        return isNaN(days) ? 30 : days; // Check if parsing was successful
    }
    
    return 30; // Default if no number is found
}
