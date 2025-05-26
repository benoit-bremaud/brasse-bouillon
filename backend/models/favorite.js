/**
 * Favorite model definition
 * Represents a many-to-many relationship between User and Recipe
 */

module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: 'favorites',
    timestamps: true, // pour suivre l'ajout d'un favori
  });

  Favorite.associate = function (models) {
    Favorite.belongsTo(models.User, { foreignKey: 'userId' });
    Favorite.belongsTo(models.Recipe, { foreignKey: 'recipeId' });
  };

  return Favorite;
};
