/* eslint-disable @typescript-eslint/prefer-for-of -- for-of loop not preferred for cheerio iteration */
/* eslint-disable no-console -- console.log used for example/debug output */
import * as cheerio from "cheerio";

interface Recipe {
  title: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  ingredients: string[];
  instructions: string[];
  author?: string;
  datePublished?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string[];
  nutrition?: {
    calories?: string;
    protein?: string;
    carbohydrates?: string;
    fat?: string;
  };
}

// JSON-LD structured data types
interface JsonLdRecipe {
  "@type": string;
  name?: string;
  description?: string;
  image?: string | string[] | { url: string };
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string | number | (string | number)[];
  recipeIngredient?: string | string[];
  recipeInstructions?:
    | string
    | string[]
    | { text?: string; itemListElement?: JsonLdInstruction[] }[];
  author?: string | { name: string };
  datePublished?: string;
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string | string[];
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
  };
}

interface JsonLdInstruction {
  text?: string;
  itemListElement?: JsonLdInstruction[];
}

interface JsonLdData {
  "@type"?: string;
  "@graph"?: JsonLdRecipe[];
  [key: string]: unknown;
}

type JsonLdInput = JsonLdData | JsonLdRecipe | (JsonLdData | JsonLdRecipe)[];

// Type guard functions
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecipeType(data: unknown): data is JsonLdRecipe {
  return isObject(data) && data["@type"] === "Recipe";
}

function hasGraph(data: unknown): data is { "@graph": JsonLdRecipe[] } {
  return isObject(data) && Array.isArray(data["@graph"]);
}

export class RecipeScraper {
  /**
   * Main method to scrape recipe from a URL
   */
  async scrapeRecipe(url: string): Promise<Recipe | null> {
    try {
      const html = await this.fetchHtml(url);
      const $ = cheerio.load(html);

      // Try JSON-LD first (most reliable)
      const jsonLdRecipe = this.extractFromJsonLd($);
      if (jsonLdRecipe) {
        return jsonLdRecipe;
      }

      // Fallback to schema.org microdata
      const microdataRecipe = this.extractFromMicrodata($);
      if (microdataRecipe) {
        return microdataRecipe;
      }

      // Fallback to common HTML patterns
      return this.extractFromHtml($);
    } catch (error) {
      console.error("Error scraping recipe:", error);
      return null;
    }
  }

