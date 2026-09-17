/** Parses a user-typed decimal, tolerating a comma decimal separator
 * (common on non-US keyboards, where the decimal key inserts "," not "."). */
export function parseDecimal(input: string): number {
  return parseFloat(input.trim().replace(',', '.'))
}
