/**
 * Recipe model definition
 * Represents a brewing recipe created by a user
 */
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    abv: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ibu: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {
    tableName: 'recipes',
    timestamps: true,
  });

  /**
   * Sequelize associations
   * - belongsTo User (author)
   * - belongsToMany Ingredient through RecipeIngredient
   * - belongsToMany User through Favorite (likedBy)
   */
  Recipe.associate = function (models) {
    // The recipe is created by a user
    Recipe.belongsTo(models.User);

    // a recipe can have many ingredients
    Recipe.belongsToMany(models.Ingredient, {
      through: models.RecipeIngredient,
      foreignKey: 'recipeId',
      otherKey: 'ingredientId',
    });

    // A recipe can be favorited by many users
    Recipe.belongsToMany(models.User, {
      through: models.Favorite,
      foreignKey: 'recipeId',
      otherKey: 'userId',
      as: 'likedBy', // Alias for clarity
    });
  };

  return Recipe;
};
