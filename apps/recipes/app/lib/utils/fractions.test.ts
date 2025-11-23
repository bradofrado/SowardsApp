import { describe, it, expect } from "vitest";
import { decimalToFraction, formatIngredientWithFractions } from "./fractions";

describe("fractions utility", () => {
  describe("decimalToFraction", () => {
    it("should convert common halves", () => {
      expect(decimalToFraction(0.5)).toBe("½");
      expect(decimalToFraction(1.5)).toBe("1 ½");
      expect(decimalToFraction(2.5)).toBe("2 ½");
    });

    it("should convert quarters", () => {
      expect(decimalToFraction(0.25)).toBe("¼");
      expect(decimalToFraction(0.75)).toBe("¾");
      expect(decimalToFraction(1.25)).toBe("1 ¼");
      expect(decimalToFraction(2.75)).toBe("2 ¾");
    });

    it("should convert thirds", () => {
      expect(decimalToFraction(0.333)).toBe("⅓");
      expect(decimalToFraction(0.667)).toBe("⅔");
      expect(decimalToFraction(1.333)).toBe("1 ⅓");
      expect(decimalToFraction(2.667)).toBe("2 ⅔");
    });

    it("should convert eighths", () => {
      expect(decimalToFraction(0.125)).toBe("⅛");
      expect(decimalToFraction(0.375)).toBe("⅜");
      expect(decimalToFraction(0.625)).toBe("⅝");
      expect(decimalToFraction(0.875)).toBe("⅞");
      expect(decimalToFraction(1.125)).toBe("1 ⅛");
      expect(decimalToFraction(2.875)).toBe("2 ⅞");
    });

    it("should convert fifths", () => {
      expect(decimalToFraction(0.2)).toBe("⅕");
      expect(decimalToFraction(0.4)).toBe("⅖");
      expect(decimalToFraction(0.6)).toBe("⅗");
      expect(decimalToFraction(0.8)).toBe("⅘");
      expect(decimalToFraction(1.2)).toBe("1 ⅕");
    });

    it("should convert sixths", () => {
      expect(decimalToFraction(0.167)).toBe("⅙");
      expect(decimalToFraction(0.833)).toBe("⅚");
      expect(decimalToFraction(1.167)).toBe("1 ⅙");
    });

    it("should handle whole numbers", () => {
      expect(decimalToFraction(1)).toBe("1");
      expect(decimalToFraction(2)).toBe("2");
      expect(decimalToFraction(10)).toBe("10");
    });

    it("should handle decimals that don't match common fractions", () => {
      expect(decimalToFraction(1.144)).toBe("1.144");
      expect(decimalToFraction(2.999)).toBe("2.999");
    });

    it("should handle tolerance in matching", () => {
      // These should be close enough to match
      expect(decimalToFraction(0.334)).toBe("⅓");
      expect(decimalToFraction(0.666)).toBe("⅔");
      expect(decimalToFraction(0.124)).toBe("⅛");
      expect(decimalToFraction(0.126)).toBe("⅛");
    });
  });

  describe("formatIngredientWithFractions", () => {
    it("should format simple ingredient strings", () => {
      expect(formatIngredientWithFractions("1.5 cups flour")).toBe(
        "1 ½ cups flour",
      );
      expect(formatIngredientWithFractions("0.25 tsp salt")).toBe("¼ tsp salt");
      expect(formatIngredientWithFractions("2.333 cups sugar")).toBe(
        "2 ⅓ cups sugar",
      );
    });

    it("should handle multiple numbers in one string", () => {
      expect(
        formatIngredientWithFractions("1.5 cups flour and 0.5 cups sugar"),
      ).toBe("1 ½ cups flour and ½ cups sugar");
    });

    it("should handle numbers at different positions", () => {
      expect(formatIngredientWithFractions("Add 0.25 tsp of salt")).toBe(
        "Add ¼ tsp of salt",
      );
      expect(formatIngredientWithFractions("Salt: 0.5 tsp")).toBe(
        "Salt: ½ tsp",
      );
    });

    it("should not modify whole numbers", () => {
      expect(formatIngredientWithFractions("2 cups flour")).toBe(
        "2 cups flour",
      );
      expect(formatIngredientWithFractions("10 eggs")).toBe("10 eggs");
    });

    it("should handle eighths correctly", () => {
      expect(formatIngredientWithFractions("1.125 cups flour")).toBe(
        "1 ⅛ cups flour",
      );
      expect(formatIngredientWithFractions("2.875 tsp vanilla")).toBe(
        "2 ⅞ tsp vanilla",
      );
    });

    it("should handle strings without numbers", () => {
      expect(formatIngredientWithFractions("Salt to taste")).toBe(
        "Salt to taste",
      );
      expect(formatIngredientWithFractions("Fresh herbs")).toBe("Fresh herbs");
    });

    it("should handle complex ingredient descriptions", () => {
      expect(
        formatIngredientWithFractions("1.5 cups all-purpose flour, sifted"),
      ).toBe("1 ½ cups all-purpose flour, sifted");
      expect(formatIngredientWithFractions("0.333 cup butter, melted")).toBe(
        "⅓ cup butter, melted",
      );
    });

    it("should leave decimals that don't match fractions unchanged", () => {
      expect(formatIngredientWithFractions("1.234 cups flour")).toBe(
        "1.234 cups flour",
      );
      expect(formatIngredientWithFractions("2.777 tsp salt")).toBe(
        "2.777 tsp salt",
      );
    });

    it("should handle real-world ingredient examples", () => {
      expect(formatIngredientWithFractions("2.5 cups all-purpose flour")).toBe(
        "2 ½ cups all-purpose flour",
      );
      expect(formatIngredientWithFractions("0.75 cup granulated sugar")).toBe(
        "¾ cup granulated sugar",
      );
      expect(formatIngredientWithFractions("1.333 cups brown sugar")).toBe(
        "1 ⅓ cups brown sugar",
      );
      expect(formatIngredientWithFractions("0.5 teaspoon baking soda")).toBe(
        "½ teaspoon baking soda",
      );
      expect(formatIngredientWithFractions("0.25 teaspoon salt")).toBe(
        "¼ teaspoon salt",
      );
      expect(formatIngredientWithFractions("1.125 cups chocolate chips")).toBe(
        "1 ⅛ cups chocolate chips",
      );
    });
  });
});
