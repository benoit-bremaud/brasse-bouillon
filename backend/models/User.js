/**
 * User model definition
 * Represents an account with authentication credentials
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']],
      },
    }
  }, {
    tableName: 'users', // Nom explicite de la table
    timestamps: true,   // createdAt & updatedAt activés
  });

  /**
   * Automatically hides password when sending JSON responses
   */
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };
  
  /**
   * Sequelize associations
   * - hasMany Recipe (one user can create many recipes)
   * - belongsToMany Recipe via Favorite (many-to-many favorites)
   */
  User.associate = function (models) {
    // One User can create many Recipes
    User.hasMany(models.Recipe);
    
    // A User can favorite many Recipes
    User.belongsToMany(models.Recipe, {
      through: models.Favorite,
      as: 'favorites',
      foreignKey: 'userId',
      otherKey: 'recipeId',
    });
  };

  return User;
};
