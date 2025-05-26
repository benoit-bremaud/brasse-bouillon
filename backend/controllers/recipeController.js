// controllers/recipeController.js

const db = require('../models');
const Recipe = db.Recipe; 
const RecipeIngredient = db.RecipeIngredient;
const Ingredient = db.Ingredient;

/**
 * GET /recipes
 * Fetch all recipes
 */
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /recipes/:id
 * Fetch a specific recipe by ID with its associated ingredients
 */
const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findByPk(id, {
      include: {
        model: Ingredient,
        through: { attributes: ['quantity', 'unit'] },
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/**
 * POST /recipes
 * Create a new recipe (requires authentication)
 */
const createRecipe = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { name, description, instructions, abv, ibu, ingredients } = req.body;

    // Minimal validation
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    // Create the recipe
    const newRecipe = await Recipe.create({
      name,
      description,
      instructions,
      abv,
      ibu,
      userId, // Associate recipe with the user
    });

    // If ingredients are provided, create entries in RecipeIngredient
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const ingredientEntries = ingredients.map((item) => ({
        recipeId: newRecipe.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      await RecipeIngredient.bulkCreate(ingredientEntries);
    }

    res.status(201)
      .location(`/recipes/${newRecipe.id}`)
      .json({
      message: '✅ Recipe successfully created.',
      received: newRecipe
    });
  } catch (error) {
    console.error('Error in createRecipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Update a recipe by its ID (only allowed for the creator).
 * Route: PUT /recipes/:id
 * Access: Private (JWT required)
 */
const updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    // Retrieve the recipe by ID
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    console.log('DEBUG ownership:', {
      recipeUserId: recipe.userId,
      reqUserId: userId,
      typeofRecipeUserId: typeof recipe.userId,
      typeofReqUserId: typeof userId,
    });
    
    // Ownership check
    if (recipe.UserId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this recipe' });
    }

    // Extract allowed fields from request body
    const { name, description, instructions, abv, ibu, ingredients } = req.body;

    // Minimal validation: name and description are required if provided
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }

    // Update main recipe fields (only if provided)
    await recipe.update({
      name: name !== undefined ? name : recipe.name,
      description: description !== undefined ? description : recipe.description,
      instructions: instructions !== undefined ? instructions : recipe.instructions,
      abv: abv !== undefined ? abv : recipe.abv,
      ibu: ibu !== undefined ? ibu : recipe.ibu,
    });

    // Optional: Update ingredients if provided
    if (Array.isArray(ingredients)) {
      // Remove existing ingredients associations
      await RecipeIngredient.destroy({ where: { recipeId } });

      // Bulk create new associations
      const ingredientEntries = ingredients.map((item) => ({
        recipeId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      if (ingredientEntries.length > 0) {
        await RecipeIngredient.bulkCreate(ingredientEntries);
      }
    }

    // Fetch and return updated recipe with ingredients
    const updatedRecipe = await Recipe.findByPk(recipeId, {
      include: {
        model: Ingredient,
        through: { attributes: ['quantity', 'unit'] },
      },
    });

    return res.status(200).json({
      message: '✅ Recipe successfully updated.',
      updated: updatedRecipe
    });

  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



module.exports = {
  getAllRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe
};