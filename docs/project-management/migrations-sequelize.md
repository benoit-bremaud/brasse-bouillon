# Managing Sequelize Migrations in a Dockerized Node.js Environment

This guide explains how to create and run Sequelize migrations inside a Docker-based Node.js environment, as used in the Brasse-Bouillon project.

---

## Context

In Brasse-Bouillon, we use:

* `Sequelize` as the ORM
* `MySQL` in a Docker container (service named `db`)
* A backend Node.js service (Docker container named `backend`)

> **Note:** Sequelize migrations must be executed from **inside the backend container** because the hostname `db` is only resolvable within the Docker Compose network.

---

## Migration Workflow

### 1. Generate a Migration

Run the following command to generate a new migration file:

```bash
npx sequelize-cli migration:generate --name create-xyz
```

This creates a file in the `migrations/` folder, e.g., `20250526112808-create-xyz.js`.

### 2. Edit the Migration File

Fill in the `up()` method to define the table structure:

```js
await queryInterface.createTable('favorites', {
  userId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  recipeId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'recipes', key: 'id' },
    onDelete: 'CASCADE',
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});
```

The `down()` method should undo the migration by dropping the table:

```js
await queryInterface.dropTable('favorites');
```

### 3. Run the Migration Inside the Backend Container

Execute the migration from within the backend container:

```bash
docker compose exec backend npx sequelize-cli db:migrate --config config/config.js
```

This ensures:

* The correct config file is used (`config.js` instead of `config.json`)
* The container has access to the `db` host

Expected output:

```text
== 20250526112808-create-favorite: migrated successfully.
```

---

## Verifying the Migration in MySQL (Optional)

To inspect the database state manually:

```bash
docker compose exec db mysql -u root -p
```

Then inside the MySQL shell:

```sql
USE brasse_bouillon;
SHOW TABLES;
DESCRIBE favorites;
```

---

## Notes

### Migration Storage and Tracking

* All migration files are stored in `backend/migrations/`
* Sequelize records all executed migrations in the table `SequelizeMeta`

### Development Utilities

To undo the last executed migration:

```bash
npx sequelize-cli db:migrate:undo --config config/config.js
```

---

## Best Practices

* **Never** edit a migration after it has been applied to production
* Instead, always create a new migration for any change (e.g., `add-column`, `drop-table`)
* Use meaningful and consistent naming:

  * `create-favorite`
  * `add-abv-column`
  * `drop-obsolete-table`

---

## Related Resources

* [Sequelize CLI Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
* [Backend Setup Guide](../architecture/backend/setup_backend.md)
