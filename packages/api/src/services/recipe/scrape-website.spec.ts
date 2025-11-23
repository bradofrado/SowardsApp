/* eslint-disable @typescript-eslint/require-await -- ok */
/* eslint-disable @typescript-eslint/no-unsafe-call -- ok*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- ok*/
/* eslint-disable @typescript-eslint/no-explicit-any -- needed for mocking */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeScraper } from "./scrape-website";

// Mock fetch globally
global.fetch = vi.fn();

describe("RecipeScraper", () => {
  let scraper: RecipeScraper;

  beforeEach(() => {
    scraper = new RecipeScraper();
    vi.clearAllMocks();
  });

  describe("scrapeRecipe", () => {
    it("should successfully scrape recipe from JSON-LD", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@type": "Recipe",
              "name": "Chocolate Chip Cookies",
              "description": "Delicious homemade cookies",
              "image": "https://example.com/image.jpg",
              "prepTime": "PT15M",
              "cookTime": "PT12M",
              "totalTime": "PT27M",
              "recipeYield": "24 cookies",
              "recipeIngredient": ["2 cups flour", "1 cup sugar", "1 cup chocolate chips"],
              "recipeInstructions": ["Mix dry ingredients", "Add wet ingredients", "Bake at 350F"],
              "author": { "name": "John Doe" },
              "datePublished": "2024-01-01",
              "recipeCategory": "Dessert",
              "recipeCuisine": "American",
              "keywords": "cookies, chocolate, dessert",
              "nutrition": {
                "calories": "200 calories",
                "proteinContent": "3g",
                "carbohydrateContent": "25g",
                "fatContent": "10g"
              }
            }
            </script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Chocolate Chip Cookies");
      expect(result?.description).toBe("Delicious homemade cookies");
      expect(result?.image).toBe("https://example.com/image.jpg");
      expect(result?.prepTime).toBe("PT15M");
      expect(result?.cookTime).toBe("PT12M");
      expect(result?.totalTime).toBe("PT27M");
      expect(result?.recipeYield).toBe("24 cookies");
      expect(result?.ingredients).toEqual([
        "2 cups flour",
        "1 cup sugar",
        "1 cup chocolate chips",
      ]);
      expect(result?.instructions).toEqual([
        "Mix dry ingredients",
        "Add wet ingredients",
        "Bake at 350F",
      ]);
      expect(result?.author).toBe("John Doe");
      expect(result?.datePublished).toBe("2024-01-01");
      expect(result?.recipeCategory).toBe("Dessert");
      expect(result?.recipeCuisine).toBe("American");
      expect(result?.keywords).toEqual(["cookies", "chocolate", "dessert"]);
      expect(result?.nutrition).toEqual({
        calories: "200 calories",
        protein: "3g",
        carbohydrates: "25g",
        fat: "10g",
      });
    });

    it("should handle JSON-LD with @graph array", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@graph": [
                { "@type": "WebSite", "name": "Recipe Site" },
                {
                  "@type": "Recipe",
                  "name": "Pasta Recipe",
                  "recipeIngredient": ["pasta", "sauce"],
                  "recipeInstructions": ["Boil pasta", "Add sauce"]
                }
              ]
            }
            </script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Pasta Recipe");
      expect(result?.ingredients).toEqual(["pasta", "sauce"]);
      expect(result?.instructions).toEqual(["Boil pasta", "Add sauce"]);
    });

    it("should handle JSON-LD array format", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            [
              { "@type": "WebSite", "name": "Recipe Site" },
              {
                "@type": "Recipe",
                "name": "Salad Recipe",
                "recipeIngredient": ["lettuce", "tomatoes"],
                "recipeInstructions": "Mix all ingredients"
              }
            ]
            </script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Salad Recipe");
      expect(result?.ingredients).toEqual(["lettuce", "tomatoes"]);
      expect(result?.instructions).toEqual(["Mix all ingredients"]);
    });

    it("should handle JSON-LD array format with array type", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            [
              { "@type": "WebSite", "name": "Recipe Site" },
              {
                "@type": ["Recipe", "NewsArticle"],
                "name": "Salad Recipe",
                "recipeIngredient": ["lettuce", "tomatoes"],
                "recipeInstructions": "Mix all ingredients"
              }
            ]
            </script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Salad Recipe");
      expect(result?.ingredients).toEqual(["lettuce", "tomatoes"]);
      expect(result?.instructions).toEqual(["Mix all ingredients"]);
    });

    it("should fallback to microdata when JSON-LD is not available", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <div itemscope itemtype="https://schema.org/Recipe">
              <h1 itemprop="name">Microdata Recipe</h1>
              <p itemprop="description">From microdata</p>
              <img itemprop="image" src="https://example.com/micro.jpg" />
              <meta itemprop="prepTime" content="PT20M" />
              <meta itemprop="cookTime" content="PT30M" />
              <meta itemprop="totalTime" content="PT50M" />
              <span itemprop="recipeYield">4 servings</span>
              <ul>
                <li itemprop="recipeIngredient">ingredient 1</li>
                <li itemprop="recipeIngredient">ingredient 2</li>
              </ul>
              <ol>
                <li itemprop="recipeInstructions">step 1</li>
                <li itemprop="recipeInstructions">step 2</li>
              </ol>
              <span itemprop="author">Jane Smith</span>
            </div>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Microdata Recipe");
      expect(result?.description).toBe("From microdata");
      expect(result?.image).toBe("https://example.com/micro.jpg");
      expect(result?.prepTime).toBe("PT20M");
      expect(result?.cookTime).toBe("PT30M");
      expect(result?.totalTime).toBe("PT50M");
      expect(result?.recipeYield).toBe("4 servings");
      expect(result?.ingredients).toEqual(["ingredient 1", "ingredient 2"]);
      expect(result?.instructions).toEqual(["step 1", "step 2"]);
      expect(result?.author).toBe("Jane Smith");
    });

    it("should fallback to HTML patterns when structured data is not available", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:image" content="https://example.com/fallback.jpg" />
          </head>
          <body>
            <h1>Fallback Recipe</h1>
            <div class="ingredients">
              <ul>
                <li>item 1</li>
                <li>item 2</li>
              </ul>
            </div>
            <div class="instructions">
              <ol>
                <li>instruction 1</li>
                <li>instruction 2</li>
              </ol>
            </div>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Fallback Recipe");
      expect(result?.image).toBe("https://example.com/fallback.jpg");
      expect(result?.ingredients).toEqual(["item 1", "item 2"]);
      expect(result?.instructions).toEqual(["instruction 1", "instruction 2"]);
    });

    it("should return null when no recipe data is found", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>No recipe here</p>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).toBeNull();
    });

    it("should return null on fetch error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).toBeNull();
    });

    it("should return null on network error", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).toBeNull();
    });

    it("should handle malformed JSON-LD gracefully", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            { this is not valid json }
            </script>
          </head>
          <body>
            <h1>Recipe Title</h1>
            <div class="ingredients">
              <ul><li>ingredient</li></ul>
            </div>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      // Should fall back to HTML parsing
      expect(result).not.toBeNull();
      expect(result?.title).toBe("Recipe Title");
      expect(result?.ingredients).toEqual(["ingredient"]);
    });
  });

  describe("extractImage", () => {
    it("should handle string image URL", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "image": "https://example.com/image.jpg", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.image).toBe("https://example.com/image.jpg");
    });

    it("should handle array of images", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "image": ["https://example.com/1.jpg", "https://example.com/2.jpg"], "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.image).toBe("https://example.com/1.jpg");
    });

    it("should handle image object with url property", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "image": { "url": "https://example.com/image.jpg" }, "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.image).toBe("https://example.com/image.jpg");
    });

    it("should handle undefined image", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.image).toBeUndefined();
    });
  });

  describe("extractAuthor", () => {
    it("should handle string author", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "author": "John Doe", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.author).toBe("John Doe");
    });

    it("should handle author object with name property", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "author": { "name": "Jane Smith" }, "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.author).toBe("Jane Smith");
    });

    it("should handle undefined author", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.author).toBeUndefined();
    });
  });

  describe("normalizeYield", () => {
    it("should handle string yield", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeYield": "4 servings", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.recipeYield).toBe("4 servings");
    });

    it("should handle number yield", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeYield": 6, "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.recipeYield).toBe("6");
    });

    it("should handle array yield", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeYield": ["8 servings", "1 loaf"], "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.recipeYield).toBe("8 servings");
    });

    it("should handle undefined yield", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.recipeYield).toBeUndefined();
    });
  });

  describe("normalizeArray", () => {
    it("should handle array input", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "keywords": ["tag1", "tag2", "tag3"], "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.keywords).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should handle comma-separated string", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "keywords": "tag1, tag2, tag3", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.keywords).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should handle single string", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "keywords": "single-tag", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.keywords).toEqual(["single-tag"]);
    });

    it("should handle undefined value", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.keywords).toEqual([]);
    });
  });

  describe("normalizeInstructions", () => {
    it("should handle string array", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": ["step 1", "step 2", "step 3"] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual(["step 1", "step 2", "step 3"]);
    });

    it("should handle object array with text property", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [
          { "text": "step 1" },
          { "text": "step 2" }
        ]}
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual(["step 1", "step 2"]);
    });

    it("should handle nested itemListElement", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [
          { "itemListElement": [
            { "text": "nested step 1" },
            { "text": "nested step 2" }
          ]}
        ]}
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual(["nested step 1", "nested step 2"]);
    });

    it("should handle single string instruction", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": "Mix all ingredients together" }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual(["Mix all ingredients together"]);
    });

    it("should handle undefined instructions", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual([]);
    });

    it("should filter out empty strings", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": ["step 1", "", "step 2", null, "step 3"] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.instructions).toEqual(["step 1", "step 2", "step 3"]);
    });
  });

  describe("extractNutrition", () => {
    it("should extract all nutrition fields", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [], "nutrition": {
          "calories": "250 calories",
          "proteinContent": "12g",
          "carbohydrateContent": "30g",
          "fatContent": "8g"
        }}
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.nutrition).toEqual({
        calories: "250 calories",
        protein: "12g",
        carbohydrates: "30g",
        fat: "8g",
      });
    });

    it("should handle partial nutrition data", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [], "nutrition": {
          "calories": "200 calories"
        }}
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.nutrition).toEqual({
        calories: "200 calories",
        protein: undefined,
        carbohydrates: undefined,
        fat: undefined,
      });
    });

    it("should handle undefined nutrition", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.nutrition).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle recipes with minimal data", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Minimal Recipe", "recipeIngredient": ["ingredient"], "recipeInstructions": ["instruction"] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Minimal Recipe");
      expect(result?.ingredients).toEqual(["ingredient"]);
      expect(result?.instructions).toEqual(["instruction"]);
      expect(result?.description).toBe("");
      expect(result?.prepTime).toBe("");
      expect(result?.cookTime).toBe("");
    });

    it("should handle empty arrays in recipe data", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Empty Data", "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Empty Data");
      expect(result?.ingredients).toEqual([]);
      expect(result?.instructions).toEqual([]);
    });

    it("should handle category and cuisine as arrays", async () => {
      const mockHtml = `
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Test", "recipeCategory": ["Dessert", "Snack"], "recipeCuisine": ["Italian", "Mediterranean"], "recipeIngredient": [], "recipeInstructions": [] }
        </script>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result?.recipeCategory).toBe("Dessert");
      expect(result?.recipeCuisine).toBe("Italian");
    });

    it("should handle multiple JSON-LD scripts and find the recipe", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            { "@type": "WebSite", "name": "Example Site" }
            </script>
            <script type="application/ld+json">
            { "@type": "Organization", "name": "Example Org" }
            </script>
            <script type="application/ld+json">
            { "@type": "Recipe", "name": "Found Recipe", "recipeIngredient": ["item"], "recipeInstructions": ["step"] }
            </script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await scraper.scrapeRecipe("https://example.com/recipe");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Found Recipe");
    });
  });
});