  /**
   * Fetch HTML from URL
   */
  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  }

  /**
   * Extract recipe from JSON-LD structured data
   * This is the most reliable method as most recipe sites use schema.org
   */
  private extractFromJsonLd($: cheerio.CheerioAPI): Recipe | null {
    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      try {
        const content = $(scripts[i]).html();
        if (!content) continue;

        const data: JsonLdInput = JSON.parse(content) as JsonLdInput;
        const recipe = this.findRecipeInJsonLd(data);

        if (recipe) {
          return this.normalizeJsonLdRecipe(recipe);
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  /**
   * Recursively search for Recipe object in JSON-LD
   */
  private findRecipeInJsonLd(data: unknown): JsonLdRecipe | null {
    if (!data) return null;

    // Check if this is a Recipe
    if (isRecipeType(data)) {
      return data;
    }

    // Check in @graph array
    if (hasGraph(data)) {
      for (const item of data["@graph"]) {
        if (item["@type"] === "Recipe") {
          return item;
        }
      }
    }

    // Check if it's an array
    if (Array.isArray(data)) {
      for (const item of data) {
        const recipe = this.findRecipeInJsonLd(item);
        if (recipe) return recipe;
      }
    }

    return null;
  }

  /**
   * Normalize JSON-LD recipe data
   */
  private normalizeJsonLdRecipe(data: JsonLdRecipe): Recipe {
    return {
      title: data.name || "",
      description: data.description || "",
      image: this.extractImage(data.image),
      prepTime: data.prepTime || "",
      cookTime: data.cookTime || "",
      totalTime: data.totalTime || "",
      recipeYield: this.normalizeYield(data.recipeYield),
      ingredients: this.normalizeArray(data.recipeIngredient),
      instructions: this.normalizeInstructions(data.recipeInstructions),
      author: this.extractAuthor(data.author),
      datePublished: data.datePublished || "",
      recipeCategory: this.normalizeArray(data.recipeCategory)[0] || "",
      recipeCuisine: this.normalizeArray(data.recipeCuisine)[0] || "",
      keywords: this.normalizeArray(data.keywords),
      nutrition: this.extractNutrition(data.nutrition),
    };
  }

  /**
   * Extract image URL from various formats
   */
  private extractImage(
    image: string | string[] | { url: string } | undefined,
  ): string | undefined {
    if (!image) return undefined;
    if (typeof image === "string") return image;
    if (Array.isArray(image)) return image[0];
    if (isObject(image) && "url" in image && typeof image.url === "string") {
      return image.url;
    }
    return undefined;
  }

  /**
   * Extract author name
   */
  private extractAuthor(
    author: string | { name: string } | undefined,
  ): string | undefined {
    if (!author) return undefined;
    if (typeof author === "string") return author;
    if (
      isObject(author) &&
      "name" in author &&
      typeof author.name === "string"
    ) {
      return author.name;
    }
    return undefined;
  }

  /**
   * Normalize yield (servings)
   */
  private normalizeYield(
    recipeYield: string | number | (string | number)[] | undefined,
  ): string | undefined {
    if (!recipeYield) return undefined;
    if (typeof recipeYield === "string") return recipeYield;
    if (typeof recipeYield === "number") return recipeYield.toString();
    if (Array.isArray(recipeYield)) {
      const first = recipeYield[0];
      return first ? String(first) : undefined;
    }
    return undefined;
  }

  /**
   * Normalize arrays (handles strings, arrays, comma-separated)
   */
  private normalizeArray(value: string | string[] | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") {
      return value.includes(",")
        ? value.split(",").map((s) => s.trim())
        : [value];
    }
    return [];
  }

  /**
   * Normalize instructions (handles various formats)
   */
  private normalizeInstructions(
    instructions: JsonLdRecipe["recipeInstructions"],
  ): string[] {
    if (!instructions) return [];

    if (Array.isArray(instructions)) {
      return instructions
        .map((step) => {
          if (typeof step === "string") return step;
          if (
            isObject(step) &&
            "text" in step &&
            typeof step.text === "string"
          ) {
            return step.text;
          }
          if (
            isObject(step) &&
            "itemListElement" in step &&
            Array.isArray(step.itemListElement)
          ) {
            return this.normalizeInstructions(step.itemListElement);
          }
          return "";
        })
        .flat()
        .filter(Boolean);
    }

    if (typeof instructions === "string") {
      return [instructions];
    }

    return [];
  }

  /**
   * Extract nutrition information
   */
  private extractNutrition(
    nutrition: JsonLdRecipe["nutrition"],
  ): Recipe["nutrition"] | undefined {
    if (!nutrition) return undefined;

    return {
      calories: nutrition.calories || undefined,
      protein: nutrition.proteinContent || undefined,
      carbohydrates: nutrition.carbohydrateContent || undefined,
      fat: nutrition.fatContent || undefined,
    };
  }

  /**
   * Extract from microdata (schema.org markup in HTML)
   */
  private extractFromMicrodata($: cheerio.CheerioAPI): Recipe | null {
    const recipeEl = $('[itemtype*="schema.org/Recipe"]');
    if (recipeEl.length === 0) return null;

    return {
      title: recipeEl.find('[itemprop="name"]').text().trim() || "",
      description: recipeEl.find('[itemprop="description"]').text().trim(),
      image:
        recipeEl.find('[itemprop="image"]').attr("src") ||
        recipeEl.find('[itemprop="image"]').attr("content"),
      prepTime: recipeEl.find('[itemprop="prepTime"]').attr("content"),
      cookTime: recipeEl.find('[itemprop="cookTime"]').attr("content"),
      totalTime: recipeEl.find('[itemprop="totalTime"]').attr("content"),
      recipeYield: recipeEl.find('[itemprop="recipeYield"]').text().trim(),
      ingredients: recipeEl
        .find('[itemprop="recipeIngredient"]')
        .map((_, el) => $(el).text().trim())
        .get(),
      instructions: recipeEl
        .find('[itemprop="recipeInstructions"]')
        .map((_, el) => $(el).text().trim())
        .get(),
      author: recipeEl.find('[itemprop="author"]').text().trim(),
    };
  }

  /**
   * Fallback: Extract from common HTML patterns
   */
  private extractFromHtml($: cheerio.CheerioAPI): Recipe | null {
    // Common selectors for recipe components
    const titleSelectors = [
      "h1",
      ".recipe-title",
      ".entry-title",
      '[class*="title"]',
    ];
    const ingredientSelectors = [
      ".ingredients li",
      '[class*="ingredient"]',
      ".recipe-ingredients li",
    ];
    const instructionSelectors = [
      ".instructions li",
      '[class*="instruction"]',
      ".recipe-instructions li",
      ".directions li",
    ];

    const title = this.findFirstMatch($, titleSelectors);
    const ingredients = this.findAllMatches($, ingredientSelectors);
    const instructions = this.findAllMatches($, instructionSelectors);

    if (!title && ingredients.length === 0) {
      return null;
    }

    return {
      title: title || "",
      ingredients,
      instructions,
      image:
        $('meta[property="og:image"]').attr("content") ||
        $("img").first().attr("src"),
    };
  }

  /**
   * Find first matching element text
   */
  private findFirstMatch($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    return "";
  }

  /**
   * Find all matching elements text
   */
  private findAllMatches($: cheerio.CheerioAPI, selectors: string[]): string[] {
    for (const selector of selectors) {
      const items = $(selector)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);
      if (items.length > 0) return items;
    }
    return [];
  }
}
