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

  Recipe.associate = function (models) {
    Recipe.belongsTo(models.User);
    Recipe.belongsToMany(models.Ingredient, {
      through: models.RecipeIngredient,
      foreignKey: 'recipeId',
      otherKey: 'ingredientId',
    });
  };

  return Recipe;
};
