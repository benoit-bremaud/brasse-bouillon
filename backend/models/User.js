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
  }, {
    tableName: 'users', // Nom explicite de la table
    timestamps: true,   // createdAt & updatedAt activés
  });

  User.associate = function () {
    // Relations à ajouter ici plus tard (ex: User.hasMany(models.Recipe))
  };

  return User;
};
