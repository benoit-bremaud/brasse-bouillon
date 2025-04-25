/**
 * Script to test the many-to-many relationship
 * between Recipe and Ingredient via RecipeIngredient
 */

const db = require('../models');

async function runTest() {
  try {
    // Création d'ingrédients
    const malt = await db.Ingredient.create({ name: 'Malt Pale', unit: 'kg', type: 'malt' });
    const houblon = await db.Ingredient.create({ name: 'Houblon Simcoe', unit: 'g', type: 'hop' });

    // Création de recette
    const recipe = await db.Recipe.create({
      name: 'Punk IPA',
      description: 'Une IPA bien amère',
      instructions: '1. Empâter... 2. Ébullition... 3. Fermentation...',
    });

    // Association avec quantités
    await recipe.addIngredient(malt, { through: { quantity: 5, unit: 'kg' } });
    await recipe.addIngredient(houblon, { through: { quantity: 100, unit: 'g' } });

    console.log('✅ Test terminé : recette et ingrédients liés avec succès.');
  } catch (error) {
    console.error('❌ Erreur pendant le test de liaison :', error);
  } finally {
    await db.sequelize.close();
  }
}

runTest();
