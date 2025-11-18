import { Recipe, RecipeCategory } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const recipeCollection = db.collection("Recipe");
  const recipeCategoryCollection = db.collection("RecipeCategory");

  // Step 1: Migrate recipes from categoryId to categoryIds array
  const recipesWithCategory = await recipeCollection
    .find({ categoryId: { $exists: true, $ne: null } })
    .toArray();

  let recipesUpdated = 0;
  for (const recipe of recipesWithCategory) {
    const categoryId = (recipe as any).categoryId;
    if (categoryId) {
      await recipeCollection.updateOne(
        { _id: recipe._id },
        {
          $set: { categoryIds: [categoryId] },
          $unset: { categoryId: "" },
        },
      );
      recipesUpdated++;
    }
  }

  // Step 2: Set empty categoryIds array for recipes without categories
  const recipesWithoutCategory = await recipeCollection
    .find({ categoryId: { $exists: false } })
    .toArray();

  for (const recipe of recipesWithoutCategory) {
    if (!(recipe as any).categoryIds) {
      await recipeCollection.updateOne(
        { _id: recipe._id },
        { $set: { categoryIds: [] } },
      );
    }
  }

  // Step 3: Update recipe categories to add recipeIds array
  const categories = await recipeCategoryCollection.find({}).toArray();

  let categoriesUpdated = 0;
  for (const category of categories) {
    // Find all recipes that have this category in their categoryIds
    const recipesInCategory = await recipeCollection
      .find({ categoryIds: category._id })
      .toArray();

    const recipeIds = recipesInCategory.map((recipe) => recipe._id.toString());

    await recipeCategoryCollection.updateOne(
      { _id: category._id },
      { $set: { recipeIds } },
    );
    categoriesUpdated++;
  }

  return `Migration completed:
- Updated ${recipesUpdated} recipes with existing categories to use categoryIds array
- Updated ${recipesWithoutCategory.length} recipes without categories to have empty categoryIds array
- Updated ${categoriesUpdated} categories with recipeIds arrays`;
};

export default runMigration;
