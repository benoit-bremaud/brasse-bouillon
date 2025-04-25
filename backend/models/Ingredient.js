/**
 * Ingredient model definition
 * Represents a brewing ingredient (malt, hops, etc.)
 */

module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    unit: {
      type: DataTypes.STRING, // ex: 'g', 'kg', 'L', 'ml'
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING, // ex: 'malt', 'hop', 'yeast', 'sugar'
      allowNull: true,
    },
  }, {
    tableName: 'ingredients',
    timestamps: true,
  });

  Ingredient.associate = function () {
    // ex: Ingredient.belongsToMany(models.Recipe, { through: models.RecipeIngredient });
  };

  return Ingredient;
};
