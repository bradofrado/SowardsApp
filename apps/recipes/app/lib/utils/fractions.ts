/**
 * Convert decimal numbers to Unicode fractions in ingredient text
 * Examples:
 *   "1.5 cups" -> "1 ½ cups"
 *   "0.25 tsp" -> "¼ tsp"
 *   "2.333 cups" -> "2 ⅓ cups"
 */

// Map of decimal values to Unicode fraction characters
const FRACTION_MAP: Record<string, string> = {
  // Simple fractions
  "0.5": "½",
  "0.25": "¼",
  "0.75": "¾",
  "0.333": "⅓",
  "0.667": "⅔",
  "0.2": "⅕",
  "0.4": "⅖",
  "0.6": "⅗",
  "0.8": "⅘",
  "0.167": "⅙",
  "0.833": "⅚",
  "0.125": "⅛",
  "0.375": "⅜",
  "0.625": "⅝",
  "0.875": "⅞",
};

// Reverse map for easier lookup by precision
const DECIMAL_TO_FRACTION: Array<{
  decimal: number;
  fraction: string;
  tolerance: number;
}> = [
  // Eighths (most precise)
  { decimal: 0.875, fraction: "⅞", tolerance: 0.01 },
  { decimal: 0.75, fraction: "¾", tolerance: 0.01 },
  { decimal: 0.625, fraction: "⅝", tolerance: 0.01 },
  { decimal: 0.5, fraction: "½", tolerance: 0.01 },
  { decimal: 0.375, fraction: "⅜", tolerance: 0.01 },
  { decimal: 0.25, fraction: "¼", tolerance: 0.01 },
  { decimal: 0.125, fraction: "⅛", tolerance: 0.01 },

  // Thirds
  { decimal: 0.667, fraction: "⅔", tolerance: 0.02 },
  { decimal: 0.333, fraction: "⅓", tolerance: 0.02 },

  // Fifths
  { decimal: 0.8, fraction: "⅘", tolerance: 0.015 },
  { decimal: 0.6, fraction: "⅗", tolerance: 0.015 },
  { decimal: 0.4, fraction: "⅖", tolerance: 0.015 },
  { decimal: 0.2, fraction: "⅕", tolerance: 0.015 },

  // Sixths
  { decimal: 0.833, fraction: "⅚", tolerance: 0.02 },
  { decimal: 0.167, fraction: "⅙", tolerance: 0.02 },
];

/**
 * Find the closest fraction representation for a decimal value
 */
function findClosestFraction(decimal: number): string | null {
  for (const {
    decimal: targetDecimal,
    fraction,
    tolerance,
  } of DECIMAL_TO_FRACTION) {
    if (Math.abs(decimal - targetDecimal) <= tolerance) {
      return fraction;
    }
  }
  return null;
}

/**
 * Convert a decimal number to a mixed number with fraction
 * Examples:
 *   1.5 -> "1 ½"
 *   0.25 -> "¼"
 *   2.333 -> "2 ⅓"
 *   3.0 -> "3"
 */
export function decimalToFraction(num: number): string {
  // Handle whole numbers
  if (Number.isInteger(num)) {
    return num.toString();
  }

  const wholePart = Math.floor(num);
  const decimalPart = num - wholePart;

  // Find the closest fraction
  const fractionChar = findClosestFraction(decimalPart);

  if (fractionChar) {
    if (wholePart === 0) {
      return fractionChar;
    }
    return `${wholePart} ${fractionChar}`;
  }

  // If no close fraction found, return original decimal
  return num.toString();
}

/**
 * Parse ingredient text and convert decimal numbers to fractions
 * Examples:
 *   "1.5 cups flour" -> "1 ½ cups flour"
 *   "Add 0.25 tsp salt" -> "Add ¼ tsp salt"
 *   "2.333 cups sugar" -> "2 ⅓ cups sugar"
 */
export function formatIngredientWithFractions(ingredient: string): string {
  // Match decimal numbers (including those at the start or after spaces)
  // Pattern matches: optional sign, digits, decimal point, more digits
  const decimalPattern = /\b(\d+\.?\d*)\b/g;

  return ingredient.replace(decimalPattern, (match) => {
    const num = parseFloat(match);

    // Only convert if it's a valid number and has a decimal part
    if (!isNaN(num) && !Number.isInteger(num)) {
      return decimalToFraction(num);
    }

    return match;
  });
}
